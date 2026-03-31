/**
 * 股票全局狀態管理
 * 用於跨頁面共享當前選中的股票
 */

import { create } from 'zustand';

interface StockState {
  // 當前選中的股票
  selectedStock: {
    stockId: string;
    stockName: string;
  };
  // 設置選中的股票
  setSelectedStock: (stockId: string, stockName: string) => void;
}

// 預設股票
const DEFAULT_STOCK = {
  stockId: '0050',
  stockName: '元大台灣50',
};

export const useStockStore = create<StockState>((set) => ({
  selectedStock: DEFAULT_STOCK,
  setSelectedStock: (stockId, stockName) =>
    set({ selectedStock: { stockId, stockName } }),
}));
