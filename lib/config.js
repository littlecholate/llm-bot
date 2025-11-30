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

export const siteConfig = {
    name: 'Hisekai TW',
    version: '1.0.0 Beta',
};

// ... toolsData 保持不變 ...

// ... settingsData 保持不變 ...

// 更新導覽結構：移除「工具介紹」
export const navSections = [
    {
        category: '首頁',
        items: [
            { id: 'home', label: '開始對話', icon: Home, view: 'chat' },
            // 移除 tools-intro
        ],
    },
    {
        category: '資料查詢',
        items: [
            // 這些項目的 view 維持 'tools'，但我們會用 id 來區分
            { id: 'events-current', label: '現時活動', icon: Zap, view: 'tools' },
            { id: 'events-history', label: '歷代活動', icon: Clock, view: 'tools' },
            { id: 'analysis-compare', label: '活動比較分析', icon: Presentation, view: 'tools' },
            // { id: 'analysis-ranking', label: '活動榜線排名', icon: BarChart2, view: 'tools' },
            // { id: 'analysis-world', label: 'World Link 分析', icon: Globe, view: 'tools' },
            // { id: 'analysis-users', label: '活躍玩家分析', icon: Users, view: 'tools' },
            // { id: 'tools-calculator', label: '預估資源計算機', icon: Calculator, view: 'tools' },
        ],
    },
    {
        category: '你的聊天',
        items: [],
    },
];
