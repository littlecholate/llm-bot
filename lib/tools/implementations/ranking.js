/**
 * 格式化單一玩家數據
 */
function formatPlayerCompact(p) {
    if (!p) return '';
    const speed = Math.round(p.last_1h_stats?.speed || 0).toLocaleString();
    return `[#${p.rank}] | ${p.score.toLocaleString()} | +${speed}/hr`;
}

/**
 * 實際執行查詢的函數
 */
export async function getEventTop100() {
    try {
        console.log('[Tool:Ranking] Fetching Top 100 data...');
        const res = await fetch('https://api.hisekai.org/event/live/top100', {
            next: { revalidate: 60 },
        });

        if (!res.ok) throw new Error(`API Error: ${res.status}`);

        const data = await res.json();

        const fullList = data.top_100_player_rankings;
        const rankingsStr = fullList.map(formatPlayerCompact).join('\n');

        return `
[系統數據更新時間]: ${new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}
[活動名稱]: ${data.name}

[Top 100 完整榜線列表 (格式: [排名] | 分數 | 時速)]:
${rankingsStr}

[⚠️ 資料解讀規則 (Data Context)]:
1. **連續數據**：此為 Top 100 完整榜單。
2. **截斷規則**：若使用者查詢範圍結果較大 (超過 12 行)，請務必進行截斷 (顯示前5行 + 後5行)，中間用 ... 省略。**絕對禁止** 列出所有數據。
3. **時速資訊**：此資料包含即時時速 (+xxx/hr)。
        `.trim();
    } catch (error) {
        console.error('[Tool:Ranking Error]', error);
        return `無法取得榜線資料: ${error.message}`;
    }
}
