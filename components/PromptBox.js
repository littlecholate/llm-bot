'use client';

import { Send } from 'lucide-react';
import { cn } from '../lib/utils';

export default function PromptBox({ input, setInput, onSubmit, onClear, disabled }) {
    // 2. 接收 onClear prop
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSubmit(e);
        }
    };

    return (
        <div className="w-full bg-[#212121] pb-10 pt-4">
            <div className="mx-auto max-w-3xl px-4">
                {/* 輸入框容器：保持單行膠囊樣式 */}
                <div className="relative flex items-end gap-2 rounded-[26px] bg-[#2F2F2F] p-2 focus-within:ring-1 focus-within:ring-gray-500 transition-all">
                    {/* 輸入表單 (位於中間) */}
                    <form onSubmit={onSubmit} className="flex-1 min-w-0">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter your questions."
                            disabled={disabled}
                            rows={1}
                            // 修改: px-4 -> px-2 (因為左邊有按鈕了，稍微減少內距讓視覺平衡)
                            className="w-full resize-none bg-transparent px-2 py-3 text-white placeholder-gray-500 focus:outline-none min-h-[44px] max-h-[200px] disabled:opacity-50 text-sm leading-relaxed"
                            style={{ overflow: 'hidden' }}
                        />
                    </form>

                    {/* 送出按鈕 (位於右下) */}
                    <button
                        onClick={onSubmit}
                        disabled={!input.trim() || disabled}
                        className={cn(
                            'mb-1 mr-1 flex h-9 w-9 items-center justify-center rounded-full transition-colors',
                            input.trim() && !disabled
                                ? 'bg-white text-black hover:bg-gray-200'
                                : 'bg-transparent text-gray-500 cursor-not-allowed'
                        )}
                    >
                        <Send className="h-4 w-4" />
                    </button>
                </div>

                <div className="mt-3 text-center text-xs text-gray-500">AI content may be inaccurate.</div>
            </div>
        </div>
    );
}
