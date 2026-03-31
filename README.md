# 好好理財 App (WellFinianceApp)

> 基於 React Native + TypeScript 開發的台股理財資訊 App

---

## 📁 專案結構

```
WellFinianceApp/
├── src/
│   ├── api/                    # API 層
│   │   ├── client.ts           # API 客戶端 (axios 封裝)
│   │   ├── rankings.ts         # 列表頁 API
│   │   ├── stock.ts            # 股利頁 API (K線)
│   │   └── valuation.ts        # 估價頁 API
│   │
│   ├── models/                 # 資料模型 (TypeScript 型別)
│   │   ├── stock.ts            # 股票基本資訊、排行項目
│   │   ├── candlestick.ts      # K 棒資料、週期配置
│   │   ├── dividend.ts         # 年度股利、除權息記錄
│   │   ├── valuation.ts        # 合理價估算
│   │   └── index.ts
│   │
│   ├── screens/                # 頁面元件
│   │   ├── RankingsScreen/     # 列表頁 (主畫面)
│   │   │   └── index.tsx
│   │   ├── DividendScreen/     # 股利頁
│   │   │   └── index.tsx
│   │   └── ValuationScreen/    # 估價頁
│   │       └── index.tsx
│   │
│   ├── components/             # 共用元件 (待擴充)
│   │
│   ├── hooks/                  # 自定義 Hooks
│   │   └── useStockData.ts     # 股票資料相關 Hooks
│   │
│   ├── utils/                  # 工具函數
│   │   └── format.ts           # 格式化工具 (日期、數字、漲跌幅)
│   │
│   ├── constants/              # 常數定義
│   │   ├── colors.ts           # 主題色、圖表顏色
│   │   ├── api.ts              # API 端點、環境設定
│   │   └── index.ts
│   │
│   └── navigation/             # 導航配置
│       ├── types.ts            # 導航型別定義
│       └── index.tsx           # React Navigation 設定
│
├── App.tsx                     # 主入口
├── app.json                    # Expo 配置
├── package.json
└── tsconfig.json
```

---

## 🚀 開始開發

### 安裝依賴

```bash
npm install
```

### 啟動開發伺服器

```bash
# iOS 模擬器
npm run ios

# Android 模擬器
npm run android

# Web 版本
npm run web
```

---

## 📱 功能頁面

| 頁面 | 路徑 | 功能說明 |
|------|------|----------|
| 列表頁 | `/Rankings` | 最新配息/配最多排行、ETF/個股篩選 |
| 股利頁 | `/Dividend` | K 線圖(6支API)、年度股利圖表、表格 |
| 估價頁 | `/Valuation` | 股利法估算、價格區間、股價通知(靜態) |

---

## 🔌 API 整合

### 已實作的 API 模組

| API | 檔案 | 說明 |
|-----|------|------|
| `fetchRankingWithQuotes` | `api/rankings.ts` | 排行 + 即時報價 |
| `fetchKLineData` | `api/stock.ts` | K 線資料 (日/週/月 × 還原) |
| `fetchDividendPageData` | `api/stock.ts` | 並行載入股利頁資料 |
| `fetchRichPrice` | `api/valuation.ts` | 合理價估算 |

### 環境設定

修改 `src/constants/api.ts` 中的 `API_ENV` 來設定 Base URL：

```typescript
export const API_ENV = {
  development: {
    baseURL: 'https://api-dev.example.com',
  },
  staging: {
    baseURL: 'https://api-staging.example.com',
  },
  production: {
    baseURL: 'https://api.example.com',
  },
};
```

---

## 🎨 主題色彩

| 顏色 | 色碼 | 用途 |
|------|------|------|
| Primary | `#2D6AE7` | App 標題、選中 Tab、Chip 背景 |
| Up | `#FF5E5E` | 上漲 |
| Down | `#00B050` | 下跌 |
| Cash Dividend | `#749BDD` | 年度股利圖表 - 現金股利 |
| Stock Dividend | `#90B4CF` | 年度股利圖表 - 股票股利 |
| Cash Yield | `#FF5E5E` | 年度股利圖表 - 現金殖利率 |

---

## 📝 Phase 1 完成項目

- ✅ React Native + TypeScript 專案初始化 (Expo)
- ✅ API 客戶端封裝 (axios + 攔截器)
- ✅ 11 支 API 整合封裝
- ✅ 完整 TypeScript 型別定義
- ✅ React Navigation 導航架構
- ✅ 三個頁面骨架實作
- ✅ 工具函數 (format)
- ✅ 自定義 Hooks

---

## 🛣 下一步 (Phase 2)

1. 整合真實 API 端點
2. 實作列表頁資料載入與渲染
3. 整合 K 線圖表元件
4. 實作圖表互動功能

---

## 📄 License

MIT
