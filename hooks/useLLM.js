'use client';

import { useState, useRef, useCallback } from 'react';
import { useChat } from '../context/ChatContext';
import { useSettings } from '../context/SettingsContext';
import { generateSystemPrompt, generateApiPayload } from '../lib/llm-config';

// 它的工作是「收集材料」。它負責去 React 的各個角落（Context, State）把資料抓過來。
export function useLLM() {
    const [isLoading, setIsLoading] = useState(false);

    // 使用 useRef 來避免在串流過程中閉包變數未更新的問題 (雖然這裡主要依賴 Context 方法)
    const abortControllerRef = useRef(null);

    const { addMessage, updateStreamMessage, currentMessages, deleteLastMessage } = useChat();
    const { language, character } = useSettings();

    const streamResponse = useCallback(
        async (apiMessages) => {
            // Setting Loading and AbortController
            setIsLoading(true);
            abortControllerRef.current = new AbortController();

            try {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ messages: apiMessages }),
                    signal: abortControllerRef.current.signal,
                });

                if (!response.ok) throw new Error(response.statusText);

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
                if (err.name !== 'AbortError') {
                    let errorMsg = err.message;
                    // 針對該錯誤顯示更友善的訊息
                    if (errorMsg.includes('network error') || errorMsg.includes('chunked')) {
                        errorMsg = '連線逾時或中斷，請稍後重試';
                    }
                    console.error('[streamResponse Error]', err);
                    updateStreamMessage(`\n\n[系統錯誤]: ${errorMsg}`);
                }
            } finally {
                // 統一在這裡關閉 Loading
                setIsLoading(false);
                abortControllerRef.current = null;
            }
        },
        [updateStreamMessage]
    );

    const sendMessage = useCallback(
        async (inputContent) => {
            if (!inputContent.trim() || isLoading) return;

            // Add user's message to chat window first
            addMessage({ id: Date.now().toString(), role: 'user', content: inputContent, time: new Date().toLocaleTimeString() });
            // Create an empty Assistant message in the UI and prepare to receive the stream
            addMessage({ id: Date.now().toString(), role: 'assistant', content: '', time: new Date().toLocaleTimeString() });

            // Generate the system prompt content using current language and character from context
            const systemPrompt = generateSystemPrompt({ language, character });
            const apiMessages = generateApiPayload({
                history: currentMessages, // 這裡的 currentMessages 還沒包含最新的 userMsg，剛好符合需求
                userInput: inputContent,
                systemPrompt: systemPrompt,
                // 未來要加 RAG 只要多傳一個: context: retrievedData
            });

            await streamResponse(apiMessages);
        },
        [addMessage, currentMessages, streamResponse, language, character, isLoading]
    );

    // 提供一個停止生成的方法 (Optional)
    const stopGenerate = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
            setIsLoading(false);
        }
    }, []);

    const regenerate = useCallback(async () => {
        if (isLoading || currentMessages.length === 0) return;

        // 邏輯：拿目前的紀錄，去掉最後一則，不需要等 React 更新 State
        const historyForApi = currentMessages.slice(0, -1);

        // UI 動作：刪除最後一則舊訊息
        deleteLastMessage();

        // UI 動作：馬上補一個空的 Assistant 訊息 (讓串流有地方寫入)
        addMessage({ id: Date.now().toString(), role: 'assistant', content: '', time: new Date().toLocaleTimeString() });

        const systemPrompt = generateSystemPrompt({ language, character });
        const apiMessages = generateApiPayload({
            history: historyForApi,
            userInput: null,
            systemPrompt: systemPrompt,
            // 未來要加 RAG 只要多傳一個: context: retrievedData
        });

        await streamResponse(apiMessages);
    }, [isLoading, currentMessages, addMessage, deleteLastMessage, streamResponse, language, character]);

    return { sendMessage, stopGenerate, isLoading, regenerate };
}
