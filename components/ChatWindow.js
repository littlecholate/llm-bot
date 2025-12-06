'use client';

import { useState } from 'react';
import MessageList from './MessageList';
import PromptBox from './PromptBox';
import { useChat } from '../context/ChatContext';
import { useLLM } from '../hooks/useLLM';

export default function ChatWindow() {
    const [input, setInput] = useState('');
    const [isChecking, setIsChecking] = useState(false);

    // 從 Context 取得資料 (只取需要的顯示資料)
    const { currentMessages, clearCurrentMessages, addMessage } = useChat();

    // 從 Hook 取得邏輯 (發送功能與讀取狀態)
    const { sendMessage, isLoading, regenerate } = useLLM();

    const handleSubmit = async (e) => {
        e?.preventDefault();
        if (!input.trim() || isLoading || isChecking) return;

        // 暫存輸入內容並清空輸入框 (提升 UX，讓使用者感覺反應很快)
        const currentInput = input;
        setInput('');
        setIsChecking(true); // 開始判斷意圖

        try {
            // --- 1. 呼叫 Judge Agent 進行意圖判斷 ---
            // 注意：這裡只取前 50 字判斷即可，節省流量
            const judgeRes = await fetch('/api/judge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: currentInput.slice(0, 50) }),
            });

            const judgeResult = await judgeRes.json();

            // --- 2. 判斷結果處置 ---
            if (judgeResult.allowed) {
                // CASE A: 是榜線相關問題 -> 攔截並引導

                // (1) 手動將使用者的話加入畫面
                addMessage({
                    id: Date.now().toString(),
                    role: 'user',
                    content: currentInput,
                    time: new Date().toLocaleTimeString(),
                });

                // (2) 延遲一點點，模擬 AI 思考後回覆
                setTimeout(() => {
                    addMessage({
                        id: (Date.now() + 1).toString(),
                        role: 'assistant',
                        // 委婉的引導文案
                        content: `關於 **即時榜線與活動數據**，建議您使用專用的 **「活動榜線排名」** 工具查詢。\n\n那裡提供更完整、不被上下文干擾的即時數據儀表板！ 📊\n\n*(請點擊左側選單的 🏆 圖示前往)*`,
                        time: new Date().toLocaleTimeString(),
                    });
                }, 600);
            } else {
                // CASE B: 一般閒聊或無關問題 -> 放行 (交給 useLLM 處理)
                // useLLM 內部會自己處理 addMessage(user)，所以這裡不用手動加
                await sendMessage(currentInput);
            }
        } catch (error) {
            console.error('Router check failed:', error);
            // Fail Open: 如果 Judge 掛了，就當作一般對話處理，不要阻擋使用者
            await sendMessage(currentInput);
        } finally {
            setIsChecking(false);
        }
    };

    return (
        <div className="flex h-full flex-1 flex-col relative bg-[#212121] text-gray-100 font-sans">
            <MessageList messages={currentMessages} isLoading={isLoading || isChecking} onRegenerate={regenerate} />

            {/* 這裡可以把 isLoading 傳進去 PromptBox 做 Loading 動畫或 Disable */}
            <PromptBox
                input={input}
                setInput={setInput}
                onSubmit={handleSubmit}
                onClear={clearCurrentMessages}
                disabled={isLoading || isChecking} // 當 AI 思考中時，暫時禁止輸入
            />
        </div>
    );
}
