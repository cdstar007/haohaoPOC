/**
 * Mock API 資料
 * 用於開發測試，當真實 API 未就緒時使用
 */

import type {
  HeatRankingResponse,
  RealTimeQuotesResponse,
  StockDataResponse,
  YearlyDividendYieldResponse,
  ExDividendDateResponse,
  RichPriceResponse,
} from '../models';

// 模擬股票資料
const MOCK_STOCKS = [
  { stockId: '0050', stockName: '元大台灣50', category: 'ETF' },
  { stockId: '0056', stockName: '元大高股息', category: 'ETF' },
  { stockId: '00878', stockName: '國泰永續高股息', category: 'ETF' },
  { stockId: '00881', stockName: '國泰台灣5G+', category: 'ETF' },
  { stockId: '00891', stockName: '中信關鍵半導體', category: 'ETF' },
  { stockId: '2330', stockName: '台積電', category: '個股' },
  { stockId: '2317', stockName: '鴻海', category: '個股' },
  { stockId: '2412', stockName: '中華電', category: '個股' },
  { stockId: '6505', stockName: '台塑化', category: '個股' },
  { stockId: '2881', stockName: '富邦金', category: '個股' },
  { stockId: '2882', stockName: '國泰金', category: '個股' },
  { stockId: '1216', stockName: '統一', category: '個股' },
];

/**
 * 產生 Mock 熱門排行資料
 */
export const generateMockHeatRanking = (
  categoryId: number
): HeatRankingResponse => {
  const isLatest = categoryId === 8; // 最新配息

  const stocks = MOCK_STOCKS.map((stock) => {
    // 生成隨機資料
    const cashDividend = (0.3 + Math.random() * 2).toFixed(2);
    
    // 除息日（未來 30 天內隨機）
    const exDate = new Date();
    exDate.setDate(exDate.getDate() + Math.floor(Math.random() * 30));
    const exDividendDate = `${exDate.getMonth() + 1}/${exDate.getDate()}`;

    const frequencies = ['月配', '季配', '半年配', '年配'];
    const frequency = frequencies[Math.floor(Math.random() * frequencies.length)];

    if (isLatest) {
      // 最新配息：股票、除息日、頻率、股價、現金股利
      return {
        股票代號: stock.stockId,
        股票名稱: stock.stockName,
        欄位: [
          { 名稱: '除息日', 數值: exDividendDate },
          { 名稱: '頻率', 數值: frequency },
          { 名稱: '現金股利', 數值: `${cashDividend}元` },
        ],
      };
    } else {
      // 配最多：股票、現金股利、頻率、股價、最近股利
      return {
        股票代號: stock.stockId,
        股票名稱: stock.stockName,
        欄位: [
          { 名稱: '現金股利', 數值: `${cashDividend}元` },
          { 名稱: '頻率', 數值: frequency },
          { 名稱: '最近股利', 數值: `${cashDividend}元` },
        ],
      };
    }
  });

  // 隨機排序
  const shuffled = [...stocks].sort(() => Math.random() - 0.5);

  return {
    data: {
      更新時間: Date.now().toString(),
      個股: shuffled,
    },
  };
};

/**
 * 產生 Mock 即時報價資料
 */
export const generateMockRealTimeQuotes = (
  stockIds: string[]
): RealTimeQuotesResponse => {
  const quotes: RealTimeQuotesResponse = {};

  stockIds.forEach((stockId) => {
    const basePrice = 20 + Math.random() * 200;
    const change = (Math.random() - 0.5) * 10;
    const changePct = (change / basePrice) * 100;

    quotes[stockId] = {
      當盤成交價: parseFloat(basePrice.toFixed(2)),
      漲跌: parseFloat(change.toFixed(2)),
      漲跌幅: parseFloat(changePct.toFixed(2)),
    };
  });

  return quotes;
};

/**
 * 產生 Mock K 線資料
 */
