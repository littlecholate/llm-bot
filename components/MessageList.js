'use client';

import { useEffect, useRef } from 'react'; // [新增] 引入 Hook
import { Bot } from 'lucide-react';
import { cn } from '../lib/utils';
import { siteConfig } from '../lib/config';

export default function MessageList({ messages }) {
    // [新增] 建立 Ref 來指向列表底部
    const bottomRef = useRef(null);

    // [新增] 當 messages 變動時，自動平滑滾動到底部
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // 1. 當沒有訊息時，顯示置中的大標題歡迎頁面 (保持不變)
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

    // 2. 當有訊息時，顯示一般的對話列表
    return (
        <div className="flex-1 overflow-y-auto p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="mx-auto max-w-3xl space-y-8 py-4">
                {messages.map((m, i) => (
                    <div key={i} className={cn('flex w-full gap-4', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                        {/* Bot Icon */}
                        {m.role === 'assistant' && (
                            <div className="flex-shrink-0 mt-1">
                                <div className="h-8 w-8 rounded border border-white/10 flex items-center justify-center bg-[#212121]">
                                    <Bot className="h-5 w-5 text-white" />
                                </div>
                            </div>
                        )}

                        {/* Message Bubble */}
                        <div className={cn('flex flex-col max-w-[80%]', m.role === 'user' ? 'items-end' : 'items-start')}>
                            <div
                                className={cn(
                                    'rounded-xl px-4 py-3 text-[15px] leading-7 shadow-sm',
                                    m.role === 'user' ? 'bg-[#3F3F46] text-white' : 'bg-transparent text-gray-100 px-0 py-0'
                                )}
                            >
                                {m.content}
                            </div>
                            {/* Timestamp */}
                            {m.time && <span className="mt-2 text-xs text-gray-500">{m.time}</span>}
                        </div>
                    </div>
                ))}

                {/* [新增] 滾動錨點：確保它在列表的最後面 */}
                <div ref={bottomRef} />
            </div>
        </div>
    );
}
