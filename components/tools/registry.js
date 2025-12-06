// components/tools/registry.js
import { Zap, Clock, Presentation, Trophy, Wrench } from 'lucide-react';
import { locales } from '../../lib/locales';
import RankingView from './RankingView';

// 這裡集中管理所有工具的設定
export const TOOLS_UI_REGISTRY = {
    'events-current': {
        meta: {
            title: locales.tools.current.title,
            desc: locales.tools.current.desc,
            icon: Zap,
        },
        component: null, // 尚未實作，設為 null 會顯示 Placeholder
    },
    'events-history': {
        meta: {
            title: locales.tools.history.title,
            desc: locales.tools.history.desc,
            icon: Clock,
        },
        component: null,
    },
    'analysis-compare': {
        meta: {
            title: locales.tools.compare.title,
            desc: locales.tools.compare.desc,
            icon: Presentation,
        },
        component: null,
    },
    'analysis-ranking': {
        meta: {
            // 這裡保留原本的 fallback 邏輯，以防 locales 未更新
            title: locales.tools.ranking?.title || '活動榜線排名',
            desc: locales.tools.ranking?.desc || '即時查詢 Top 100 榜線數據',
            icon: Trophy,
        },
        component: RankingView, // 已實作的元件
    },
};

// 預設顯示內容 (當 activeToolId 無效時)
export const DEFAULT_TOOL_META = {
    title: locales.tools.default.title,
    desc: locales.tools.default.desc,
    icon: Wrench,
};
