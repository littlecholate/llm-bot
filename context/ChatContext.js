'use client';

import { createContext, useContext, useEffect, useCallback, useMemo, useReducer } from 'react';
import { DEFAULT_MESSAGES } from '../lib/llm-config';
import { locales } from '../lib/locales';
import { chatReducer, initialState } from './chatReducer'; // [引入 Reducer]

const ChatContext = createContext();

const STORAGE_KEY = 'hisekai_chat_history';
const MAX_CHATS = 3;

export function ChatProvider({ children }) {
    const [state, dispatch] = useReducer(chatReducer, initialState);
    const { sessions, activeId, isLoaded } = state;

    // Auto-save logic
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
        }
    }, [sessions, isLoaded]);

    // Init logic
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(STORAGE_KEY);
            let initialSessions = {};
            let initialActiveId = 'new';

            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    initialSessions = parsed;
                    const keys = Object.keys(parsed);
                    if (keys.length > 0) {
                        initialActiveId = keys[0];
                    }
                } catch (e) {
                    console.error('LocalStorage parse error', e);
                }
            }
            dispatch({
                type: 'INIT',
                payload: { sessions: initialSessions, activeId: initialActiveId },
            });
        }
    }, []);

    const prepareNewChat = useCallback(() => {
        dispatch({ type: 'PREPARE_NEW' });
    }, []);

    const switchSession = useCallback(
        (id) => {
            if (sessions[id]) {
                dispatch({ type: 'SET_ACTIVE', payload: id });
            }
        },
        [sessions]
    );

    const addMessage = useCallback(
        (message) => {
            if (activeId === 'new') {
                if (Object.keys(sessions).length >= MAX_CHATS) {
                    alert(`已達到聊天室上限 (${MAX_CHATS} 個)。請先刪除舊的聊天室。`);
                    return;
                }
            }
            dispatch({ type: 'SEND_MESSAGE', payload: { message } });
        },
        [activeId, sessions]
    );

    const clearCurrentMessages = useCallback(() => {
        if (activeId === 'new') return;
        if (confirm(locales.chat.confirmClear)) {
            dispatch({ type: 'CLEAR_CURRENT' });
        }
    }, [activeId]);

    const deleteSession = useCallback((e, id) => {
        e.stopPropagation();
        if (confirm(locales.nav.confirmDeleteSession)) {
            dispatch({ type: 'DELETE_SESSION', payload: id });
        }
    }, []);

    const clearAllSessions = useCallback(() => {
        if (confirm(locales.settings.actions.clearAllConfirm)) {
            dispatch({ type: 'CLEAR_ALL_SESSIONS' });
        }
    }, []);

    const currentMessages = useMemo(() => {
        return activeId === 'new' || !sessions[activeId] ? DEFAULT_MESSAGES : sessions[activeId].messages;
    }, [activeId, sessions]);

    const contextValue = useMemo(
        () => ({
            sessions,
            activeId,
            currentMessages,
            prepareNewChat,
            switchSession,
            addMessage,
            clearCurrentMessages,
            deleteSession,
            clearAllSessions,
            isLoaded,
        }),
        [
            sessions,
            activeId,
            currentMessages,
            isLoaded,
            prepareNewChat,
            switchSession,
            addMessage,
            clearCurrentMessages,
            deleteSession,
            clearAllSessions,
        ]
    );

    return <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>;
}

export function useChat() {
    return useContext(ChatContext);
}
