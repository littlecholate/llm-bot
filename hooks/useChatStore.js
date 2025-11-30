'use client';

import { useState, useEffect } from 'react';
import { DEFAULT_MESSAGES } from '../lib/llm-config'; // 引入預設歡迎語

const STORAGE_KEY = 'hisekai_chat_history';
const DEFAULT_SESSION_ID = 'default-session';

export function useChatStore() {
    // 核心狀態：所有對話紀錄
    // 結構範例: { [sessionId]: { id: '...', messages: [...] } }
    // 為了 MVP 簡單，我們暫時用物件 Map 來存
    const [sessions, setSessions] = useState({});
    const [isLoaded, setIsLoaded] = useState(false);

    // 1. 初始化：從 LocalStorage 讀取
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    setSessions(parsed);
                } catch (e) {
                    console.error('Failed to parse chat history', e);
                    // 如果壞掉，就重置
                    initDefaultSession();
                }
            } else {
                initDefaultSession();
            }
            setIsLoaded(true);
        }
    }, []);

    // 輔助：初始化預設 Session
    const initDefaultSession = () => {
        const initialData = {
            [DEFAULT_SESSION_ID]: {
                id: DEFAULT_SESSION_ID,
                messages: DEFAULT_MESSAGES, // 使用 llm-config 的預設歡迎語
                updatedAt: Date.now(),
            },
        };
        setSessions(initialData);
        saveToStorage(initialData);
    };

    // 輔助：寫入 LocalStorage
    const saveToStorage = (data) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    };

    // 2. 取得當前對話的訊息
    // 如果還沒載入完，回傳空陣列避免閃爍，或者回傳預設值
    const currentMessages = sessions[DEFAULT_SESSION_ID]?.messages || DEFAULT_MESSAGES;

    // 3. Action: 新增訊息
    const addMessage = (message) => {
        setSessions((prev) => {
            const currentSession = prev[DEFAULT_SESSION_ID] || { messages: [] };
            const updatedMessages = [...currentSession.messages, message];

            const newState = {
                ...prev,
                [DEFAULT_SESSION_ID]: {
                    ...currentSession,
                    messages: updatedMessages,
                    updatedAt: Date.now(),
                },
            };

            saveToStorage(newState);
            return newState;
        });
    };

    // 4. Action: 清除對話 (重置回預設狀態)
    const clearMessages = () => {
        if (confirm('確定要清除所有對話紀錄嗎？此動作無法復原。')) {
            initDefaultSession();
        }
    };

    return {
        messages: currentMessages,
        addMessage,
        clearMessages,
        isLoaded, // 可以用來做 Loading Skeleton，目前暫時不用
    };
}
