import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { DebugLogger } from '../../../lib/debug-utils'; // 1. 引入 Debug 工具

export const runtime = 'edge';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// 維持之前優化過的 Prompt (加入單位檢核)
const SYSTEM_PROMPT = `
你是一個嚴格的意圖分類器 (Intent Classifier)。
我們正在運作一個名為 "Sekai Archive" 的工具，專門用於查詢《Project Sekai (世界計畫)》的活動數據、排名與榜線。

# 判斷規則
請判斷使用者的輸入是否 **包含** 以下主題的查詢意圖：
1. 查詢特定排名的分數 (例如: "第100名幾分?", "百位線", "Top 100", "第10名分數")。
2. 查詢特定分數的排名 (例如: "200萬分排第幾?").
3. 查詢活動資訊或時速 (Speed)。

# 嚴格過濾機制 (Anti-Hallucination)
- **單位檢核**: 
    - ✅ **強烈允許**: 包含 "第...名"、"排名"、"位"、"榜" 等關鍵字 (例如: "我要第10名分數" -> ALLOW)。
    - ❌ **拒絕**: 純數字 (如 "100") 或 單位錯誤 (如 "100分" 且無上下文暗示排名)。
- **非遊戲內容**: 閒聊、天氣、其他遊戲內容一律回傳 allowed: false。

# 行為準則
- ALLOW (true): 輸入明確包含查詢意圖，且關鍵字/單位正確。
- BLOCK (false): 輸入模糊、單位錯誤、或無關話題。

Output JSON format: { "allowed": boolean, "reason": string }
`;

export async function POST(req) {
    // 2. 初始化 Logger，Scope 設為 'API/Judge'
    const logger = new DebugLogger('API/Judge');
    logger.time('Judge_Latency'); // 開始計時

    try {
        const { query } = await req.json();

        if (!query) return NextResponse.json({ allowed: false });

        // 記錄輸入內容 (只取前 50 字避免洗版)
        logger.log(`Analyzing intent for: "${query.slice(0, 50)}${query.length > 50 ? '...' : ''}"`, 'info');

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: query },
            ],
            response_format: { type: 'json_object' },
            temperature: 0,
            max_tokens: 100,
        });

        const result = JSON.parse(completion.choices[0].message.content);

        // 3. 記錄判斷結果 (使用不同顏色)
        if (result.allowed) {
            logger.log(`Verdict: ALLOWED`, 'success');
        } else {
            logger.log(`Verdict: BLOCKED (${result.reason})`, 'warn');
        }

        // 4. 結算效能與成本
        const duration = logger.timeEnd('Judge_Latency'); // 停止計時

        // 輸出精美報告 (包含 Token 用量與價格)
        logger.logSummary({
            usage: completion.usage, // 非串流模式直接有 usage
            duration: duration,
            steps: [],
        });

        return NextResponse.json(result);
    } catch (error) {
        logger.log(error.message, 'error');
        // Fail Open 機制
        return NextResponse.json({ allowed: true });
    }
}
