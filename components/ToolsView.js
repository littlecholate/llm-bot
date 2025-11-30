'use client';

import { Zap, Clock, Presentation, BarChart2, Globe, Users, Calculator, Wrench } from 'lucide-react';

export default function ToolsView({ activeToolId }) {
    // 這裡未來會替換成真正的元件引入
    // import CurrentEvents from './tools/CurrentEvents';
    // import HistoryEvents from './tools/HistoryEvents';

    // 暫時用一個 switch 或 mapping 來決定顯示標題與內容
    const getToolContent = (id) => {
        switch (id) {
            case 'events-current':
                return { title: '現時活動', icon: Zap, desc: '這裡將顯示即時活動排名與預測圖表。' };
            case 'events-history':
                return { title: '歷代活動', icon: Clock, desc: '這裡將顯示過往活動的資料庫查詢介面。' };
            case 'analysis-compare':
                return { title: '活動比較分析', icon: Presentation, desc: '這裡將提供兩期活動的趨勢比較功能。' };
            case 'analysis-ranking':
                return { title: '活動榜線排名', icon: BarChart2, desc: '這裡顯示歷代 Top 100/1000 的分數排行。' };
            case 'analysis-world':
                return { title: 'World Link 分析', icon: Globe, desc: 'World Link 特殊活動的章節數據分析。' };
            case 'analysis-users':
                return { title: '活躍玩家分析', icon: Users, desc: '查詢特定玩家的活動歷史紀錄。' };
            case 'tools-calculator':
                return { title: '預估資源計算機', icon: Calculator, desc: '計算活動畢業所需的體力與資源。' };
            default:
                return { title: '未選擇工具', icon: Wrench, desc: '請從左側選單選擇一個功能。' };
        }
    };

    const content = getToolContent(activeToolId);
    const Icon = content.icon;

    return (
        <div className="h-full w-full overflow-y-auto bg-[#212121] text-white">
            {/* Tool Header Area */}
            <div className="border-b border-[#2F2F2F] bg-[#171717] px-8 py-6">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#2F2F2F] text-cyan-400 shadow-lg ring-1 ring-white/10">
                        <Icon className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-wide">{content.title}</h2>
                        <p className="text-sm text-gray-400 mt-1">{content.desc}</p>
                    </div>
                </div>
            </div>

            {/* Tool Main Content Area */}
            <div className="p-8">
                {/* 這裡是用來放未來實際工具 UI 的容器 */}
                <div className="rounded-2xl border border-dashed border-gray-700 bg-[#2a2a2a]/30 p-12 text-center">
                    <p className="text-gray-500">
                        [{content.title}] 功能開發中... <br />
                        Component for <span className="font-mono text-cyan-400">{activeToolId}</span> will be rendered here.
                    </p>
                </div>
            </div>
        </div>
    );
}
