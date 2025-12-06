// components/ToolsView.js
'use client';

import { TOOLS_UI_REGISTRY, DEFAULT_TOOL_META } from './tools/registry';

export default function ToolsView({ activeToolId }) {
    // 1. 查找註冊表
    const toolEntry = TOOLS_UI_REGISTRY[activeToolId];

    // 2. 決定顯示內容 (Metadata & Component)
    // 如果找不到 ID，使用預設值
    const meta = toolEntry?.meta || DEFAULT_TOOL_META;
    const Component = toolEntry?.component;

    // 3. 提取 Icon (用於 Placeholder 顯示)
    const Icon = meta.icon;

    return (
        <div className="flex flex-col h-full w-full bg-[#212121] text-white overflow-hidden">
            {/* Header 被移除了，改為由各個 Tool 自己控制 (或是在 Placeholder 顯示) */}

            {/* Content: 佔滿剩餘空間 (flex-1) */}
            <div className="flex-1 min-h-0 relative">
                {Component ? (
                    // Case A: 有註冊 Component -> 直接渲染工具介面
                    <Component />
                ) : (
                    // Case B: 沒有 Component (開發中或未選擇) -> 顯示通用 Placeholder
                    <div className="h-full overflow-y-auto p-8 flex flex-col items-center justify-center">
                        <div className="w-full max-w-2xl rounded-2xl border border-dashed border-gray-700 bg-[#2a2a2a]/30 p-12 text-center">
                            <div className="flex justify-center mb-6">
                                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#2F2F2F] text-gray-500 shadow-lg ring-1 ring-white/5">
                                    <Icon className="h-10 w-10" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold tracking-wide text-gray-200 mb-3">{meta.title}</h2>
                            <p className="text-gray-400 leading-relaxed max-w-md mx-auto">{meta.desc}</p>

                            {activeToolId && (
                                <div className="mt-8 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/30 border border-cyan-500/20 text-cyan-400 text-xs font-mono">
                                    <span>DEV_ID:</span>
                                    <span className="font-bold">{activeToolId}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