export const generateMockKLineData = (
  stockId: string,
  period: string
): StockDataResponse => {
  const days = period === 'daily' ? 60 : period === 'weekly' ? 52 : 24;
  const klineData: StockDataResponse['data'] = [];
  let basePrice = 100 + Math.random() * 200;

  for (let i = days; i >= 0; i--) {
    const date = new Date();
    if (period === 'daily') {
      date.setDate(date.getDate() - i);
    } else if (period === 'weekly') {
      date.setDate(date.getDate() - i * 7);
    } else {
      date.setMonth(date.getMonth() - i);
    }

    // 隨機價格變動
    const change = (Math.random() - 0.5) * 5;
    const open = basePrice;
    const close = basePrice + change;
    const high = Math.max(open, close) + Math.random() * 3;
    const low = Math.min(open, close) - Math.random() * 3;
    const volume = Math.floor(1000000 + Math.random() * 9000000);

    klineData.push({
      date: date.toISOString().split('T')[0],
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      change: parseFloat((close - open).toFixed(2)),
      changePercent: parseFloat(((close - open) / open * 100).toFixed(2)),
      volume,
      ma5: i < days - 4 ? parseFloat((basePrice + (Math.random() - 0.5) * 2).toFixed(2)) : undefined,
      ma10: i < days - 9 ? parseFloat((basePrice + (Math.random() - 0.5) * 3).toFixed(2)) : undefined,
      ma20: i < days - 19 ? parseFloat((basePrice + (Math.random() - 0.5) * 4).toFixed(2)) : undefined,
      ma60: i < days - 59 ? parseFloat((basePrice + (Math.random() - 0.5) * 5).toFixed(2)) : undefined,
    });

    basePrice = close;
  }

  return { data: klineData };
};

/**
 * 產生 Mock 年度股利資料
 */
export const generateMockYearlyDividend = (
  stockId: string
): YearlyDividendYieldResponse => {
  const currentYear = new Date().getFullYear();
  const yearlyData: YearlyDividendYieldResponse['data'] = [];

  for (let i = 4; i >= 0; i--) {
    const year = currentYear - i;
    const cashDividend = 2 + Math.random() * 4;
    const stockDividend = Math.random() > 0.5 ? Math.random() * 0.5 : 0;
    const cashYield = 3 + Math.random() * 6;
    const eps = cashDividend * (1.5 + Math.random());
    const payoutRatio = (cashDividend / eps) * 100;

    yearlyData.push({
      year: year.toString(),
      cashDividend: parseFloat(cashDividend.toFixed(2)),
      stockDividend: parseFloat(stockDividend.toFixed(2)),
      cashYield: parseFloat(cashYield.toFixed(2)),
      eps: parseFloat(eps.toFixed(2)),
      payoutRatio: parseFloat(payoutRatio.toFixed(2)),
    });
  }

  return { data: yearlyData };
};

/**
 * 產生 Mock 除權息資料
 */
export const generateMockExDividend = (
  stockId: string
): ExDividendDateResponse => {
  const exDividendData: ExDividendDateResponse['data'] = [];
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  const currentYear = new Date().getFullYear();

  for (let year = currentYear - 1; year <= currentYear; year++) {
    quarters.forEach((q, idx) => {
      const cashDividend = 0.3 + Math.random() * 1.2;
      const stockDividend = 0;
      const exDate = new Date(year, idx * 3 + 1, 15 + Math.floor(Math.random() * 15));
      const fillDays = Math.floor(Math.random() * 60) + 1;

      exDividendData.push({
        yearQuarter: `${year} ${q}`,
        cashDividend: parseFloat(cashDividend.toFixed(2)),
        stockDividend: parseFloat(stockDividend.toFixed(2)),
        exDividendDate: exDate.toISOString().split('T')[0],
        paymentDate: new Date(exDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        fillDays,
      });
    });
  }

  return { data: exDividendData };
};

/**
 * 產生 Mock 合理價資料
 */
export const generateMockRichPrice = (stockId: string): RichPriceResponse => {
  const currentPrice = 20 + Math.random() * 200;
  const baseDividend = 2 + Math.random() * 3;

  const generatePriceRange = (years: number) => {
    const dividend = baseDividend * (1 + (Math.random() - 0.5) * 0.3);
    const fair = dividend * (12 + years * 2);
    return {
      high: parseFloat((fair * 1.1).toFixed(2)),
      fair: parseFloat(fair.toFixed(2)),
      low: parseFloat((fair * 0.89).toFixed(2)),
    };
  };

  // 產生收盤價資料 (近 12 個月)
  const closingPrices = [];
  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const price = currentPrice * (1 + (Math.random() - 0.5) * 0.2);
    closingPrices.push({
      date: date.toISOString().split('T')[0],
      price: parseFloat(price.toFixed(2)),
    });
  }

  return {
    data: {
      stockId,
      dividendMethod: {
        oneYear: generatePriceRange(1),
        threeYear: generatePriceRange(3),
        fiveYear: generatePriceRange(5),
        tenYear: generatePriceRange(10),
      },
      closingPrices,
    },
  };
};

/**
 * 模擬 API 延遲
 */
export const mockDelay = (ms: number = 500): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
