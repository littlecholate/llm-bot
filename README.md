我們採用 Next.js 16 (App Router) + Tailwind CSS，並堅持 MVP (Minimum Viable Product) 原則，完成了以下核心模組：

1. 核心架構與狀態管理 (Architecture)
   ChatContext (多房間系統)：

實作「單一介面，多重對話」的邏輯。

持久化 (Persistence)：使用 localStorage 儲存所有對話紀錄，重新整理頁面不丟失。

延遲建立 (Lazy Creation)：點擊「新對話」時只切換狀態，直到送出第一則訊息才真正建立資料庫存檔 (避免產生垃圾空對話)。

自動標題：根據第一則使用者訊息自動擷取前 15 字作為標題。

CRUD：支援新增、切換、刪除特定房間、清空當前對話。

2. UI/UX 介面設計
   極簡深色風格 (Dark Mode)：仿現代 AI 工具的高級深灰配色 (#171717, #212121)。

響應式側邊欄 (Responsive Sidebar)：

Desktop：固定側邊欄，支援分類折疊 (Accordion)。

Mobile：自動收合為 Drawer，附帶遮罩與漢堡選單。

導覽邏輯：整合「聊天室列表」與「功能工具」於同一側邊欄，支援精確的高亮狀態 (active) 判斷。

歡迎畫面 (Welcome Screen)：當對話為空時，顯示置中的大標題與 Logo，不顯示對話氣泡。

Prompt Box：膠囊型輸入框，「送出」按鈕，支援 Enter 發送、Shift+Enter 換行。

3. 設定系統 (Settings)
   Modal 視窗：使用 Custom Popup 實作的設定頁面，非換頁式，體驗更流暢。

自定義下拉選單 (Custom Dropdown)：不使用原生醜醜的 <select>，而是實作了浮動圖層 (Popover) 樣式的選單，並支援手機原生滾輪體驗。

LLM 整合準備：設定值 (語言、喜愛角色) 會儲存於 localStorage，並在送出訊息時自動封裝成 System Prompt。

4. 擴充性 (Extensibility)
   Config 分離：

lib/config.js：管理 UI 選單結構。

lib/llm-config.js：管理 AI 角色設定與 Prompt 生成邏輯。

工具視圖 (ToolsView)：預留了切換不同功能頁面的路由邏輯 (activeToolId)。
