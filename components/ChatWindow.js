'use client';

import { useState } from 'react';
import MessageList from './MessageList';
import PromptBox from './PromptBox';
import { generateSystemPrompt } from '../lib/llm-config';
import { useChat } from '../context/ChatContext'; // 改用 Context

export default function ChatWindow() {
    const [input, setInput] = useState('');

    // 從 Context 取得資料與方法
    const { currentMessages, addMessage, clearCurrentMessages } = useChat();

    const handleSubmit = (e) => {
        e?.preventDefault();
        if (!input.trim()) return;

        // 1. 寫入 Context (會更新 Sidebar 標題)
        const userMsg = { role: 'user', content: input, time: 'Just now' };
        addMessage(userMsg);

        const currentInput = input;
        setInput('');

        // 2. 生成 System Prompt
        const savedLang = localStorage.getItem('hisekai_lang');
        const savedChar = localStorage.getItem('hisekai_char');
        const systemPromptContent = generateSystemPrompt({
            language: savedLang,
            character: savedChar,
        });

        const apiMessages = [
            { role: 'system', content: systemPromptContent },
            ...currentMessages.map((m) => ({ role: m.role, content: m.content })),
            { role: 'user', content: currentInput },
        ];

        console.log('🚀 Sending to API (Multi-room):', apiMessages);
        // TODO: Call API
    };

    return (
        <div className="flex h-full flex-1 flex-col relative bg-[#212121] text-gray-100 font-sans">
            <MessageList messages={currentMessages} />
            <PromptBox input={input} setInput={setInput} onSubmit={handleSubmit} onClear={clearCurrentMessages} />
        </div>
    );
}
