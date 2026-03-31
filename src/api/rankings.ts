/**
 * 列表頁 API
 */

import { get } from './client';
import { API_ENDPOINTS, RANKING_CATEGORY } from '../constants/api';
import {
  generateMockHeatRanking,
  generateMockRealTimeQuotes,
  mockDelay,
} from './mock';
import { isAPIAvailable } from './config';
import type {
  HeatRankingResponse,
  RealTimeQuotesResponse,
  RankingItem,
} from '../models';

/**
 * 取得熱門排行
 * @param categoryId 類別 ID (8: 最新配息, 7: 配最多)
 * @param limit 筆數限制 (預設 100)
 */
export const fetchHeatRanking = async (
  categoryId: number,
  limit: number = 100
): Promise<HeatRankingResponse> => {
  if (!isAPIAvailable('heatRanking')) {
    await mockDelay(500);
    return generateMockHeatRanking(categoryId);
  }

  return get(API_ENDPOINTS.heatRanking, {
    limit,
    category_id: categoryId,
  });
};

/**
 * 取得即時報價
 * @param stockIds 股票代號陣列
 */
export const fetchRealTimeQuotes = async (
  stockIds: string[]
): Promise<RealTimeQuotesResponse> => {
  if (!isAPIAvailable('realTimeQuotes')) {
    await mockDelay(300);
    return generateMockRealTimeQuotes(stockIds);
  }

  return get(API_ENDPOINTS.realTimeQuotes, {
    stock_ids: stockIds.join(','),
  });
};

/**
 * 取得排行資料（含即時報價）
 * 整合 heat-ranking 與 real-time-quotes
 */
export const fetchRankingWithQuotes = async (
  categoryId: number,
  limit: number = 100
): Promise<{ items: RankingItem[]; updateTime: string }> => {
  // 1. 取得排行資料
  const rankingData = await fetchHeatRanking(categoryId, limit);

  if (!rankingData?.data?.個股?.length) {
    return { items: [], updateTime: rankingData?.data?.更新時間 || '' };
  }

  const stocks = rankingData.data.個股;
  const stockIds = stocks.map((s) => s.股票代號);

  // 2. 批次取得即時報價
  let quotes: RealTimeQuotesResponse = {};
  try {
    quotes = await fetchRealTimeQuotes(stockIds);
  } catch (error) {
    console.error('Failed to fetch real-time quotes:', error);
  }

  // 3. 合併資料
  const items: RankingItem[] = stocks.map((stock) => {
    const quote = quotes[stock.股票代號];
    return {
      stockId: stock.股票代號,
      stockName: stock.股票名稱,
      fields: stock.欄位.map((f) => ({ name: f.名稱, value: f.數值 })),
      currentPrice: quote?.當盤成交價,
      priceChange: quote?.漲跌,
      priceChangePct: quote?.漲跌幅,
    };
  });

  return {
    items,
    updateTime: rankingData.data.更新時間,
  };
};

// 匯出類別 ID 常數
export { RANKING_CATEGORY };
