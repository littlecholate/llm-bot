'use client';

import { useEffect, useRef } from 'react';
import { Bot, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';
import { siteConfig } from '../lib/config';
import { useLLM } from '../hooks/useLLM';

export default function MessageList({ messages }) {
    const bottomRef = useRef(null);
    const { regenerate, isLoading } = useLLM();

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (!messages || messages.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in-95 duration-500">
                <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-[#2F2F2F] shadow-2xl shadow-black/20 ring-1 ring-white/5">
                    <Bot className="h-12 w-12 text-gray-400" />
                </div>
                <h2 className="mb-4 text-3xl font-bold text-white md:text-5xl tracking-tight">{siteConfig.welcome.title}</h2>
                <p className="max-w-md text-lg text-gray-400 leading-relaxed md:text-xl">
                    {siteConfig.welcome.subtitle}
                    <br />
                    {siteConfig.welcome.description}
                </p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="mx-auto max-w-3xl space-y-8 py-4">
                {messages.map((m, i) => {
                    const isLast = i === messages.length - 1;
                    const isAssistant = m.role === 'assistant';

                    return (
                        <div
                            key={i}
                            className={cn('flex group w-full gap-4', m.role === 'user' ? 'justify-end' : 'justify-start')}
                        >
                            {/* Bot Icon */}
                            {isAssistant && (
                                <div className="shrink-0 mt-1">
                                    <div className="h-8 w-8 rounded border border-white/10 flex items-center justify-center bg-[#212121]">
                                        <Bot className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                            )}

                            {/* Message Bubble */}
                            <div className={cn('flex flex-col max-w-[80%]', m.role === 'user' ? 'items-end' : 'items-start')}>
                                <div
                                    className={cn(
                                        'rounded-xl px-4 py-3 text-[16px] leading-7',
                                        m.role === 'user' ? 'bg-[#3F3F46] text-white' : 'bg-transparent text-gray-100 px-0 py-0'
                                    )}
                                >
                                    {m.content}
                                </div>
                                {/* Timestamp & Actions */}
                                <div className="flex items-center gap-2 mt-1">
                                    {m.time && <span className="text-xs text-gray-500">{m.time}</span>}

                                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        {isAssistant && isLast && (
                                            <button
                                                onClick={regenerate}
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
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* 滾動錨點：確保它在列表的最後面 */}
                <div ref={bottomRef} />
            </div>
        </div>
    );
}
