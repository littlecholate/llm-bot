export const getEventTop100Def = {
    type: 'function',
    function: {
        name: 'get_event_top100', // 對應 implementation 的 key
        description:
            '查詢 Project Sekai 當前活動的前 100 名玩家即時榜線。當使用者詢問「現在第一名是誰」、「榜線多少」、「Top 100」時使用此工具。',
        parameters: {
            type: 'object',
            properties: {},
            required: [],
        },
    },
};
