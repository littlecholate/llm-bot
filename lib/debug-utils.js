// lib/debug-utils.js

// ANSI Color Codes for Terminal
const COLORS = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    cyan: '\x1b[36m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    blue: '\x1b[34m',
    bgBlue: '\x1b[44m',
};

// GPT-4o-mini Pricing (USD per 1M tokens) - Update as needed
const PRICING = {
    input: 0.15,
    output: 0.6,
};

export class DebugLogger {
    constructor(scope = 'System') {
        this.scope = scope;
        this.timers = {};
        this.startTime = Date.now();
    }

    // 🕒 效能計時器
    time(label) {
        this.timers[label] = performance.now();
    }

    timeEnd(label) {
        if (!this.timers[label]) return 0;
        const duration = (performance.now() - this.timers[label]).toFixed(2);
        delete this.timers[label];
        return duration; // ms
    }

    // 💰 成本計算機
    calculateCost(usage) {
        if (!usage) return { inputCost: 0, outputCost: 0, totalCost: 0 };

        const inputCost = (usage.prompt_tokens / 1_000_000) * PRICING.input;
        const outputCost = (usage.completion_tokens / 1_000_000) * PRICING.output;

        return {
            inputCost,
            outputCost,
            totalCost: inputCost + outputCost,
        };
    }

    // 🎨 格式化輸出
    logSummary({ usage, duration, steps = [] }) {
        const { inputCost, outputCost, totalCost } = this.calculateCost(usage);

        console.log('\n' + COLORS.dim + '─'.repeat(50) + COLORS.reset);
        console.log(`${COLORS.bgBlue}${COLORS.bright}  🤖 AI Interaction Summary  ${COLORS.reset}\n`);

        // 1. Performance Stats
        console.log(`${COLORS.cyan}⏱️  Latency:${COLORS.reset}`);
        console.log(`   • Total Duration: ${COLORS.bright}${duration}ms${COLORS.reset}`);
        if (steps.length > 0) {
            steps.forEach((step) => {
                console.log(`   • ${step.name}: ${step.duration}ms`);
            });
        }

        // 2. Token Usage
        if (usage) {
            console.log(`\n${COLORS.yellow}📊 Token Usage:${COLORS.reset}`);
            console.log(`   • Input:  ${usage.prompt_tokens}`);
            console.log(`   • Output: ${usage.completion_tokens}`);
            console.log(`   • Total:  ${usage.total_tokens}`);

            // 3. Cost Analysis
            console.log(`\n${COLORS.green}Pf Cost Analysis (GPT-4o-mini):${COLORS.reset}`);
            console.log(`   • Input:  $${inputCost.toFixed(6)}`);
            console.log(`   • Output: $${outputCost.toFixed(6)}`);
            console.log(`   • ${COLORS.bright}Total:  $${totalCost.toFixed(6)}${COLORS.reset}`);
        } else {
            console.log(`\n${COLORS.red}⚠️  No Usage Data Available${COLORS.reset}`);
        }

        console.log(COLORS.dim + '─'.repeat(50) + COLORS.reset + '\n');
    }

    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const prefix = `[${timestamp}] [${this.scope}]`;

        switch (type) {
            case 'error':
                console.error(`${COLORS.red}${prefix} ❌ ${message}${COLORS.reset}`);
                break;
            case 'warn':
                console.warn(`${COLORS.yellow}${prefix} ⚠️ ${message}${COLORS.reset}`);
                break;
            case 'success':
                console.log(`${COLORS.green}${prefix} ✅ ${message}${COLORS.reset}`);
                break;
            default:
                console.log(`${COLORS.dim}${prefix}${COLORS.reset} ${message}`);
        }
    }
}
