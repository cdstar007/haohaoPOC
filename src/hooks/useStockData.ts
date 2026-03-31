/**
 * 股票資料相關 Hooks
 */

import { useState, useCallback, useEffect } from 'react';
import type { RankingItem, CandleStick, YearlyDividend, ExDividendRecord, RichPrice, KLineConfig } from '../models';
import { fetchRankingWithQuotes, fetchDividendPageData, fetchRichPrice } from '../api';

/**
 * 列表頁資料 Hook
 */
export const useRankingData = (categoryId: number) => {
  const [items, setItems] = useState<RankingItem[]>([]);
  const [updateTime, setUpdateTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchRankingWithQuotes(categoryId);
      setItems(result.items);
      setUpdateTime(result.updateTime);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('載入失敗'));
    } finally {
      setIsLoading(false);
    }
  }, [categoryId]);

  const refresh = useCallback(() => {
    return loadData();
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { items, updateTime, isLoading, error, refresh };
};

/**
 * 股利頁資料 Hook
 */
export const useDividendData = (stockId: string, kLineConfig: KLineConfig) => {
  const [kLineData, setKLineData] = useState<CandleStick[]>([]);
  const [yearlyDividend, setYearlyDividend] = useState<YearlyDividend[]>([]);
  const [exDividend, setExDividend] = useState<ExDividendRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(async () => {
    if (!stockId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchDividendPageData(stockId, kLineConfig);
      if (result.kLineData) setKLineData(result.kLineData);
      if (result.yearlyDividend) setYearlyDividend(result.yearlyDividend);
      if (result.exDividend) setExDividend(result.exDividend);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('載入失敗'));
    } finally {
      setIsLoading(false);
    }
  }, [stockId, kLineConfig]);

  const refresh = useCallback(() => {
    return loadData();
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    kLineData,
    yearlyDividend,
    exDividend,
    isLoading,
    error,
    refresh,
  };
};

/**
 * 估價頁資料 Hook
 */
export const useValuationData = (stockId: string) => {
  const [richPrice, setRichPrice] = useState<RichPrice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(async () => {
    if (!stockId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchRichPrice(stockId);
      setRichPrice(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('載入失敗'));
    } finally {
      setIsLoading(false);
    }
  }, [stockId]);

  const refresh = useCallback(() => {
    return loadData();
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { richPrice, isLoading, error, refresh };
};
