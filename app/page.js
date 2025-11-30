'use client';

import { useState } from 'react';
import { ChatProvider } from '../context/ChatContext';
import Sidebar from '../components/Sidebar';
import MobileHeader from '../components/MobileHeader';
import ChatWindow from '../components/ChatWindow';
import ToolsView from '../components/ToolsView';
import SettingsModal from '../components/SettingsModal';

export default function Home() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeView, setActiveView] = useState('chat');

    // 1. 新增: 追蹤目前選中的工具 ID
    // 預設可以是 null，或者第一個工具的 ID (如 'events-current')
    const [activeToolId, setActiveToolId] = useState(null);

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // 2. 修改: 處理導航，接收 view 和 toolId
    const handleNavigate = (view, toolId = null) => {
        setActiveView(view);
        if (view === 'tools' && toolId) {
            setActiveToolId(toolId);
        }
    };

    const renderContent = () => {
        switch (activeView) {
            case 'chat':
                return <ChatWindow />;
            case 'tools':
                // 這裡可以將 activeToolId 傳給 ToolsView
                // 未來 ToolsView 可以根據這個 ID 顯示不同的工具內容
                return <ToolsView activeToolId={activeToolId} />;
            default:
                return <ChatWindow />;
        }
    };

    return (
        <ChatProvider>
            <main className="flex h-screen w-full overflow-hidden bg-[#212121]">
                <Sidebar
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                    currentView={activeView}
                    activeToolId={activeToolId} // 3. 傳入 activeToolId
                    onNavigate={handleNavigate} // 傳入新的導航函式
                    onOpenSettings={() => setIsSettingsOpen(true)}
                />

                <div className="flex-1 flex flex-col h-full w-full relative">
                    <MobileHeader onOpen={() => setIsSidebarOpen(true)} />

                    {renderContent()}

                    <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
                </div>
            </main>
        </ChatProvider>
    );
}
