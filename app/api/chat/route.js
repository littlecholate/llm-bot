import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { DebugLogger } from '../../../lib/debug-utils';
import { allToolDefinitions, toolImplementations } from '../../../lib/tools/registry';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'edge';

export async function POST(req) {
    const logger = new DebugLogger('API/Chat');
    const startTotal = performance.now();

    try {
        const { messages, max_tokens } = await req.json();

        logger.log(`Received request with ${messages.length} messages`, 'info');

        // 1st Pass: Router & Tool Selection
        const runner = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: messages,
            // 動態注入所有工具定義
            tools: allToolDefinitions.length > 0 ? allToolDefinitions : undefined,
            tool_choice: allToolDefinitions.length > 0 ? 'auto' : 'none',
            stream: true,
            stream_options: { include_usage: true },
            max_tokens: max_tokens || undefined,
        });

        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                let toolCalls = [];
                let accumulatedUsage = null;

                try {
                    for await (const chunk of runner) {
                        const delta = chunk.choices[0]?.delta;

                        if (delta?.content) {
                            controller.enqueue(encoder.encode(delta.content));
                        }

                        if (delta?.tool_calls) {
                            delta.tool_calls.forEach((toolCall) => {
                                const index = toolCall.index;
                                if (!toolCalls[index]) {
                                    toolCalls[index] = toolCall;
                                    toolCalls[index].function.arguments = '';
                                }
                                if (toolCall.function?.name) {
                                    toolCalls[index].function.name = toolCall.function.name;
                                }
                                if (toolCall.function?.arguments) {
                                    toolCalls[index].function.arguments += toolCall.function.arguments;
                                }
                            });
                        }
                        if (chunk.usage) accumulatedUsage = chunk.usage;
                    }

                    // --- 處理工具呼叫 (Function Calling) ---
                    if (toolCalls.length > 0) {
                        logger.log(`Tool usage detected: ${toolCalls.length} calls`, 'warn');

                        messages.push({
                            role: 'assistant',
                            content: null,
                            tool_calls: toolCalls,
                        });

                        for (const toolCall of toolCalls) {
                            const functionName = toolCall.function.name;

                            // 修改執行邏輯：從 toolImplementations Map 查找
                            const functionToCall = toolImplementations[functionName];

                            if (!functionToCall) {
                                logger.log(`Tool ${functionName} not found in registry`, 'error');
                                messages.push({
                                    role: 'tool',
                                    tool_call_id: toolCall.id,
                                    name: functionName,
                                    content: JSON.stringify({ error: `Tool ${functionName} is not implemented.` }),
                                });
                                continue;
                            }

                            logger.time(`Tool_Exec_${functionName}`);
                            // 若有參數需在此解析 JSON.parse(toolCall.function.arguments)
                            const functionResponse = await functionToCall();
                            const duration = logger.timeEnd(`Tool_Exec_${functionName}`);

                            messages.push({
                                role: 'tool',
                                tool_call_id: toolCall.id,
                                name: functionName,
                                content: functionResponse,
                            });
                        }

                        // 2nd Pass: Final Generation
                        const finalStream = await openai.chat.completions.create({
                            model: 'gpt-4o-mini',
                            messages: messages,
                            stream: true,
                            stream_options: { include_usage: true },
                            max_tokens: max_tokens || undefined,
                        });

                        for await (const chunk of finalStream) {
                            const content = chunk.choices[0]?.delta?.content;
                            if (content) {
                                controller.enqueue(encoder.encode(content));
                            }
                            if (chunk.usage) {
                                if (accumulatedUsage) {
                                    accumulatedUsage.total_tokens += chunk.usage.total_tokens;
                                    accumulatedUsage.prompt_tokens += chunk.usage.prompt_tokens;
                                    accumulatedUsage.completion_tokens += chunk.usage.completion_tokens;
                                } else {
                                    accumulatedUsage = chunk.usage;
                                }
                            }
                        }
                    }
                } catch (err) {
                    console.error('Stream Process Error:', err);
                    try {
                        const encoder = new TextEncoder();
                        controller.enqueue(encoder.encode(`\n\n[系統錯誤: ${err.message}]`));
                    } catch (e) {}
                    controller.error(err);
                } finally {
                    const duration = (performance.now() - startTotal).toFixed(0);
                    logger.logSummary({ usage: accumulatedUsage, duration, steps: [] });
                    controller.close();
                }
            },
        });

        return new NextResponse(stream, {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
