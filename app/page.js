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
    const [activeToolId, setActiveToolId] = useState(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const handleNavigate = (view, toolId = null) => {
        setActiveView(view);
        if (view === 'tools' && toolId) {
            setActiveToolId(toolId);
        }
    };

    // Render the content based on the active view
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
                    activeToolId={activeToolId}
                    onNavigate={handleNavigate}
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
