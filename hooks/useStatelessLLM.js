'use client';

import { useState, useRef, useCallback } from 'react';

export function useStatelessLLM() {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState('');
    const abortControllerRef = useRef(null);

    const generate = useCallback(async (prompt, systemPrompt) => {
        setIsLoading(true);
        setResult(''); // 清空舊結果
        abortControllerRef.current = new AbortController();

        try {
            // 建構一個獨立的 messages 陣列
            const messages = [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt },
            ];

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages, max_tokens: 500 }),
                signal: abortControllerRef.current.signal,
            });

            if (!response.ok) throw new Error(response.statusText);

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;

            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;
                if (value) {
                    const chunkValue = decoder.decode(value, { stream: true });
                    // 直接更新 Local State
                    setResult((prev) => prev + chunkValue);
                }
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error(err);
                setResult((prev) => prev + `\n\n[Error]: ${err.message}`);
            }
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    }, []);

    const stop = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            setIsLoading(false);
        }
    }, []);

    return { generate, stop, isLoading, result };
}
