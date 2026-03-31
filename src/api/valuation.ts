/**
 * 估價頁 API
 */

import { get } from './client';
import { API_ENDPOINTS } from '../constants/api';
import { generateMockRichPrice, mockDelay } from './mock';
import { isAPIAvailable } from './config';
import type {
  RichPriceResponse,
  RichPrice,
  ValuationYear,
  PriceRange,
} from '../models';

/**
 * 取得合理價資料
 * @param stockId 股票代號
 */
export const fetchRichPrice = async (stockId: string): Promise<RichPrice> => {
  if (!isAPIAvailable('richPrice')) {
    await mockDelay(400);
    const response = generateMockRichPrice(stockId);
    const data = response.data;

    return {
      stockId: data.stockId,
      dividendMethod: {
        oneYear: data.dividendMethod.oneYear,
        threeYear: data.dividendMethod.threeYear,
        fiveYear: data.dividendMethod.fiveYear,
        tenYear: data.dividendMethod.tenYear,
      },
      closingPrices: data.closingPrices.map((item) => ({
        date: item.date,
        price: item.price,
      })),
    };
  }

  // 真實 API 資料結構轉換
  const response = await get<any>(API_ENDPOINTS.richPrice, {
    stock_id: stockId,
  });

  const data = response.data[0]; // API 回傳是陣列

  // 轉換真實 API 資料結構
  const dividendMethod = data.股利法;
  const closingPrices = data.收盤價.map((item: any) => ({
    date: item.日期,
    price: parseFloat(item.收盤價),
  }));

  return {
    stockId: data.股票代號,
    dividendMethod: {
      oneYear: {
        high: parseFloat(dividendMethod.一年.高價),
        fair: parseFloat(dividendMethod.一年.合理價),
        low: parseFloat(dividendMethod.一年.低價),
      },
      threeYear: {
        high: parseFloat(dividendMethod.三年.高價),
        fair: parseFloat(dividendMethod.三年.合理價),
        low: parseFloat(dividendMethod.三年.低價),
      },
      fiveYear: {
        high: parseFloat(dividendMethod.五年.高價),
        fair: parseFloat(dividendMethod.五年.合理價),
        low: parseFloat(dividendMethod.五年.低價),
      },
      tenYear: {
        high: parseFloat(dividendMethod.十年.高價),
        fair: parseFloat(dividendMethod.十年.合理價),
        low: parseFloat(dividendMethod.十年.低價),
      },
    },
    closingPrices,
  };
};

/**
 * 根據年份取得價格區間
 */
export const getPriceRangeByYear = (
  richPrice: RichPrice,
  year: ValuationYear
): PriceRange => {
  switch (year) {
    case 1:
      return richPrice.dividendMethod.oneYear;
    case 3:
      return richPrice.dividendMethod.threeYear;
    case 5:
      return richPrice.dividendMethod.fiveYear;
    case 10:
      return richPrice.dividendMethod.tenYear;
    default:
      return richPrice.dividendMethod.oneYear;
  }
};
