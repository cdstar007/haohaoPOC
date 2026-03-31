/**
 * 股票資料相關 Hooks
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import type { RankingItem, CandleStick, YearlyDividend, ExDividendRecord, RichPrice, KLineConfig, DividendSummary } from '../models';
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
 * 計算配息頻率
 * 根據年度除息記錄數量判斷
 */
const calculateDividendFrequency = (exDividendData: ExDividendRecord[]): DividendSummary['frequency'] => {
  if (exDividendData.length === 0) return '年配';
  
  // 取得最近一年的記錄數
  const currentYear = new Date().getFullYear().toString();
  const lastYear = (new Date().getFullYear() - 1).toString();
  
  const recentRecords = exDividendData.filter(r => 
    r.yearQuarter.startsWith(currentYear) || r.yearQuarter.startsWith(lastYear)
  );
  
  const count = recentRecords.length;
  
  if (count >= 10) return '月配';
  if (count >= 4) return '季配';
  if (count >= 2) return '半年配';
  return '年配';
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

  // 計算摘要數據
  const summary = useMemo(() => {
    // 最新年度殖利率
    const latestYearly = yearlyDividend[yearlyDividend.length - 1];
    const cashYield = latestYearly?.cashYield || 0;
    
    // 最新除息記錄（按日期排序）
    const sortedExDividend = [...exDividend].sort((a, b) => {
      const dateA = a.exDividendDate ? new Date(a.exDividendDate).getTime() : 0;
      const dateB = b.exDividendDate ? new Date(b.exDividendDate).getTime() : 0;
      return dateB - dateA;
    });
    
    const latestExDividend = sortedExDividend[0];
    const cashDividend = latestExDividend?.cashDividend || 0;
    const frequency = calculateDividendFrequency(exDividend);
    
    return {
      yield: cashYield,
      cashDividend,
      frequency,
      latestExDividendDate: latestExDividend?.exDividendDate || null,
    };
  }, [yearlyDividend, exDividend]);

  return {
    kLineData,
    yearlyDividend,
    exDividend,
    summary,
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
