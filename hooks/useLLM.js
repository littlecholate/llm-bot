'use client';

import { useState, useRef, useCallback } from 'react';
import { useChat } from '../context/ChatContext';
import { useSettings } from '../context/SettingsContext';
import { generateSystemPrompt } from '../lib/llm-config';

export function useLLM() {
    const [isLoading, setIsLoading] = useState(false);

    // 使用 useRef 來避免在串流過程中閉包變數未更新的問題 (雖然這裡主要依賴 Context 方法)
    const abortControllerRef = useRef(null);

    const { addMessage, updateStreamMessage, currentMessages } = useChat();
    // Get context from settings
    const { language, character } = useSettings();

    const sendMessage = useCallback(
        async (inputContent) => {
            if (!inputContent.trim()) return;

            if (isLoading) return;
            setIsLoading(true);
            abortControllerRef.current = new AbortController();

            try {
                // Add user's message to chat window first
                const userMsg = { role: 'user', content: inputContent, time: new Date().toLocaleTimeString() };
                addMessage(userMsg);

                // Generate the system prompt content using current language and character from context
                const systemPromptContent = generateSystemPrompt({ language, character });

                const apiMessages = [
                    { role: 'system', content: systemPromptContent },
                    ...currentMessages.map((m) => ({ role: m.role, content: m.content })),
                    { role: 'user', content: inputContent },
                ];

                // Create an empty Assistant message in the UI and prepare to receive the stream
                // This way the UI will display a typing bubble
                addMessage({
                    role: 'assistant',
                    content: '',
                    time: new Date().toLocaleTimeString(),
                });

                console.log('🚀 [useLLM] Sending to API with settings:', { language, character });

                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ messages: apiMessages }),
                    signal: abortControllerRef.current.signal,
                });

                if (!response.ok) {
                    throw new Error(response.statusText);
                }

                // Deal with streaming data (Native Streams API)
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let done = false;

                while (!done) {
                    const { value, done: doneReading } = await reader.read();
                    done = doneReading;

                    if (value) {
                        const chunkValue = decoder.decode(value, { stream: true });
                        updateStreamMessage(chunkValue);
                    }
                }
            } catch (err) {
                if (err.name === 'AbortError') {
                    console.log('Stream stopped by user');
                } else {
                    console.error('[useLLM Error]', err);
                    updateStreamMessage(`\n\n[系統錯誤]: ${err.message}`);
                }
            } finally {
                setIsLoading(false);
                abortControllerRef.current = null;
            }
        },
        [addMessage, updateStreamMessage, currentMessages, language, character, isLoading]
    );

    // 提供一個停止生成的方法 (Optional)
    const stopGeneration = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
            setIsLoading(false);
        }
    }, []);

    return { sendMessage, stopGeneration, isLoading };
}
