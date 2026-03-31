/**
 * 年度股利
 */
export interface YearlyDividend {
  /** 年度 */
  year: string;
  /** 現金股利 (元) */
  cashDividend: number;
  /** 股票股利 (元) */
  stockDividend: number;
  /** 現金殖利率 (%) */
  cashYield: number;
  /** EPS */
  eps?: number;
  /** 盈餘分配率 */
  payoutRatio?: number;
}

/**
 * 年度殖利率 API 回應
 */
export interface YearlyDividendYieldResponse {
  data: Array<{
    year: string;
    cashDividend: number;
    stockDividend: number;
    cashYield: number;
    eps?: number;
    payoutRatio?: number;
  }>;
}

/**
 * 除權息記錄
 */
export interface ExDividendRecord {
  /** 年度季度 */
  yearQuarter: string;
  /** 現金股利 */
  cashDividend: number;
  /** 股票股利 */
  stockDividend: number;
  /** 除權息日期 */
  exDividendDate?: string;
  /** 發放日期 */
  paymentDate?: string;
  /** 填息天數 */
  fillDays?: number;
}

/**
 * 除權息 API 回應
 */
export interface ExDividendDateResponse {
  data: Array<{
    yearQuarter: string;
    cashDividend: number;
    stockDividend: number;
    exDividendDate?: string;
    paymentDate?: string;
    fillDays?: number;
  }>;
}

/**
 * 配息頻率
 */
export type DividendFrequency = '月配' | '季配' | '半年配' | '年配' | '不定期';

/**
 * 股利摘要（顯示在頂部）
 */
export interface DividendSummary {
  /** 殖利率 */
  yield: number;
  /** 現金股利 */
  cashDividend: number;
  /** 配息頻率 */
  frequency: DividendFrequency;
}
