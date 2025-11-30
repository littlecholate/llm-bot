'use client';

import { useState } from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { settingsData } from '../lib/config'; // 確保 config 有正確匯入
import { cn } from '../lib/utils';

export default function SettingsView({ onBack }) {
    // 使用本地 State 來管理語言選擇，預設為中文
    const [language, setLanguage] = useState('Chinese');

    // 定義語言選項
    const languageOptions = [
        { value: 'Chinese', label: '繁體中文' },
        { value: 'English', label: 'English' },
        { value: 'Japanese', label: '日本語' },
    ];

    const handleLanguageChange = (e) => {
        setLanguage(e.target.value);
        // 這裡未來可以加入切換語系 (i18n) 的邏輯
        console.log('Language switched to:', e.target.value);
    };

    return (
        <div className="h-full w-full overflow-y-auto bg-black text-white">
            {/* 1. Mobile Header */}
            <div className="flex items-center gap-4 p-4 md:hidden">
                <button onClick={onBack} className="rounded-full p-2 hover:bg-[#2F2F2F] transition-colors">
                    <ArrowLeft className="h-6 w-6" />
                </button>
                <h1 className="text-xl font-bold">設定</h1>
            </div>

            {/* Main Content Container */}
            <div className="mx-auto max-w-2xl px-4 py-4 md:py-12">
                {/* 已移除 Profile Section (Avatar & Icon) */}

                {/* 2. Settings Groups */}
                {settingsData.map((group, idx) => (
                    <div key={idx} className="mb-6">
                        <div className="mb-2 px-2 text-sm font-medium text-gray-500 hidden md:block">{group.groupName}</div>

                        <div className="overflow-hidden rounded-xl bg-[#212121]">
                            {group.items.map((item, itemIdx) => {
                                // 判斷是否為語言選項，如果是，我們渲染特殊的 Select UI
                                const isLanguageItem = item.id === 'lang';

                                return (
                                    <div
                                        key={item.id}
                                        className={cn(
                                            'relative flex w-full items-center justify-between px-4 py-4 hover:bg-[#2F2F2F] transition-colors',
                                            itemIdx !== group.items.length - 1 && 'border-b border-[#333333]'
                                        )}
                                    >
                                        {/* Left Side: Icon & Label */}
                                        <div className="flex items-center gap-3 pointer-events-none">
                                            <item.icon className="h-5 w-5 text-gray-300" />
                                            <span className="font-medium text-white">{item.label}</span>
                                        </div>

                                        {/* Right Side: Value or Select */}
                                        <div className="flex items-center gap-2 text-gray-500">
                                            {isLanguageItem ? (
                                                // Language Dropdown (隱藏原生的 select 樣式，覆蓋在文字上)
                                                <div className="relative flex items-center">
                                                    <span className="text-sm text-gray-300 mr-1">
                                                        {languageOptions.find((opt) => opt.value === language)?.label}
                                                    </span>
                                                    <ChevronRight className="h-4 w-4" />

                                                    {/* 真正的 Select 元素，完全透明覆蓋在上方 */}
                                                    <select
                                                        value={language}
                                                        onChange={handleLanguageChange}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    >
                                                        {languageOptions.map((opt) => (
                                                            <option key={opt.value} value={opt.value}>
                                                                {opt.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            ) : (
                                                // Normal Items
                                                <>
                                                    <span className="text-sm">{item.value}</span>
                                                    <ChevronRight className="h-4 w-4" />
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
