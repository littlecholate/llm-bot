'use client';

import { memo } from 'react';
import { Bot, Trash2, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

function MessageBubble({ message, isLast, isLoading, onRegenerate, onDelete }) {
    const isAssistant = message.role === 'assistant';

    return (
        <div className={cn('flex group w-full gap-4', !isAssistant ? 'justify-end' : 'justify-start')}>
            {/* Bot Icon */}
            {isAssistant && (
                <div className="shrink-0 mt-1">
                    <div className="h-8 w-8 rounded border border-white/10 flex items-center justify-center bg-[#212121]">
                        <Bot className="h-6 w-6 text-white" />
                    </div>
                </div>
            )}

            {/* Message Bubble Content */}
            <div className={cn('flex flex-col max-w-[85%]', !isAssistant ? 'items-end' : 'items-start')}>
                <div
                    className={cn(
                        'rounded-xl px-4 py-3 text-[16px] leading-7 overflow-hidden',
                        !isAssistant
                            ? 'bg-[#3F3F46] text-white'
                            : cn(
                                  'bg-transparent text-gray-100 px-0 py-0 w-full',
                                  'prose prose-invert max-w-none wrap-break-word',
                                  'prose-p:leading-7 prose-pre:my-2 prose-pre:bg-[#1e1e1e] prose-pre:rounded-lg'
                              )
                    )}
                >
                    {!isAssistant ? (
                        message.content
                    ) : (
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                code({ node, inline, className, children, ...props }) {
                                    const match = /language-(\w+)/.exec(className || '');
                                    return !inline && match ? (
                                        <div className="relative group my-4 rounded-lg overflow-hidden border border-white/10">
                                            <div className="flex items-center justify-between bg-[#2d2d2d] px-3 py-1.5 text-xs text-gray-400 border-b border-white/5 select-none">
                                                <span>{match[1]}</span>
                                            </div>
                                            <SyntaxHighlighter
                                                style={vscDarkPlus}
                                                language={match[1]}
                                                PreTag="div"
                                                customStyle={{
                                                    margin: 0,
                                                    padding: '1rem',
                                                    background: '#1e1e1e',
                                                    fontSize: '0.875rem',
                                                }}
                                                {...props}
                                            >
                                                {String(children).replace(/\n$/, '')}
                                            </SyntaxHighlighter>
                                        </div>
                                    ) : (
                                        <code
                                            className={cn(
                                                'bg-white/10 text-rose-300 rounded px-1.5 py-0.5 text-sm font-mono',
                                                className
                                            )}
                                            {...props}
                                        >
                                            {children}
                                        </code>
                                    );
                                },
                            }}
                        >
                            {message.content}
                        </ReactMarkdown>
                    )}
                </div>

                {/* Actions Row */}
                <div className="flex items-center gap-2 mt-1 px-1">
                    {message.time && <span className="text-xs text-gray-500">{message.time}</span>}

                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        {isAssistant && isLast && (
                            <button
                                onClick={onRegenerate}
                                disabled={isLoading}
                                className={cn(
                                    'p-1.5 text-gray-500 hover:text-white transition-colors rounded-md hover:bg-[#3F3F46]',
                                    isLoading && 'animate-spin cursor-not-allowed'
                                )}
                                title="Regenerate"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        )}

                        <button
                            onClick={onDelete}
                            className="p-1.5 text-gray-500 hover:text-red-400 transition-colors rounded-md hover:bg-[#3F3F46]"
                            title="Delete"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default memo(MessageBubble);
