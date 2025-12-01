export const locales = {
    // 網站基礎資訊
    site: {
        name: 'Sekai Archive',
        description: '世界計畫活動分析小幫手。',
    },
    // 歡迎畫面
    welcome: {
        title: 'Sekai Archive',
        subtitle: '世界計畫活動分析小幫手',
        description: '我可以幫你查詢榜單、分析數據，或是聊遊戲內容',
    },
    // 導覽列 / 側邊欄
    nav: {
        categories: {
            home: '首頁',
            data: '資料查詢',
            chats: '你的聊天',
            links: '友站連結',
        },
        items: {
            home: '開始對話',
            eventsCurrent: '現時活動',
            eventsHistory: '歷代活動',
            analysisCompare: '活動比較分析',
            analysisRanking: '活動榜線排名',
            analysisWorld: 'World Link 分析',
            analysisUsers: '活躍玩家分析',
            calculator: '預估資源計算機',
        },
        settings: '設定',
        version: '版本',
        emptyHistory: '尚無歷史紀錄',
        confirmDeleteSession: '確定要刪除這個聊天室嗎？',
    },
    // 設定視窗
    settings: {
        title: '設定',
        sections: {
            general: '一般',
            data: '資料',
            about: '關於',
        },
        labels: {
            language: '語言',
            character: '喜愛角色',
            version: '版本',
        },
        options: {
            // 設定選項
            languages: ['繁體中文 (台灣)', 'English', '日本語'],
            characters: ['初音未來', '鏡音鈴', '鏡音連', '巡音流歌', 'MEIKO', 'KAITO'],
        },
        actions: {
            clearAll: '清空所有聊天紀錄',
            clearAllConfirm: '確定要刪除「所有」聊天室紀錄嗎？此動作無法復原。',
        },
    },
    // 工具視圖 (ToolsView)
    tools: {
        current: {
            title: '現時活動',
            desc: '這裡將顯示即時活動排名與預測圖表。',
        },
        history: {
            title: '歷代活動',
            desc: '這裡將顯示過往活動的資料庫查詢介面。',
        },
        compare: {
            title: '活動比較分析',
            desc: '這裡將提供兩期活動的趨勢比較功能。',
        },
        ranking: {
            title: '活動榜線排名',
            desc: '這裡顯示歷代 Top 100/1000 的分數排行。',
        },
        world: {
            title: 'World Link 分析',
            desc: 'World Link 特殊活動的章節數據分析。',
        },
        users: {
            title: '活躍玩家分析',
            desc: '查詢特定玩家的活動歷史紀錄。',
        },
        calculator: {
            title: '預估資源計算機',
            desc: '計算活動畢業所需的體力與資源。',
        },
        default: {
            title: '未選擇工具',
            desc: '請從左側選單選擇一個功能。',
        },
    },
    // 聊天視窗
    chat: {
        inputPlaceholder: 'Enter your questions.', // 雖然目前是英文，但也建議抽離
        disclaimer: 'AI content may be inaccurate.',
        confirmClear: '確定要清除此對話紀錄嗎？',
        newChatTitle: 'New Chat',
    },
};
