'use client';

import { Zap, Clock, Presentation, BarChart2, Globe, Users, Calculator, Wrench } from 'lucide-react';
import { locales } from '../lib/locales';

export default function ToolsView({ activeToolId }) {
    // 這裡未來會替換成真正的元件引入
    // import CurrentEvents from './tools/CurrentEvents';
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
            // ... 其他 case 依此類推，引用 locales.tools.xxx
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
