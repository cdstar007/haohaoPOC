/**
 * 股票基本資訊
 */
export interface Stock {
  /** 股票代號 */
  stockId: string;
  /** 股票名稱 */
  stockName: string;
}

/**
 * 排行項目
 */
export interface RankingItem {
  stockId: string;
  stockName: string;
  fields: Array<{
    name: string;
    value: string;
  }>;
  // 合併後補充欄位
  currentPrice?: number;
  priceChange?: number;
  priceChangePct?: number;
}

/**
 * 排行 API 回應
 */
export interface HeatRankingResponse {
  data: {
    /** Unix timestamp (String) */
    更新時間: string;
    個股: Array<{
      股票代號: string;
      股票名稱: string;
      欄位: Array<{
        名稱: string;
        數值: string;
      }>;
    }>;
  };
}

/**
 * 即時報價
 */
export interface RealTimeQuote {
  stockId: string;
  currentPrice: number;
  priceChange: number;
  priceChangePct: number;
}

/**
 * 即時報價 API 回應
 */
export interface RealTimeQuotesResponse {
  [stockId: string]: {
    當盤成交價: number;
    漲跌: number;
    漲跌幅: number;
  };
}
