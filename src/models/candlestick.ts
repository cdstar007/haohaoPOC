/**
 * K 棒資料
 */
export interface CandleStick {
  /** 交易日 */
  date: string;
  /** 開盤價 */
  open: number;
  /** 最高價 */
  high: number;
  /** 最低價 */
  low: number;
  /** 收盤價 */
  close: number;
  /** 漲跌 */
  change: number;
  /** 漲跌幅 */
  changePct: number;
  /** 成交量 */
  volume: number;
  /** 5日均線 */
  ma5?: number;
  /** 10日均線 */
  ma10?: number;
  /** 20日均線 */
  ma20?: number;
  /** 60日均線 */
  ma60?: number;
}

/**
 * K 線 API 回應
 */
export interface StockDataResponse {
  data: Array<{
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    change: number;
    changePercent: number;
    volume: number;
    ma5?: number;
    ma10?: number;
    ma20?: number;
    ma60?: number;
  }>;
}

/**
 * K 線週期
 */
export type KLinePeriod = 'daily' | 'weekly' | 'monthly';

/**
 * K 線類型（是否還原）
 */
export type KLineType = 'normal' | 'reduction';

/**
 * K 線配置
 */
export interface KLineConfig {
  period: KLinePeriod;
  isReduction: boolean;
}

/**
 * K 線 API 端點映射
 */
export const KLINE_API_MAP: Record<KLinePeriod, Record<KLineType, string>> = {
  daily: {
    normal: '/v2/daily-stock-data/data',
    reduction: '/v2/reduction-daily-stock-data/data',
  },
  weekly: {
    normal: '/v2/weekly-stock-data/data',
    reduction: '/v2/reduction-weekly-stock-data/data',
  },
  monthly: {
    normal: '/v2/monthly-stock-data/data',
    reduction: '/v2/reduction-monthly-stock-data/data',
  },
};
