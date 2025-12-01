'use client';

import { useState } from 'react';
import MessageList from './MessageList';
import PromptBox from './PromptBox';
import { useChat } from '../context/ChatContext';
import { useLLM } from '../hooks/useLLM';

export default function ChatWindow() {
    const [input, setInput] = useState('');

    // 從 Context 取得資料 (只取需要的顯示資料)
    const { currentMessages, clearCurrentMessages } = useChat();

    // 從 Hook 取得邏輯 (發送功能與讀取狀態)
    const { sendMessage, isLoading } = useLLM();

    const handleSubmit = async (e) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        // 暫存輸入內容並清空輸入框 (提升 UX，讓使用者感覺反應很快)
        const currentInput = input;
        setInput('');

        // 將邏輯交給 Hook 處理
        await sendMessage(currentInput);
    };

    return (
        <div className="flex h-full flex-1 flex-col relative bg-[#212121] text-gray-100 font-sans">
            <MessageList messages={currentMessages} />

            {/* 這裡可以把 isLoading 傳進去 PromptBox 做 Loading 動畫或 Disable */}
            <PromptBox
                input={input}
                setInput={setInput}
                onSubmit={handleSubmit}
                onClear={clearCurrentMessages}
                disabled={isLoading} // 當 AI 思考中時，暫時禁止輸入
            />
        </div>
    );
}
