'use client';

import { useState, useEffect } from 'react'; // 加入 useEffect
import { X, ChevronRight, Languages, Heart, Check } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose }) {
    // 1. 初始化 State (給定預設值)
    const [language, setLanguage] = useState('繁體中文 (台灣)');
    const [favChar, setFavChar] = useState('初音未來');

    const [activeMenu, setActiveMenu] = useState(null);

    // 2. [新增] 當元件掛載 (Mount) 時，從 localStorage 讀取設定
    useEffect(() => {
        // 檢查 window 是否存在 (避免 SSR 錯誤)
        if (typeof window !== 'undefined') {
            const savedLang = localStorage.getItem('hisekai_lang');
            const savedChar = localStorage.getItem('hisekai_char');

            if (savedLang) setLanguage(savedLang);
            if (savedChar) setFavChar(savedChar);
        }
    }, []);

    if (!isOpen) return null;

    const langOptions = ['繁體中文 (台灣)', 'English', '日本語'];
    const charOptions = ['初音未來', '鏡音鈴', '鏡音連', '巡音流歌', 'MEIKO', 'KAITO'];

    // 3. [修改] 處理選擇並寫入 localStorage
    const handleSelect = (type, value) => {
        if (type === 'lang') {
            setLanguage(value);
            localStorage.setItem('hisekai_lang', value); // 寫入
        }
        if (type === 'char') {
            setFavChar(value);
            localStorage.setItem('hisekai_char', value); // 寫入
        }
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

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity"
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
                    <h2 className="text-lg font-medium text-gray-100">設定</h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1 text-gray-400 hover:bg-[#333] hover:text-white transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-4 space-y-6">
                    <div>
                        <div className="px-2 mb-2 text-xs font-semibold text-gray-500">一般</div>
                        <div className="relative rounded-xl bg-[#2a2a2a]">
                            {/* Language Item */}
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
                                        <span className="text-sm font-medium text-gray-200">語言</span>
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

                            {/* Character Item */}
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
                                        <span className="text-sm font-medium text-gray-200">喜愛角色</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-400">{favChar}</span>
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
                                                {favChar === opt && <Check className="h-4 w-4 text-white" />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="px-2 mb-2 text-xs font-semibold text-gray-500">關於</div>
                        <div className="rounded-xl bg-[#2a2a2a]">
                            <div className="flex items-center justify-between px-4 py-3.5 hover:bg-[#333] transition-colors cursor-default rounded-xl">
                                <span className="text-sm font-medium text-gray-200">版本</span>
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
