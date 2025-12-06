'use client';

import { Zap, Clock, Presentation, Trophy, BarChart2, Globe, Users, Calculator, Wrench } from 'lucide-react';
import { locales } from '../lib/locales';
import RankingView from './tools/RankingView';

export default function ToolsView({ activeToolId }) {
    // 這裡未來會替換成真正的元件引入
    // import HistoryEvents from './tools/HistoryEvents';

    // 暫時用一個 switch 或 mapping 來決定顯示標題與內容
    const getToolContent = (id) => {
        switch (id) {
            case 'events-current':
                return {
                    title: locales.tools.current.title,
                    icon: Zap,
                    desc: locales.tools.current.desc,
                };
            case 'events-history':
                return {
                    title: locales.tools.history.title,
                    icon: Clock,
                    desc: locales.tools.history.desc,
                };
            case 'analysis-compare':
                return {
                    title: locales.tools.compare.title,
                    icon: Presentation,
                    desc: locales.tools.compare.desc,
                };
            case 'analysis-ranking':
                return {
                    title: locales.tools.ranking?.title || '活動榜線排名',
                    icon: Trophy,
                    desc: locales.tools.ranking?.desc || '即時查詢 Top 100 榜線數據',
                };
            default:
                return {
                    title: locales.tools.default.title,
                    icon: Wrench,
                    desc: locales.tools.default.desc,
                };
        }
    };

    const content = getToolContent(activeToolId);
    const Icon = content.icon;

    return (
        // 修改 1: h-screen (或 h-full) + overflow-hidden，確保外層不捲動
        <div className="flex flex-col h-full w-full bg-[#212121] text-white overflow-hidden">
            {/* Header: 固定高度 */}
            {/* <div className="shrink-0 border-b border-[#2F2F2F] bg-[#171717] px-8 py-6">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#2F2F2F] text-cyan-400 shadow-lg ring-1 ring-white/10">
                        <Icon className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-wide">{content.title}</h2>
                        <p className="text-sm text-gray-400 mt-1">{content.desc}</p>
                    </div>
                </div>
            </div> */}

            {/* Content: 佔滿剩餘空間 (flex-1) */}
            {/* 移除 p-8 的預設 padding，讓內部元件自己決定內距，以便實現滿版捲動 */}
            <div className="flex-1 min-h-0 relative">
                {activeToolId === 'analysis-ranking' ? (
                    <RankingView />
                ) : (
                    // 其他工具維持原本的 padding 樣式
                    <div className="h-full overflow-y-auto p-8">
                        <div className="rounded-2xl border border-dashed border-gray-700 bg-[#2a2a2a]/30 p-12 text-center">
                            <p className="text-gray-500">
                                [{content.title}] 功能開發中... <br />
                                Component for <span className="font-mono text-cyan-400">{activeToolId}</span> will be rendered
                                here.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
