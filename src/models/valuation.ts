/**
 * 價格區間
 */
export interface PriceRange {
  /** 高價 */
  high: number;
  /** 合理價 */
  fair: number;
  /** 低價 */
  low: number;
}

/**
 * 合理價估算
 */
export interface RichPrice {
  stockId: string;
  dividendMethod: {
    oneYear: PriceRange;
    threeYear: PriceRange;
    fiveYear: PriceRange;
    tenYear: PriceRange;
  };
  closingPrices: Array<{
    date: string;
    price: number;
  }>;
}

/**
 * 合理價 API 回應
 */
export interface RichPriceResponse {
  data: {
    stockId: string;
    dividendMethod: {
      oneYear: {
        high: number;
        fair: number;
        low: number;
      };
      threeYear: {
        high: number;
        fair: number;
        low: number;
      };
      fiveYear: {
        high: number;
        fair: number;
        low: number;
      };
      tenYear: {
        high: number;
        fair: number;
        low: number;
      };
    };
    closingPrices: Array<{
      date: string;
      price: number;
    }>;
  };
}

/**
 * 估價年份選項
 */
export type ValuationYear = 1 | 3 | 5 | 10;

/**
 * 估價年份選項配置
 */
export const VALUATION_YEAR_OPTIONS: { label: string; value: ValuationYear }[] = [
  { label: '一年', value: 1 },
  { label: '三年', value: 3 },
  { label: '五年', value: 5 },
  { label: '十年', value: 10 },
];

/**
 * 估價圖表資料點
 */
export interface ValuationChartPoint {
  date: string;
  price: number;
  high?: number;
  fair?: number;
  low?: number;
}

/**
 * 股價通知設定
 */
export interface PriceNotification {
  enabled: boolean;
  upperLimit?: number;
  lowerLimit?: number;
}
