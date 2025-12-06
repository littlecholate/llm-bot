/**
 * 格式化單一玩家數據
 */
function formatPlayerCompact(p) {
    if (!p) return '';
    const speed = Math.round(p.last_1h_stats?.speed || 0).toLocaleString();
    const cleanName = p.name.replace(/\s+/g, ' ').trim();
    return `[#${p.rank}] ${cleanName} | ${p.score.toLocaleString()} | +${speed}/hr`;
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

[Top 100 完整榜線列表 (格式: [排名] 玩家 | 分數 | 時速)]:
${rankingsStr}

[系統提示]: 
1. 資料包含完整的 Top 100 排名。
2. 若使用者詢問範圍 (如 50-55)，請直接列出該區段數據。
        `.trim();
    } catch (error) {
        console.error('[Tool:Ranking Error]', error);
        return `無法取得榜線資料: ${error.message}`;
    }
}
