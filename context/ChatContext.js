'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { DEFAULT_MESSAGES } from '../lib/llm-config';

const ChatContext = createContext();

const STORAGE_KEY = 'hisekai_chat_history';
const MAX_CHATS = 3;

export function ChatProvider({ children }) {
    const [sessions, setSessions] = useState({});
    // activeId 可以是真實的 UUID，也可以是 'new' (代表準備中)
    const [activeId, setActiveId] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // 1. 初始化
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    setSessions(parsed);

                    // 預設行為：如果有歷史紀錄，選第一筆；沒有則進入 'new' 狀態
                    const keys = Object.keys(parsed);
                    if (keys.length > 0) {
                        setActiveId(keys[0]);
                    } else {
                        setActiveId('new');
                    }
                } catch (e) {
                    console.error('LocalStorage parse error', e);
                    setActiveId('new');
                }
            } else {
                setActiveId('new');
            }
            setIsLoaded(true);
        }
    }, []);

    const saveToStorage = (newSessions) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newSessions));
    };

    // 2. [修改] 準備新對話 (不建立實體，只切換狀態)
    const prepareNewChat = () => {
        setActiveId('new');
    };

    // 3. 切換聊天室
    const switchSession = (id) => {
        if (sessions[id]) {
            setActiveId(id);
        }
    };

    // 4. [修改] 新增訊息 (包含延遲建立邏輯)
    const addMessage = (message) => {
        // A. 如果目前是 'new' 狀態，先建立房間
        let currentSessionId = activeId;
        let currentSessions = sessions;

        if (activeId === 'new') {
            // 檢查上限
            if (Object.keys(sessions).length >= MAX_CHATS) {
                alert(`已達到聊天室上限 (${MAX_CHATS} 個)。請先刪除舊的聊天室。`);
                return; // 阻止發送
            }

            // 真正建立房間
            const newId = Date.now().toString();
            const newSession = {
                id: newId,
                title: 'New Chat',
                messages: DEFAULT_MESSAGES, // 初始歡迎語
                updatedAt: Date.now(),
            };

            // 更新暫存變數
            currentSessions = { [newId]: newSession, ...sessions };
            currentSessionId = newId; // 更新 ID

            // 這裡我們不單獨 setState，而是透過下面的 setSessions 一次完成，避免兩次 render
        }

        // B. 將訊息加入 (無論是新房還是舊房)
        if (!currentSessionId || !currentSessions[currentSessionId]) return;

        // 計算新標題 (如果是該房 User 的第一則訊息)
        const currentSession = currentSessions[currentSessionId];
        // 注意：如果是剛建立的房間，messages 長度是 1 (Default msg)
        // 如果是舊房間，就看原本長度
        let newTitle = currentSession.title;

        // 簡單判斷：如果標題還是預設的 "New Chat" 且這是 User 訊息，就更新標題
        if (message.role === 'user' && newTitle === 'New Chat') {
            newTitle = message.content.slice(0, 15) + (message.content.length > 15 ? '...' : '');
        }

        const updatedMessages = [...currentSession.messages, message];

        const updatedSession = {
            ...currentSession,
            title: newTitle,
            messages: updatedMessages,
            updatedAt: Date.now(),
        };

        const finalSessions = { ...currentSessions, [currentSessionId]: updatedSession };

        // C. 更新所有狀態
        setSessions(finalSessions);
        setActiveId(currentSessionId); // 確保從 'new' 切換到真實 ID
        saveToStorage(finalSessions);
    };

    // 5. 清除當前對話
    const clearCurrentMessages = () => {
        // 如果是 'new' 狀態，什麼都不用做，或是重置回初始狀態 (其實已經是初始狀態了)
        if (activeId === 'new') return;

        if (activeId && confirm('確定要清除此對話紀錄嗎？')) {
            setSessions((prev) => {
                const updatedSession = {
                    ...prev[activeId],
                    messages: DEFAULT_MESSAGES,
                    updatedAt: Date.now(),
                };
                const newSessions = { ...prev, [activeId]: updatedSession };
                saveToStorage(newSessions);
                return newSessions;
            });
        }
    };

    const deleteSession = (e, id) => {
        e.stopPropagation();
        if (confirm('確定要刪除這個聊天室嗎？')) {
            const newSessions = { ...sessions };
            delete newSessions[id];
            setSessions(newSessions);
            saveToStorage(newSessions);

            if (id === activeId) {
                const remainingIds = Object.keys(newSessions);
                if (remainingIds.length > 0) {
                    setActiveId(remainingIds[0]);
                } else {
                    setActiveId('new'); // 刪光了就回到 'new'
                }
            }
        }
    };

    // 判斷目前顯示的訊息
    // 如果是 'new'，回傳預設訊息；如果是真實 ID，回傳該 ID 的訊息
    const currentMessages = activeId === 'new' || !sessions[activeId] ? DEFAULT_MESSAGES : sessions[activeId].messages;

    return (
        <ChatContext.Provider
            value={{
                sessions,
                activeId,
                currentMessages,
                prepareNewChat, // 改名匯出
                switchSession,
                addMessage,
                clearCurrentMessages,
                deleteSession,
                isLoaded,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    return useContext(ChatContext);
}
