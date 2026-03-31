/**
 * API 配置
 * 控制哪些 API 使用真實資料，哪些使用 Mock
 * 
 * Web (瀏覽器) 開發時：使用 Mock 資料 (避免 CORS)
 * React Native (iOS/Android)：使用真實 API
 */

// 判斷是否在 Web 環境
const isWeb = typeof window !== 'undefined' && window.document;

// Web 開發時強制使用 Mock (因為 CORS 限制)
// React Native 使用真實 API
export const FORCE_MOCK = isWeb;

// 正式環境 API 可用性狀態
export const API_AVAILABILITY = {
  // 列表頁
  heatRanking: true,
  realTimeQuotes: false,

  // K 線 (6支)
  dailyStockData: true,
  weeklyStockData: true,
  monthlyStockData: true,
  reductionDailyStockData: true,
  reductionWeeklyStockData: true,
  reductionMonthlyStockData: true,

  // 股利資料
  yearlyDividendYield: false,
  exDividendDate: false,

  // 估價頁
  richPrice: true,
} as const;

// 取得 API 是否可用
export const isAPIAvailable = (apiName: keyof typeof API_AVAILABILITY): boolean => {
  if (FORCE_MOCK) return false; // Web 環境強制使用 Mock
  return API_AVAILABILITY[apiName];
};

// 是否使用 Mock (全局狀態)
export const USE_MOCK = FORCE_MOCK;
