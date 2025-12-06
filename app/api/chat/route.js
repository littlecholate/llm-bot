import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { DebugLogger } from '../../../lib/debug-utils';
import { getEventTop100, EVENT_TOOLS_DEF } from '../../../lib/tools/sekai-api';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'edge';

const AVAILABLE_TOOLS = {
    get_event_top100: getEventTop100,
};

export async function POST(req) {
    const logger = new DebugLogger('API/Chat');
    const startTotal = performance.now();

    try {
        // --- 修改點 1: 這裡多解構一個 max_tokens 參數 ---
        // 一般聊天室 (useLLM) 不會傳這個參數，所以會是 undefined
        const { messages, max_tokens } = await req.json();

        logger.log(`Received request with ${messages.length} messages`, 'info');

        // 第一次呼叫 (Judge/Router)
        const runner = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: messages,
            tools: EVENT_TOOLS_DEF,
            tool_choice: 'auto',
            stream: true,
            stream_options: { include_usage: true },
            // --- 修改點 2: 傳入限制 ---
            // 如果前端沒傳 (undefined)，這裡就不會送出 max_tokens 欄位，OpenAI 就會使用預設最大值
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

                        // 插入工具呼叫紀錄
                        messages.push({
                            role: 'assistant',
                            content: null,
                            tool_calls: toolCalls,
                        });

                        // 執行工具
                        for (const toolCall of toolCalls) {
                            const functionName = toolCall.function.name;
                            const functionToCall = AVAILABLE_TOOLS[functionName];

                            logger.time(`Tool_Exec_${functionName}`);
                            let functionResponse = functionToCall
                                ? await functionToCall()
                                : JSON.stringify({ error: 'Tool not found' });
                            const duration = logger.timeEnd(`Tool_Exec_${functionName}`);

                            messages.push({
                                role: 'tool',
                                tool_call_id: toolCall.id,
                                name: functionName,
                                content: functionResponse,
                            });
                        }

                        // 第二次呼叫 (Final Generation)
                        const finalStream = await openai.chat.completions.create({
                            model: 'gpt-4o-mini',
                            messages: messages,
                            stream: true,
                            stream_options: { include_usage: true },
                            // --- 修改點 3: 這裡也要傳入限制 ---
                            // 這是最重要的，因為這裡才是生成最終長文的地方
                            max_tokens: max_tokens || undefined,
                        });

                        for await (const chunk of finalStream) {
                            const content = chunk.choices[0]?.delta?.content;
                            if (content) {
                                controller.enqueue(encoder.encode(content));
                            }
                            if (chunk.usage) {
                                // 加總兩次呼叫的 Token (粗略計算)
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
                    console.error('Stream Process Error:', err); // 讓你在後端終端機看到真實錯誤
                    // 嘗試發送一個錯誤訊息給前端，而不是直接斷線 (若 controller 尚未 close)
                    try {
                        const encoder = new TextEncoder();
                        controller.enqueue(encoder.encode(`\n\n[系統錯誤: ${err.message}]`));
                    } catch (e) {
                        /* ignore */
                    }

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
