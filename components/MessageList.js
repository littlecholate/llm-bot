'use client';

import { useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import WelcomeScreen from './WelcomeScreen';
import MessageBubble from './MessageBubble';

export default function MessageList({ messages, isLoading, onRegenerate }) {
    const scrollContainerRef = useRef(null);
    const bottomRef = useRef(null);
    const { deleteMessage } = useChat();

    // 用來追蹤使用者是否正在查看歷史訊息
    const shouldAutoScrollRef = useRef(true);

    const handleScroll = () => {
        const container = scrollContainerRef.current;
        if (!container) return;

        // 判斷是否接近底部 (例如誤差 100px 內)
        const { scrollTop, scrollHeight, clientHeight } = container;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

        shouldAutoScrollRef.current = isNearBottom;
    };

    useEffect(() => {
        if (shouldAutoScrollRef.current) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    if (!messages || messages.length === 0) {
        return <WelcomeScreen />;
    }

    return (
        <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
            <div className="mx-auto max-w-3xl space-y-8 py-4">
                {messages.map((m, i) => (
                    <MessageBubble
                        key={m.id || i}
                        message={m}
                        isLast={i === messages.length - 1}
                        isLoading={isLoading}
                        onRegenerate={onRegenerate}
                        onDelete={() => deleteMessage(i)}
                    />
                ))}
                <div ref={bottomRef} />
            </div>
        </div>
    );
}
