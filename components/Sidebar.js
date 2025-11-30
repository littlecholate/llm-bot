'use client';

import { X, ChevronDown, ChevronRight, Settings, MessageSquare, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { navSections, siteConfig } from '../lib/config';
import { useState } from 'react';
import { useChat } from '../context/ChatContext'; // 引入 Context Hook

export default function Sidebar({ isOpen, onClose, currentView, activeToolId, onNavigate, onOpenSettings }) {
    // 修改 1: 解構出 prepareNewChat，移除 createNewSession
    const { sessions, activeId, switchSession, prepareNewChat, deleteSession } = useChat();

    const [expandedSections, setExpandedSections] = useState({
        首頁: true,
        資料查詢: true,
        你的聊天: true,
    });

    const toggleSection = (category) => {
        setExpandedSections((prev) => ({ ...prev, [category]: !prev[category] }));
    };

    const handleItemClick = (item) => {
        // 如果是開始對話 (home)，傳入 'create' 參數，並不帶 toolId
        if (item.id === 'home') {
            if (onNavigate) onNavigate('chat', null); // 切換 view
            prepareNewChat(); // 準備新對話
        } else {
            // 其他項目 (工具)，傳入 view 和 item.id
            if (onNavigate) onNavigate(item.view, item.id);
        }

        if (window.innerWidth < 768) onClose();
    };

    // 處理切換聊天室
    const handleSessionClick = (sessionId) => {
        switchSession(sessionId);
        if (onNavigate) onNavigate('chat'); // 確保切回聊天介面
        if (window.innerWidth < 768) onClose();
    };

    return (
        <>
            <div
                className={cn(
                    'fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity md:hidden',
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                )}
                onClick={onClose}
            />

            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-[#171717] font-sans transition-transform duration-300 ease-in-out md:static md:translate-x-0 md:flex',
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                <div className="flex items-center justify-between px-5 pt-8 pb-6">
                    <h1 className="text-xl font-bold text-white tracking-wide">{siteConfig.name}</h1>
                    <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-4 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {navSections.map((section) => {
                        const isExpanded = expandedSections[section.category];

                        // 特殊處理 "你的聊天"
                        if (section.category === '你的聊天') {
                            return (
                                <div key={section.category}>
                                    <button
                                        onClick={() => toggleSection(section.category)}
                                        className="flex w-full items-center gap-1.5 px-2 mb-3 text-sm font-bold text-gray-500 hover:text-gray-300 transition-colors"
                                    >
                                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                        <span>{section.category}</span>
                                    </button>

                                    <div className={cn('space-y-1.5', !isExpanded && 'hidden')}>
                                        {/* 動態渲染 Sessions */}
                                        {Object.values(sessions).map((session) => (
                                            <div key={session.id} className="group relative">
                                                <button
                                                    onClick={() => handleSessionClick(session.id)}
                                                    className={cn(
                                                        'flex w-full items-center gap-4 rounded-xl px-4 py-3 text-[15px] font-medium transition-all duration-200 pr-10', // pr-10 for delete btn
                                                        activeId === session.id && currentView === 'chat'
                                                            ? 'bg-[#2f2f2f] text-white'
                                                            : 'text-gray-400 hover:bg-[#2F2F2F] hover:text-white'
                                                    )}
                                                >
                                                    <MessageSquare
                                                        className={cn(
                                                            'h-[22px] w-[22px]',
                                                            activeId === session.id && currentView === 'chat'
                                                                ? 'text-white'
                                                                : 'text-gray-500'
                                                        )}
                                                    />
                                                    <span className="truncate text-left flex-1">{session.title}</span>
                                                </button>

                                                {/* Delete Button (Hover show) */}
                                                <button
                                                    onClick={(e) => deleteSession(e, session.id)}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                        {/* 提示：如果 activeId 是 'new'，這裡其實不會顯示在列表中，這是符合預期的 */}
                                        {Object.keys(sessions).length === 0 && (
                                            <div className="px-4 py-2 text-sm text-gray-600 italic">No history</div>
                                        )}
                                    </div>
                                </div>
                            );
                        }

                        // 一般區塊 (首頁、資料查詢)
                        return (
                            <div key={section.category}>
                                {section.category !== '首頁' && (
                                    <button
                                        onClick={() => toggleSection(section.category)}
                                        className="flex w-full items-center gap-1.5 px-2 mb-3 text-sm font-bold text-gray-500 hover:text-gray-300 transition-colors"
                                    >
                                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                        <span>{section.category}</span>
                                    </button>
                                )}

                                <div className={cn('space-y-1.5', section.category !== '首頁' && !isExpanded && 'hidden')}>
                                    {section.items.map((item) => {
                                        // Logic: 如果是 Home 且 activeId 是 'new' 且在聊天介面，則高亮
                                        // 或者 item.view 和 currentView 匹配
                                        const isActive =
                                            (item.id === 'home' && activeId === 'new' && currentView === 'chat') ||
                                            (currentView === 'tools' && activeToolId === item.id);
                                        return (
                                            <button
                                                key={item.id}
                                                // 如果是 "home" (開始對話)，傳入 create 參數
                                                onClick={() => handleItemClick(item)}
                                                className={cn(
                                                    'flex w-full items-center gap-4 rounded-xl px-4 py-3 text-[15px] font-medium transition-all duration-200',
                                                    isActive
                                                        ? 'bg-[#2f2f2f] text-white'
                                                        : 'text-gray-400 hover:bg-[#2F2F2F] hover:text-white'
                                                )}
                                            >
                                                <item.icon
                                                    className={cn(
                                                        'h-[22px] w-[22px]',
                                                        isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'
                                                    )}
                                                />
                                                <span className="truncate">{item.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="border-t border-[#2F2F2F] p-4 bg-[#171717]">
                    <button
                        onClick={() => {
                            if (onOpenSettings) onOpenSettings();
                            if (window.innerWidth < 768) onClose();
                        }}
                        className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-[15px] font-medium text-gray-400 hover:bg-[#2F2F2F] hover:text-white transition-all duration-200"
                    >
                        <Settings className="h-[22px] w-[22px] text-gray-500 group-hover:text-white" />
                        <span className="truncate">設定</span>
                    </button>
                    <div className="mt-2 px-4 text-xs font-medium text-gray-600">Version {siteConfig.version}</div>
                </div>
            </aside>
        </>
    );
}
