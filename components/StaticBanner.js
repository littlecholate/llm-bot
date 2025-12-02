'use client';

import { Timer } from 'lucide-react';

export default function LiveEventWidget() {
    const eventData = {
        timeLeft: '3d 12h 05m',
        imageUrl: 'kkk.png',
    };

    return (
        <div className="relative w-full overflow-hidden rounded-xl border border-white/10 bg-[#252525] shadow-md group">
            {/* Banner 圖片區 */}
            <div className="relative w-full h-24 overflow-hidden">
                <img
                    src={eventData.imageUrl}
                    alt="Event Banner"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* 漸層遮罩：加強底部黑色，確保白色文字清楚 */}
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-90" />
            </div>

            {/* 倒數計時器 */}
            <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-mono font-medium text-gray-200 backdrop-blur-sm border border-white/5 shadow-sm">
                <Timer className="h-3 w-3 mr-0.5 text-cyan-400" />
                <span className="tracking-wide">{eventData.timeLeft}</span>
            </div>
        </div>
    );
}
