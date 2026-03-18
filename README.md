# Arcade Quiz Boss (Pixel Art 闖關問答遊戲)

這是一個以 Pixel Art 風格設計的 React (Vite) 網頁闖關問答遊戲。
透過 Google Apps Script 作為後端，將 Google Sheets 當作資料庫，遊戲不僅能隨機撈取題目，還會在後端安全的防作弊計算分數並記錄玩家過關表現。

## 目錄

- [環境清單](#環境清單)
- [專案安裝與執行](#專案安裝與執行)
- [Google Sheets 建立與設定](#google-sheets-建立與設定)
- [Google Apps Script 部署方式](#google-apps-script-部署方式)
- [環境變數設定 (.env)](#環境變數設定-env)

## 環境清單

- Node.js (v18+)
- Google 帳號 (用來建立 Spreadsheet 與 Apps Script)

## 專案安裝與執行

1. **進入專案目錄**
   確保你在專案目錄中：

   ```bash
   cd d:\WebSite-template\antigravity-react
   ```

2. **安裝依賴套件**
   如果你還沒安裝過：

   ```bash
   npm install
   ```

3. **啟動開發伺服器**
   ```bash
   npm run dev
   ```
   現在你可以在瀏覽器中打開 `http://localhost:5173/` 開始遊戲。

## Google Sheets 建立與設定

請建立一個新的 Google 試算表，並且在最下方為它建立**兩個工作表 (Sheet)**。
請嚴格遵守以下工作表名稱與欄位順序！

### 1. 工作表名稱：`題目`

此工作表用來放題庫。**第一列請務必作為標題列**，請依照以下順序建立 A~G 欄位：

| 題號       | 題目       | A       | B       | C       | D       | 解答                      |
| :--------- | :--------- | :------ | :------ | :------ | :------ | :------------------------ |
| (填寫內容) | (填寫內容) | (選項A) | (選項B) | (選項C) | (選項D) | (填寫正確選項字母，如: A) |

_(註：你可以將後面提供的「生成式AI基礎知識」題目直接複製並貼上到這裡！)_

### 2. 工作表名稱：`回答`

此工作表用來存放玩家的作答紀錄。**第一列請務必作為標題列**，依序填寫：

| ID  | 闖關次數 | 總分 | 最高分 | 第一次通關分數 | 花了幾次通關 | 最近遊玩時間 |
| :-- | :------- | :--- | :----- | :------------- | :----------- | :----------- |

## Google Apps Script 部署方式

這將作為遊戲後端的 API：

1. 開啟剛剛建立好的 Google 試算表
2. 點選頂部選單的 **擴充功能 (Extensions) > Apps Script**
3. 將原本編輯器裡的 `myFunction` 清空，並打開專案裡的 `gas_script.js`，將其全部內容複製貼上。
4. 點一下上方的儲存 (磁碟片圖示) 💾
5. 點擊右上角的 **[部署 (Deploy)] > [新增部署 (New deployment)]**
6. 點擊齒輪圖示 ⚙ 並選擇 **[網頁應用程式 (Web app)]**
7. 在「說明」隨便填入 (例如 v1)
8. **「執行身分」**: 選擇**我 (Me)**
9. **「誰可以存取 (Who has access)」**: 務必選擇**所有人 (Anyone)**
10. 點擊 **[部署]**。(第一次部署會要求「授予存取權」的授權審核，點選你的 Google 帳號 -> 點選 "進階" -> 點選 "前往... (不安全)" -> 點擊 "允許"。)
11. 部署成功後，你會看到一串 **網頁應用程式網址 (Web app URL)**，請把它整串複製下來！

## 環境變數設定 (.env)

1. 在本機專案 `antigravity-react` 目錄中，找到 `.env` 檔案。
2. 將剛才複製的 GAS 網址貼上，取代 `YOUR_SCRIPT_ID`：

```ini
VITE_GOOGLE_APP_SCRIPT_URL=https://script.google.com/macros/s/你的網址/exec
VITE_PASS_THRESHOLD=6  # 需要答對幾題才算通過
VITE_QUESTION_COUNT=10 # 每次出題的總題數
```

重新執行 `npm run dev` 來載入最新的環境變數，現在你就可以正常獲取題目且上傳成績了！

## GitHub Pages 自動部署 (CI/CD)

這個專案已經內建了 GitHub Actions 部署工作流程，會在你 Push 到 `main` 分支時自動打包發布到 GitHu Pages 上。

**必須的設定步驟：**

1. 請先確保你的專案推送到 GitHub。
2. 進入你 GitHub Repo 的 **Settings** > **Pages**，將 `Build and deployment` 底下的 `Source` 換成 **GitHub Actions**。
3. **注入你專屬的環境變數**：
   前往 **Settings** > **Secrets and variables** > **Actions** 頁面：
   - **建立 Secret (機密資訊):** 點擊 `New repository secret`
     - Name: `VITE_GOOGLE_APP_SCRIPT_URL`
     - Value: `你的 Google Apps Script 部署網址`
   - **建立 Variable (一般變數):** 點擊 `New repository variable` (也可以不建立，會採用預設的滿分100制60分及10題)
     - Name: `VITE_PASS_THRESHOLD` \ Value: `60`
     - Name: `VITE_QUESTION_COUNT` \ Value: `10`
4. 設定完畢後，下次你只要將程式碼 Push 到 `main` (或在 Actions 頁面手動觸發)，系統就會自動將你的專案發布為公開網頁！
