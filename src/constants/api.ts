/**
 * API 設定常數
 */

import { Platform } from 'react-native';

/**
 * 環境配置
 */
export const API_ENV = {
  development: {
    baseURL: 'https://api.nstock.tw',
  },
  staging: {
    baseURL: 'https://api.nstock.tw',
  },
  production: {
    baseURL: 'https://api.nstock.tw',
  },
} as const;

/**
 * 當前環境
 */
export const CURRENT_ENV: keyof typeof API_ENV = __DEV__ ? 'development' : 'production';

/**
 * Base URL
 */
export const BASE_URL = API_ENV[CURRENT_ENV].baseURL;

/**
 * App 代號
 */
export const APP_AGENT = 'wellfiniance';

/**
 * App 版本
 */
export const APP_VERSION = '1.0.0';

/**
 * OS 類型
 */
export const OS_TYPE = Platform.OS === 'ios' ? 'ios' : 'android';

/**
 * 通用查詢參數
 * 每支 API 請求路徑須附加以下三個查詢參數
 */
export const getDefaultParams = () => ({
  agent: APP_AGENT,
  os: OS_TYPE,
  version: APP_VERSION,
});

/**
 * API 逾時時間 (毫秒)
 */
export const API_TIMEOUT = 30000;

/**
 * API 端點
 */
export const API_ENDPOINTS = {
  // 列表頁
  heatRanking: '/v2/strategy/heat-ranking',
  realTimeQuotes: '/real-time-quotes/data',

  // 股利頁 - K 線 (6 支)
  dailyStockData: '/v2/daily-stock-data/data',
  weeklyStockData: '/v2/weekly-stock-data/data',
  monthlyStockData: '/v2/monthly-stock-data/data',
  reductionDailyStockData: '/v2/reduction-daily-stock-data/data',
  reductionWeeklyStockData: '/v2/reduction-weekly-stock-data/data',
  reductionMonthlyStockData: '/v2/reduction-monthly-stock-data/data',

  // 股利頁 - 股利資料
  yearlyDividendYield: '/yearly-dividend-yield/data',
  exDividendDate: '/ex-dividend-date/data',

  // 估價頁
  richPrice: '/v2/rich-price/data',
} as const;

/**
 * Heat Ranking 類別 ID
 */
export const RANKING_CATEGORY = {
  /** 最新配息（除權日期排行） */
  latestDividend: 8,
  /** 配最多（現金殖利率排行） */
  highestYield: 7,
} as const;
