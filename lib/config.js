import {
    Home,
    Zap,
    Clock,
    Presentation,
    BarChart2,
    Globe,
    Users,
    Calculator,
    Settings,
    Heart,
    Languages,
    // LayoutGrid, // 移除 LayoutGrid (如果沒用到的話)
} from 'lucide-react';
import { locales } from './locales'; // [引入]

export const siteConfig = {
    name: locales.site.name,
    version: '1.0.0 Beta',
    welcome: {
        title: locales.welcome.title,
        subtitle: locales.welcome.subtitle,
        description: locales.welcome.description,
    },
};

export const settingsConfig = {
    languages: locales.settings.options.languages,
    characters: locales.settings.options.characters,
};

// ... toolsData 保持不變 ...

// ... settingsData 保持不變 ...

// 更新導覽結構：移除「工具介紹」
export const navSections = [
    {
        category: locales.nav.categories.home, // 使用變數
        items: [{ id: 'home', label: locales.nav.items.home, icon: Home, view: 'chat' }],
    },
    {
        category: locales.nav.categories.data, // 使用變數
        items: [
            { id: 'events-current', label: locales.nav.items.eventsCurrent, icon: Zap, view: 'tools' },
            { id: 'events-history', label: locales.nav.items.eventsHistory, icon: Clock, view: 'tools' },
            { id: 'analysis-compare', label: locales.nav.items.analysisCompare, icon: Presentation, view: 'tools' },
            // ... 其他註解掉的項目如果啟用，也請比照辦理
        ],
    },
    {
        category: locales.nav.categories.chats, // 使用變數
        items: [],
    },
];
