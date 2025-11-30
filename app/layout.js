import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { cookies } from 'next/headers'; // 1. 引入 cookies
import { SettingsProvider } from '../context/SettingsContext'; // 2. 引入 Provider

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata = {
    title: 'Hisekai TW',
    description: 'Project Sekai AI Assistant',
};

// 3. 將 RootLayout 改為 async
export default async function RootLayout({ children }) {
    // 4. 讀取 Cookies
    const cookieStore = await cookies();
    const langCookie = cookieStore.get('hisekai_lang');
    const charCookie = cookieStore.get('hisekai_char');

    // 準備初始設定
    const initialSettings = {
        language: langCookie?.value ? decodeURIComponent(langCookie.value) : undefined,
        character: charCookie?.value ? decodeURIComponent(charCookie.value) : undefined,
    };

    return (
        <html lang="en">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                {/* 5. 包裹 SettingsProvider 並傳入初始值 */}
                <SettingsProvider initialSettings={initialSettings}>{children}</SettingsProvider>
            </body>
        </html>
    );
}
