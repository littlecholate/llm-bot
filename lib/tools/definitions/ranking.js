export const getEventTop100Def = {
    type: 'function',
    function: {
        name: 'get_event_top100', // 對應 implementation 的 key
        description:
            '查詢 Project Sekai 當前活動的「前 100 名」玩家完整榜線與時速。' +
            '✅ 適用範圍：任何涉及 1~100 名的查詢（例如：第一名、Top 10、90到100名、百位線）。' +
            '當查詢目標在 100 名以內時，請優先且唯一使用此工具。',
        parameters: {
            type: 'object',
            properties: {},
            required: [],
        },
    },
};
