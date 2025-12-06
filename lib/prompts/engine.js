// lib/prompts/engine.js
import { BASE_PERSONA } from './base';

export class PromptEngine {
    constructor(basePrompt = BASE_PERSONA) {
        this.parts = [basePrompt];
    }

    /**
     * 加入特定工具的指令集
     * @param {Function|string} instructionModule - Prompt 字串或生成函數
     * @param {Object} config - 傳給生成函數的參數
     */
    use(instructionModule, config = {}) {
        const content = typeof instructionModule === 'function' ? instructionModule(config) : instructionModule;

        this.parts.push(content);
        return this;
    }

    /**
     * 加入自定義補充 (例如 RAG 檢索到的 Context)
     */
    addContext(contextData) {
        if (contextData) {
            this.parts.push(`\n# 參考資料 (Context)\n${contextData}`);
        }
        return this;
    }

    build() {
        return this.parts.join('\n\n' + '-'.repeat(20) + '\n\n');
    }
}
