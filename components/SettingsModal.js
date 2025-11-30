'use client';

import { useState } from 'react';
import { X, ChevronRight, Languages, Heart, Check, Trash2 } from 'lucide-react'; // 引入 Trash2 Icon
import { useSettings } from '../context/SettingsContext';
import { useChat } from '../context/ChatContext'; // 引入 useChat
import { locales } from '../lib/locales';
import { settingsConfig } from '../lib/config';

export default function SettingsModal({ isOpen, onClose }) {
    const { language, character, updateSetting } = useSettings();
    const { clearAllSessions } = useChat(); // 取得清空方法

    const [activeMenu, setActiveMenu] = useState(null);

    if (!isOpen) return null;

    const langOptions = settingsConfig.languages;
    const charOptions = settingsConfig.characters;

    const handleSelect = (type, value) => {
        if (type === 'lang') updateSetting('language', value);
        if (type === 'char') updateSetting('character', value);
        setActiveMenu(null);
    };

    const handleBackdropClick = (e) => {
        if (activeMenu) {
            setActiveMenu(null);
            e.stopPropagation();
        } else {
            onClose();
        }
    };

    // 處理清空並關閉視窗
    const handleClearData = () => {
        clearAllSessions();
        // 選擇性：清空後是否要關閉設定視窗？通常不需要，讓使用者自己關閉
    };

    return (
        <div
            className="fixed inset-0 px-4 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={handleBackdropClick}
        >
            <div
                className="relative w-full max-w-md rounded-2xl bg-[#1f1f1f] shadow-2xl ring-1 ring-white/10 animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => {
                    e.stopPropagation();
                    if (activeMenu) setActiveMenu(null);
                }}
            >
                <div className="flex items-center justify-between border-b border-[#2f2f2f] px-6 py-4">
                    <h2 className="text-lg font-medium text-gray-100">{locales.settings.title}</h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1 text-gray-400 hover:bg-[#333] hover:text-white transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-4 space-y-6">
                    {/* 一般設定 */}
                    <div>
                        <div className="px-2 mb-2 text-xs font-semibold text-gray-500">{locales.settings.sections.general}</div>
                        <div className="relative rounded-xl bg-[#2a2a2a]">
                            {/* Language */}
                            <div className="relative">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveMenu(activeMenu === 'lang' ? null : 'lang');
                                    }}
                                    className="flex w-full items-center justify-between px-4 py-3.5 hover:bg-[#333] transition-colors rounded-t-xl border-b border-[#333]"
                                >
                                    <div className="flex items-center gap-3">
                                        <Languages className="h-5 w-5 text-gray-400" />
                                        <span className="text-sm font-medium text-gray-200">
                                            {locales.settings.labels.language}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-400">{language}</span>
                                        <ChevronRight className="h-4 w-4 text-gray-500" />
                                    </div>
                                </button>
                                {activeMenu === 'lang' && (
                                    <div className="absolute right-0 top-full z-50 mt-2 w-48 origin-top-right rounded-xl bg-[#333333] p-1 shadow-xl ring-1 ring-black/20 animate-in fade-in zoom-in-95 duration-100">
                                        {langOptions.map((opt) => (
                                            <button
                                                key={opt}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSelect('lang', opt);
                                                }}
                                                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-gray-200 hover:bg-[#444444] transition-colors"
                                            >
                                                <span>{opt}</span>
                                                {language === opt && <Check className="h-4 w-4 text-white" />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Character */}
                            <div className="relative">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveMenu(activeMenu === 'char' ? null : 'char');
                                    }}
                                    className="flex w-full items-center justify-between px-4 py-3.5 hover:bg-[#333] transition-colors rounded-b-xl"
                                >
                                    <div className="flex items-center gap-3">
                                        <Heart className="h-5 w-5 text-gray-400" />
                                        <span className="text-sm font-medium text-gray-200">
                                            {locales.settings.labels.character}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-400">{character}</span>
                                        <ChevronRight className="h-4 w-4 text-gray-500" />
                                    </div>
                                </button>
                                {activeMenu === 'char' && (
                                    <div className="absolute right-0 top-full z-50 mt-2 w-48 origin-top-right rounded-xl bg-[#333333] p-1 shadow-xl ring-1 ring-black/20 animate-in fade-in zoom-in-95 duration-100">
                                        {charOptions.map((opt) => (
                                            <button
                                                key={opt}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSelect('char', opt);
                                                }}
                                                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-gray-200 hover:bg-[#444444] transition-colors"
                                            >
                                                <span>{opt}</span>
                                                {character === opt && <Check className="h-4 w-4 text-white" />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 資料管理 (新增區塊) */}
                    <div>
                        <div className="px-2 mb-2 text-xs font-semibold text-gray-500">{locales.settings.sections.data}</div>
                        <div className="rounded-xl bg-[#2a2a2a]">
                            <button
                                onClick={handleClearData}
                                className="flex w-full items-center justify-between px-4 py-3.5 hover:bg-[#333] transition-colors rounded-xl text-red-400 hover:text-red-300"
                            >
                                <div className="flex items-center gap-3">
                                    <Trash2 className="h-5 w-5" />
                                    <span className="text-sm font-medium">{locales.settings.actions.clearAll}</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* 關於 */}
                    <div>
                        <div className="px-2 mb-2 text-xs font-semibold text-gray-500">{locales.settings.sections.about}</div>
                        <div className="rounded-xl bg-[#2a2a2a]">
                            <div className="flex items-center justify-between px-4 py-3.5 hover:bg-[#333] transition-colors cursor-default rounded-xl">
                                <span className="text-sm font-medium text-gray-200">{locales.settings.labels.version}</span>
                                <span className="text-sm text-gray-500">1.0.0 Beta</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-[#1a1a1a] px-6 py-4 text-center text-xs text-gray-600 rounded-b-2xl">
                    © 2024 Hisekai TW. All rights reserved.
                </div>
            </div>
        </div>
    );
}
