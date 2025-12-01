'use client';

import { useState, useCallback } from 'react';
import { useChat } from '../context/ChatContext';
import { useSettings } from '../context/SettingsContext';
import { generateSystemPrompt } from '../lib/llm-config';

export function useLLM() {
    const [isLoading, setIsLoading] = useState(false);

    const { addMessage, currentMessages } = useChat();
    // 直接從 Context 取得最新的設定
    const { language, character } = useSettings();

    const sendMessage = useCallback(
        async (inputContent) => {
            if (!inputContent.trim()) return;
            setIsLoading(true);

            try {
                const userMsg = { role: 'user', content: inputContent, time: new Date().toLocaleTimeString() };
                addMessage(userMsg);

                // 使用 Context 的值來生成 System Prompt
                const systemPromptContent = generateSystemPrompt({
                    language, // 來自 Context
                    character, // 來自 Context
                });

                // Generate the system prompt  content using current language and character from context
                const apiMessages = [
                    { role: 'system', content: systemPromptContent },
                    ...currentMessages.map((m) => ({ role: m.role, content: m.content })),
                    { role: 'user', content: inputContent },
                ];

                console.log('🚀 [useLLM] Sending to API with settings:', { language, character });

                // ... (API 呼叫邏輯保持不變) ...
                await new Promise((resolve) => setTimeout(resolve, 1000));
                const aiResponseContent = `(模擬回覆 ${character}) ...`;

                addMessage({
                    role: 'assistant',
                    content: aiResponseContent,
                    time: new Date().toLocaleTimeString(),
                });
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        },
        [addMessage, currentMessages, language, character]
    );

    return { sendMessage, isLoading };
}
