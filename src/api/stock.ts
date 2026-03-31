/**
 * 股利頁 API
 * K 線資料 + 股利資料
 */

import { get } from './client';
import { API_ENDPOINTS } from '../constants/api';
import {
  generateMockKLineData,
  generateMockYearlyDividend,
  generateMockExDividend,
  mockDelay,
} from './mock';
import { isAPIAvailable } from './config';
import type {
  StockDataResponse,
  KLineConfig,
  YearlyDividendYieldResponse,
  ExDividendDateResponse,
  CandleStick,
  YearlyDividend,
  ExDividendRecord,
} from '../models';

/**
 * 取得 K 線資料
 * @param stockId 股票代號
 * @param config K 線配置 (週期 + 是否還原)
 */
export const fetchKLineData = async (
  stockId: string,
  config: KLineConfig
): Promise<CandleStick[]> => {
  const { period, isReduction } = config;
  
  // 檢查 API 可用性
  const apiMap: Record<string, keyof typeof isAPIAvailable> = {
    'daily-normal': 'dailyStockData',
    'daily-reduction': 'reductionDailyStockData',
    'weekly-normal': 'weeklyStockData',
    'weekly-reduction': 'reductionWeeklyStockData',
    'monthly-normal': 'monthlyStockData',
    'monthly-reduction': 'reductionMonthlyStockData',
  };
  
  const apiKey = `${period}-${isReduction ? 'reduction' : 'normal'}`;
  
  if (!isAPIAvailable(apiMap[apiKey])) {
    await mockDelay(400);
    const response = generateMockKLineData(stockId, period);
    return response.data.map((item) => ({
      date: item.date,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
      change: item.change,
      changePct: item.changePercent,
      volume: item.volume,
      ma5: item.ma5,
      ma10: item.ma10,
      ma20: item.ma20,
      ma60: item.ma60,
    }));
  }

  // 動態選擇 API 端點
  const endpointMap = {
    daily: {
      normal: API_ENDPOINTS.dailyStockData,
      reduction: API_ENDPOINTS.reductionDailyStockData,
    },
    weekly: {
      normal: API_ENDPOINTS.weeklyStockData,
      reduction: API_ENDPOINTS.reductionWeeklyStockData,
    },
    monthly: {
      normal: API_ENDPOINTS.monthlyStockData,
      reduction: API_ENDPOINTS.reductionMonthlyStockData,
    },
  };

  const type: 'normal' | 'reduction' = isReduction ? 'reduction' : 'normal';
  const endpoint = endpointMap[period][type];

  const response = await get<StockDataResponse>(endpoint, {
    stock_id: stockId,
  });

  return response.data.map((item) => ({
    date: item.date,
    open: item.open,
    high: item.high,
    low: item.low,
    close: item.close,
    change: item.change,
    changePct: item.changePercent,
    volume: item.volume,
    ma5: item.ma5,
    ma10: item.ma10,
    ma20: item.ma20,
    ma60: item.ma60,
  }));
};

/**
 * 取得年度殖利率資料
 * @param stockId 股票代號
 */
export const fetchYearlyDividendYield = async (
  stockId: string
): Promise<YearlyDividend[]> => {
  if (!isAPIAvailable('yearlyDividendYield')) {
    await mockDelay(300);
    const response = generateMockYearlyDividend(stockId);
    return response.data.map((item) => ({
      year: item.year,
      cashDividend: item.cashDividend,
      stockDividend: item.stockDividend,
      cashYield: item.cashYield,
      eps: item.eps,
      payoutRatio: item.payoutRatio,
    }));
  }

  const response = await get<YearlyDividendYieldResponse>(
    API_ENDPOINTS.yearlyDividendYield,
    { stock_id: stockId }
  );

  return response.data.map((item) => ({
    year: item.year,
    cashDividend: item.cashDividend,
    stockDividend: item.stockDividend,
    cashYield: item.cashYield,
    eps: item.eps,
    payoutRatio: item.payoutRatio,
  }));
};

/**
 * 取得除權息資料
 * @param stockId 股票代號
 */
export const fetchExDividendDate = async (
  stockId: string
): Promise<ExDividendRecord[]> => {
  if (!isAPIAvailable('exDividendDate')) {
    await mockDelay(300);
    const response = generateMockExDividend(stockId);
    return response.data.map((item) => ({
      yearQuarter: item.yearQuarter,
      cashDividend: item.cashDividend,
      stockDividend: item.stockDividend,
      exDividendDate: item.exDividendDate,
      paymentDate: item.paymentDate,
      fillDays: item.fillDays,
    }));
  }

  const response = await get<ExDividendDateResponse>(
    API_ENDPOINTS.exDividendDate,
    { stock_id: stockId }
  );

  return response.data.map((item) => ({
    yearQuarter: item.yearQuarter,
    cashDividend: item.cashDividend,
    stockDividend: item.stockDividend,
    exDividendDate: item.exDividendDate,
    paymentDate: item.paymentDate,
    fillDays: item.fillDays,
  }));
};

/**
 * 並行取得股利頁所有資料
 */
export const fetchDividendPageData = async (
  stockId: string,
  kLineConfig?: KLineConfig
) => {
  const config = kLineConfig || { period: 'daily', isReduction: false };

  const [kLineData, yearlyDividend, exDividend] = await Promise.allSettled([
    fetchKLineData(stockId, config),
    fetchYearlyDividendYield(stockId),
    fetchExDividendDate(stockId),
  ]);

  return {
    kLineData: kLineData.status === 'fulfilled' ? kLineData.value : null,
    yearlyDividend: yearlyDividend.status === 'fulfilled' ? yearlyDividend.value : null,
    exDividend: exDividend.status === 'fulfilled' ? exDividend.value : null,
  };
};
