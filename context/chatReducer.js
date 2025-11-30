// context/chatReducer.js
import { DEFAULT_MESSAGES } from '../lib/llm-config';

export const initialState = {
    sessions: {},
    activeId: null, // 'new' or uuid
    isLoaded: false,
};

export function chatReducer(state, action) {
    switch (action.type) {
        case 'INIT':
            return {
                ...state,
                sessions: action.payload.sessions,
                activeId: action.payload.activeId,
                isLoaded: true,
            };
        case 'SET_ACTIVE':
            return { ...state, activeId: action.payload };
        case 'PREPARE_NEW':
            return { ...state, activeId: 'new' };

        case 'SEND_MESSAGE': {
            const { message } = action.payload;
            let targetSessionId = state.activeId;
            let targetSession = state.sessions[targetSessionId];
            let newState = { ...state };

            // 1. 如果是新對話，先建立 Session 結構
            if (state.activeId === 'new') {
                const newId = Date.now().toString();
                targetSessionId = newId;
                targetSession = {
                    id: newId,
                    title: 'New Chat',
                    messages: DEFAULT_MESSAGES,
                    updatedAt: Date.now(),
                };
                newState.activeId = newId;
            }

            if (!targetSession) return state;

            // 2. 計算新標題
            let newTitle = targetSession.title;
            if (message.role === 'user' && newTitle === 'New Chat') {
                newTitle = message.content.slice(0, 15) + (message.content.length > 15 ? '...' : '');
            }

            // 3. 串接訊息
            const updatedSession = {
                ...targetSession,
                title: newTitle,
                messages: [...targetSession.messages, message],
                updatedAt: Date.now(),
            };

            newState.sessions = {
                ...state.sessions,
                [targetSessionId]: updatedSession,
            };

            return newState;
        }

        case 'DELETE_SESSION':
            const newSessions = { ...state.sessions };
            delete newSessions[action.payload];
            return {
                ...state,
                sessions: newSessions,
                activeId: action.payload === state.activeId ? 'new' : state.activeId,
            };

        case 'CLEAR_CURRENT':
            if (!state.sessions[state.activeId]) return state;
            return {
                ...state,
                sessions: {
                    ...state.sessions,
                    [state.activeId]: {
                        ...state.sessions[state.activeId],
                        messages: DEFAULT_MESSAGES,
                        updatedAt: Date.now(),
                    },
                },
            };

        case 'CLEAR_ALL_SESSIONS':
            return {
                ...state,
                sessions: {},
                activeId: 'new',
            };

        default:
            return state;
    }
}
