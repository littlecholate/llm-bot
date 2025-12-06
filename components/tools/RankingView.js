'use client';

import { useState, useEffect, useRef } from 'react';
import { RefreshCw, X, Activity } from 'lucide-react';
import { useStatelessLLM } from '../../hooks/useStatelessLLM';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '../../lib/utils';
import PromptBox from '../PromptBox';
import WarningModal from '../WarningModal';

// --- Prompt Engine 引入 ---
import { PromptEngine } from '../../lib/prompts/engine';
import { RANKING_INSTRUCTIONS } from '../../lib/prompts/tools/ranking';

// --- 1. 記憶體暫存區 (Module-Level Variable) ---
// 這個變數在「切換分頁」時會保留，但在「瀏覽器重新整理」時會重置
let memoryCards = [];

const MAX_INPUT_CHARS = 100;

// 這裡設定全域統一的顯示閾值
// 只要資料超過 10 筆，就強制省略中間內容 (Top 5 + Bottom 5)
const ROW_LIMIT_THRESHOLD = 10;

export default function RankingView() {
    // 初始化 State：如果記憶體是空的，就塞入預設的「百位線」卡片
    const [cards, setCards] = useState(() => {
        if (memoryCards.length === 0) {
            return [
                {
                    id: 'default-ranking-100',
                    title: '⚡ 百位線',
                    prompt: '目前的第 100 名分數是多少？時速如何？',
                    content: '', // 預設無內容
                    isLoading: false, // 預設不自動執行，等待使用者點擊
                    timestamp: null,
                },
            ];
        }
        return memoryCards;
    });

    const [input, setInput] = useState('');
    const [activeCardId, setActiveCardId] = useState(null);
    const bottomRef = useRef(null);

    const [showWarning, setShowWarning] = useState(false);
    const [warningMsg, setWarningMsg] = useState('');
    const [isChecking, setIsChecking] = useState(false); // 專門給 Judge 用的 loading

    const { generate, stop, isLoading, result } = useStatelessLLM();

    // 當 Cards 變動時，同步回寫到記憶體變數
    useEffect(() => {
        memoryCards = cards;
    }, [cards]);

    // 串流更新邏輯
    useEffect(() => {
        if (activeCardId && result) {
            setCards((prevCards) => prevCards.map((card) => (card.id === activeCardId ? { ...card, content: result } : card)));
        }
    }, [result, activeCardId]);

    // Loading 結束處理
    useEffect(() => {
        if (!isLoading && activeCardId) {
            setCards((prevCards) =>
                prevCards.map((card) => (card.id === activeCardId ? { ...card, isLoading: false, timestamp: new Date() } : card))
            );
            setActiveCardId(null);
        }
    }, [isLoading, activeCardId]);

    // --- 自動捲動邏輯 (Auto Scroll) ---
    // 當卡片數量增加，且正在生成時，滾動到底部讓使用者看到新卡片
    useEffect(() => {
        if (cards.length > 0 && activeCardId) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }, [cards.length, activeCardId, result]);

    /**
     * 輔助函式：動態組裝 System Prompt
     * 使用 PromptEngine 將 Base Persona 與 Ranking Instructions 結合
     * 並強制傳入 threshold: 10，確保 LLM 嚴格執行「前五後五」的省略規則
     */
    const buildSystemPrompt = () => {
        return new PromptEngine()
            .use(RANKING_INSTRUCTIONS, {
                threshold: ROW_LIMIT_THRESHOLD, // 強制設定為 10，不依賴裝置寬度
            })
            .build();
    };

    const handleQuery = async (queryText, titleOverride = null) => {
        if (isLoading) return;

        const cleanQuery = queryText.trim().slice(0, MAX_INPUT_CHARS);

        if (cleanQuery.length < queryText.length) {
            console.log(`[Cost Control] Truncated input from ${queryText.length} to ${cleanQuery.length} chars`);
        }

        // --- Step 1: Judge Phase (審查) ---
        setIsChecking(true);
        try {
            // 使用 cleanQuery 進行審查
            const judgeRes = await fetch('/api/judge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: cleanQuery }),
            });

            const judgeResult = await judgeRes.json();

            if (!judgeResult.allowed) {
                setWarningMsg(judgeResult.reason); // (Optional: 顯示被拒原因)
                setShowWarning(true);
                setIsChecking(false);
                return; // 直接中斷，不建立卡片
            }
        } catch (err) {
            console.error('Judge failed, failing open', err);
            // 如果 Judge API 掛了，我們選擇放行，以免影響正常使用
        }
        setIsChecking(false);

        const newId = Date.now().toString();
        // 標題取前 8 字
        const cardTitle = titleOverride || (queryText.length > 15 ? queryText.slice(0, 15) + '..' : queryText);

        const newCard = {
            id: newId,
            title: cardTitle,
            prompt: queryText,
            content: '',
            isLoading: true,
            timestamp: new Date(),
        };

        // 新增到陣列最前面 (Prepend)，在 Masonry 中通常會出現在左上角
        setCards((prev) => [...prev, newCard].slice(-10));
        setActiveCardId(newId);

        // --- 使用 Prompt Engine 生成 Prompt ---
        const systemPrompt = buildSystemPrompt();
        generate(queryText, systemPrompt);
    };

    const handleManualSubmit = (e) => {
        e?.preventDefault();
        if (!input.trim()) return;
        handleQuery(input);
        setInput('');
    };

    const handleRefreshCard = (e, card) => {
        e.stopPropagation();
        if (isLoading) return;

        // 1. 建立新卡片 (使用新的 ID 和當前時間，但保留原本的標題與 Prompt)
        const newId = Date.now().toString();
        const newCard = {
            ...card,
            id: newId,
            content: '',
            isLoading: true,
            timestamp: new Date(),
        };

        setCards((prev) => {
            // 2. 過濾掉舊的卡片 ID
            const filtered = prev.filter((c) => c.id !== card.id);
            // 3. 將新卡片加到最後面
            return [...filtered, newCard].slice(-20);
        });

        setActiveCardId(newId);

        // --- 重新整理時也重新組裝 Prompt ---
        const systemPrompt = buildSystemPrompt();
        generate(card.prompt, systemPrompt);
    };

    const handleDeleteCard = (e, cardId) => {
        e.stopPropagation();
        setCards((prev) => prev.filter((c) => c.id !== cardId));
    };

    return (
        <div className="flex flex-col h-full w-full relative bg-[#212121]">
            <WarningModal isOpen={showWarning} onClose={() => setShowWarning(false)} message={warningMsg} />
            {/* --- 2. 內容顯示區 (Top) --- */}
            {/* flex-1 佔滿剩餘空間, overflow-y-auto 允許內部捲動, hide-scrollbar 隱藏卷軸 */}
            <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {cards.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-600 border border-dashed border-white/10 rounded-xl mx-auto w-full max-w-lg opacity-50">
                        <p className="text-sm font-mono">NO ACTIVE MONITORS</p>
                    </div>
                ) : (
                    // --- Masonry Layout ---
                    // columns-1: 手機單欄
                    // xl:columns-2: 寬螢幕雙欄瀑布流
                    // gap-4: 欄間距
                    // space-y-4: 垂直間距 (因為 Masonry 不支援 row-gap)
                    <div className="columns-1 xl:columns-2 gap-4 space-y-4 pb-4">
                        {cards.map((card) => (
                            <div
                                key={card.id}
                                className={cn(
                                    // break-inside-avoid 防止卡片被切斷
                                    'break-inside-avoid group relative flex flex-col rounded-lg transition-all duration-200',
                                    // --- 3. 樣式調整：Grafana 風格 (透明背景 + 細邊框) ---
                                    'bg-transparent border border-white/20 hover:border-white/40',
                                    card.isLoading && 'border-cyan-500/50 shadow-[0_0_10px_rgba(34,211,238,0.1)]'
                                )}
                            >
                                <div className="p-4 flex flex-col h-full">
                                    {/* Header Row */}
                                    <div className="flex items-start justify-between mb-3 shrink-0">
                                        <div className="flex items-center gap-2 text-cyan-400">
                                            {card.isLoading ? (
                                                <RefreshCw className="h-3 w-3 animate-spin" />
                                            ) : (
                                                <div
                                                    className={cn(
                                                        'h-1.5 w-1.5 rounded-full',
                                                        card.content ? 'bg-cyan-500' : 'bg-gray-600'
                                                    )}
                                                />
                                            )}
                                            {/* 標題樣式優化 */}
                                            <span className="text-xs font-bold font-mono uppercase tracking-wider opacity-90 text-gray-100">
                                                {card.title}
                                            </span>
                                        </div>

                                        {/* Actions (Hover Only) */}
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => handleRefreshCard(e, card)}
                                                disabled={isLoading}
                                                className="text-gray-500 hover:text-cyan-400 transition-colors"
                                                title="Refresh"
                                            >
                                                <RefreshCw className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                onClick={(e) => handleDeleteCard(e, card.id)}
                                                className="text-gray-500 hover:text-red-400 transition-colors"
                                                title="Close"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Content Area */}
                                    <div
                                        className={cn(
                                            'text-sm text-gray-200 leading-relaxed font-sans min-h-[60px]',
                                            // 限制最大高度，內容過長時出現捲軸
                                            'max-h-[500px] overflow-y-auto pr-2',
                                            // 自定義細版滾動條 (Grafana Dark Style)
                                            '[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20'
                                        )}
                                    >
                                        {card.content ? (
                                            <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-headings:text-gray-100 prose-headings:text-xs prose-headings:font-bold prose-headings:uppercase prose-strong:text-cyan-300 prose-table:w-full prose-table:text-left prose-th:text-gray-400 prose-th:font-normal prose-td:text-gray-300 prose-td:py-1">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{card.content}</ReactMarkdown>
                                            </div>
                                        ) : (
                                            // Empty State (Idle)
                                            <div
                                                className="flex flex-col items-center justify-center h-20 text-gray-600 space-y-2 cursor-pointer"
                                                onClick={(e) => handleRefreshCard(e, card)}
                                            >
                                                {card.isLoading ? (
                                                    <span className="animate-pulse font-mono text-xs">FETCHING DATA...</span>
                                                ) : (
                                                    <>
                                                        <Activity className="h-5 w-5 opacity-50" />
                                                        <span className="text-[10px] font-mono opacity-50">
                                                            CLICK TO RUN QUERY
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer Timestamp */}
                                    {card.timestamp && !card.isLoading && (
                                        <div className="mt-3 shrink-0 text-[10px] text-gray-600 font-mono text-right opacity-60">
                                            {card.timestamp.toLocaleTimeString()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {/* 隱藏的錨點 */}
                <div ref={bottomRef} className="w-full h-px" />
            </div>

            {/* --- 4. 輸入控制區 (Bottom - Matching ChatWindow) --- */}
            <div className="shrink-0 w-full bg-[#212121]">
                {/* 移除快速按鈕，僅保留輸入框，樣式與 ChatWindow 保持一致 */}
                <PromptBox input={input} setInput={setInput} onSubmit={handleManualSubmit} disabled={isLoading || isChecking} />
            </div>
        </div>
    );
}
