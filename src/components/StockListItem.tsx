/**
 * 股票列表項元件
 * 顯示排名、股票名稱、代號、除息日/殖利率、股價、漲跌等資訊
 * 排名 1-3 使用金銀銅樣式
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../constants';
import type { RankingItem } from '../models';
import { formatCurrency, formatPriceChange, getPriceChangeColor } from '../utils';

interface StockListItemProps {
  item: RankingItem;
  rank: number; // 排名 (1, 2, 3, ...)
  onPress?: (item: RankingItem) => void;
  showExDividendDate?: boolean; // true: 最新配息, false: 配最多
}

// 排名顏色定義
const RANK_COLORS = {
  1: { bg: '#FFD700', text: '#8B6914', border: '#E6C200' }, // 金色
  2: { bg: '#C0C0C0', text: '#4A4A4A', border: '#A8A8A8' }, // 銀色
  3: { bg: '#CD7F32', text: '#5C3A1A', border: '#B87333' }, // 銅色
};

export const StockListItem: React.FC<StockListItemProps> = ({
  item,
  rank,
  onPress,
  showExDividendDate = true,
}) => {
  const { stockId, stockName, fields, currentPrice, priceChange, priceChangePct } = item;

  // 從 fields 解析資料
  const getFieldValue = (name: string): string => {
    const field = fields.find((f) => f.name === name);
    return field?.value || '--';
  };

  // 最新配息欄位 (category_id=8): 除息交易日、股價、現金殖利率
  // 配最多欄位 (category_id=7): 現金殖利率、股價、評比
  const exDividendDateRaw = getFieldValue('除息交易日');
  // 格式化日期: 20260331 -> 03/31
  const exDividendDate = exDividendDateRaw !== '--' 
    ? `${exDividendDateRaw.slice(4, 6)}/${exDividendDateRaw.slice(6, 8)}`
    : '--';
  const frequency = getFieldValue('頻率'); // API 可能沒有
  const cashDividend = getFieldValue('現金股利') || getFieldValue('現金殖利率');
  const recentDividend = getFieldValue('最近股利') || getFieldValue('評比');

  const priceChangeColor = getPriceChangeColor(priceChange || 0);

  // 是否為前三名
  const isTop3 = rank <= 3;
  const rankStyle = isTop3 ? RANK_COLORS[rank as 1 | 2 | 3] : null;

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress?.(item)} activeOpacity={0.7}>
      {/* 排名區塊 */}
      <View style={styles.rankContainer}>
        {isTop3 ? (
          <View style={[styles.rankBadge, { backgroundColor: rankStyle!.bg, borderColor: rankStyle!.border }]}>
            <Text style={[styles.rankText, { color: rankStyle!.text }]}>{rank}</Text>
          </View>
        ) : (
          <View style={styles.rankBadgeNormal}>
            <Text style={styles.rankTextNormal}>{rank}</Text>
          </View>
        )}
      </View>

      {/* 股票名稱與代號 */}
      <View style={styles.stockInfo}>
        <Text style={styles.stockName} numberOfLines={1}>
          {stockName}
        </Text>
        <Text style={styles.stockId}>{stockId}</Text>
      </View>

      {/* 動態欄位 */}
      {showExDividendDate ? (
        <>
          {/* 最新配息: 除息日, 頻率, 股價, 殖利率 */}
          <Text style={styles.cell}>{exDividendDate}</Text>
          <Text style={styles.cell}>{frequency !== '--' ? frequency : '-'}</Text>
          
          {/* 股價與漲跌 */}
          <View style={styles.priceCell}>
            <Text style={[styles.price, { color: priceChangeColor }]}>
              {currentPrice ? formatCurrency(currentPrice) : '--'}
            </Text>
            {priceChange !== undefined && priceChangePct !== undefined && (
              <Text style={[styles.priceChange, { color: priceChangeColor }]}>
                {formatPriceChange(priceChange, priceChangePct)}
              </Text>
            )}
          </View>
          
          {/* 最後一欄: 殖利率 */}
          <Text style={styles.cellLast}>{cashDividend}%</Text>
        </>
      ) : (
        <>
          {/* 配最多: 殖利率, 股價, 評比 */}
          <Text style={styles.cell}>{cashDividend}%</Text>
          
          {/* 股價與漲跌 */}
          <View style={styles.priceCell}>
            <Text style={[styles.price, { color: priceChangeColor }]}>
              {currentPrice ? formatCurrency(currentPrice) : '--'}
            </Text>
            {priceChange !== undefined && priceChangePct !== undefined && (
              <Text style={[styles.priceChange, { color: priceChangeColor }]}>
                {formatPriceChange(priceChange, priceChangePct)}
              </Text>
            )}
          </View>
          
          {/* 最後一欄: 評比 */}
          <Text style={styles.cellLast}>{recentDividend}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  // 排名樣式
  rankContainer: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  rankText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  rankBadgeNormal: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
  },
  rankTextNormal: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  // 股票資訊
  stockInfo: {
    flex: 1.2,
    paddingRight: 4,
  },
  stockName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  stockId: {
    fontSize: 11,
    color: Colors.text.tertiary,
    marginTop: 1,
  },
  // 欄位樣式
  cell: {
    flex: 1,
    fontSize: 12,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  cellLast: {
    flex: 1,
    fontSize: 12,
    color: Colors.text.primary,
    textAlign: 'right',
  },
  // 股價樣式
  priceCell: {
    flex: 1.1,
    alignItems: 'center',
  },
  price: {
    fontSize: 13,
    fontWeight: '600',
  },
  priceChange: {
    fontSize: 10,
    marginTop: 1,
  },
});
