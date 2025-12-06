// lib/tools/sekai-api.js

/**
 * 格式化單一玩家數據
 */
function formatPlayerCompact(p) {
    if (!p) return '';
    const speed = Math.round(p.last_1h_stats?.speed || 0).toLocaleString();
    // 移除多餘的空白與換行，確保緊湊
    const cleanName = p.name.replace(/\s+/g, ' ').trim();
    return `[#${p.rank}] ${cleanName} | ${p.score.toLocaleString()} | +${speed}/hr`;
}

/**
 * 查詢 Project Sekai 台港澳服 (TW) 即使活動榜線
 * @returns {Promise<string>} 格式化後的榜線數據
 */
export async function getEventTop100() {
    try {
        console.log('[SekaiAPI] Fetching Top 100 data...');
        const res = await fetch('https://api.hisekai.org/event/live/top100', {
            next: { revalidate: 60 },
        });

        if (!res.ok) throw new Error(`API Error: ${res.status}`);

        const data = await res.json();
        const now = new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' });

        const eventInfo = {
            name: data.name,
            endTime: new Date(data.closed_at).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
            lastUpdate: new Date(data.top_100_player_rankings[0]?.last_played_at).toLocaleString('zh-TW', {
                timeZone: 'Asia/Taipei',
            }),
        };
        const fullList = data.top_100_player_rankings;

        const rankingsStr = fullList.map(formatPlayerCompact).join('\n');

        return `
[系統數據更新時間]: ${new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}
[活動名稱]: ${data.name}

[Top 100 完整榜線列表 (格式: [排名] 玩家 | 分數 | 時速)]:
${rankingsStr}

[系統提示]: 
1. 資料包含完整的 Top 100 排名。
2. 使用者可能會詢問 "第100名往前5名"，這代表 Rank 95, 96, 97, 98, 99, 100。請仔細計算。
3. 若使用者詢問範圍 (如 50-55)，請直接列出該區段數據。
        `.trim();
    } catch (error) {
        console.error('[SekaiAPI Error]', error);
        return `無法取得榜線資料: ${error.message}`;
    }
}

export const EVENT_TOOLS_DEF = [
    {
        type: 'function',
        function: {
            name: 'get_event_top100',
            description:
                '查詢 Project Sekai 當前活動的前 100 名玩家即時榜線。當使用者詢問「現在第一名是誰」、「榜線多少」、「Top 100」時使用此工具。',
            parameters: {
                type: 'object',
                properties: {},
                required: [],
            },
        },
    },
];
