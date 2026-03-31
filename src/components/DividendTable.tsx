/**
 * 股利資料表格
 * 支援兩種模式: 殖利率 / 除權息
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '../constants';
import type { YearlyDividend, ExDividendRecord } from '../models';

interface DividendTableProps {
  mode: 'yield' | 'exDividend';
  yearlyData?: YearlyDividend[];
  exDividendData?: ExDividendRecord[];
}

export const DividendTable: React.FC<DividendTableProps> = ({
  mode,
  yearlyData,
  exDividendData,
}) => {
  // 殖利率表格
  if (mode === 'yield') {
    const data = yearlyData || [];
    
    // 計算平均值
    const avgCashYield = data.length > 0 
      ? data.reduce((sum, d) => sum + d.cashYield, 0) / data.length 
      : 0;
    const avgCashDividend = data.length > 0
      ? data.reduce((sum, d) => sum + d.cashDividend, 0) / data.length
      : 0;

    return (
      <View style={styles.container}>
        {/* 統計列 */}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>平均殖利率</Text>
          <Text style={styles.summaryValue}>{avgCashYield.toFixed(2)}%</Text>
          <Text style={styles.summaryLabel}>平均股利</Text>
          <Text style={styles.summaryValue}>{avgCashDividend.toFixed(2)}元</Text>
        </View>

        {/* 表頭 */}
        <View style={styles.headerRow}>
          <Text style={[styles.headerCell, styles.yearCell]}>年度</Text>
          <Text style={[styles.headerCell, styles.numberCell]}>現金股利</Text>
          <Text style={[styles.headerCell, styles.numberCell]}>股票股利</Text>
          <Text style={[styles.headerCell, styles.numberCell]}>現金殖利率</Text>
        </View>

        {/* 資料列 */}
        <ScrollView style={styles.dataContainer}>
          {data.length === 0 ? (
            <Text style={styles.emptyText}>暫無資料</Text>
          ) : (
            data.map((item, index) => (
              <View key={item.year} style={[styles.dataRow, index % 2 === 0 && styles.evenRow]}>
                <Text style={[styles.dataCell, styles.yearCell]}>{item.year}</Text>
                <Text style={[styles.dataCell, styles.numberCell]}>{item.cashDividend.toFixed(2)}</Text>
                <Text style={[styles.dataCell, styles.numberCell]}>{item.stockDividend.toFixed(2)}</Text>
                <Text style={[styles.dataCell, styles.numberCell, styles.yieldCell]}>
                  {item.cashYield.toFixed(2)}%
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    );
  }

  // 除權息表格
  const data = exDividendData || [];

  // 計算統計值
  const totalCash = data.reduce((sum, d) => sum + d.cashDividend, 0);
  const totalStock = data.reduce((sum, d) => sum + d.stockDividend, 0);
  const avgFillDays = data.filter(d => d.fillDays).length > 0
    ? data.filter(d => d.fillDays).reduce((sum, d) => sum + (d.fillDays || 0), 0) / data.filter(d => d.fillDays).length
    : 0;

  return (
    <View style={styles.container}>
      {/* 統計列 */}
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>累積現金</Text>
        <Text style={styles.summaryValue}>{totalCash.toFixed(2)}元</Text>
        <Text style={styles.summaryLabel}>平均填息天數</Text>
        <Text style={styles.summaryValue}>{avgFillDays > 0 ? avgFillDays.toFixed(0) : '--'}天</Text>
      </View>

      {/* 表頭 */}
      <View style={styles.headerRow}>
        <Text style={[styles.headerCell, styles.quarterCell]}>年度/季度</Text>
        <Text style={[styles.headerCell, styles.numberCell]}>現金股利</Text>
        <Text style={[styles.headerCell, styles.numberCell]}>股票股利</Text>
        <Text style={[styles.headerCell, styles.dateCell]}>除息日</Text>
        <Text style={[styles.headerCell, styles.daysCell]}>填息天數</Text>
      </View>

      {/* 資料列 */}
      <ScrollView style={styles.dataContainer}>
        {data.length === 0 ? (
          <Text style={styles.emptyText}>暫無資料</Text>
        ) : (
          data.map((item, index) => (
            <View key={item.yearQuarter} style={[styles.dataRow, index % 2 === 0 && styles.evenRow]}>
              <Text style={[styles.dataCell, styles.quarterCell]}>{item.yearQuarter}</Text>
              <Text style={[styles.dataCell, styles.numberCell]}>{item.cashDividend.toFixed(2)}</Text>
              <Text style={[styles.dataCell, styles.numberCell]}>{item.stockDividend.toFixed(2)}</Text>
              <Text style={[styles.dataCell, styles.dateCell]}>{item.exDividendDate || '--'}</Text>
              <Text style={[styles.dataCell, styles.daysCell]}>{item.fillDays || '--'}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: Colors.background.secondary,
    borderRadius: 8,
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    marginLeft: 4,
  },
  headerRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    backgroundColor: Colors.background.secondary,
    borderRadius: 4,
    marginBottom: 4,
  },
  headerCell: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  dataContainer: {
    maxHeight: 200,
  },
  dataRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  evenRow: {
    backgroundColor: 'rgba(45, 106, 231, 0.03)',
  },
  dataCell: {
    fontSize: 13,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  yearCell: {
    flex: 0.8,
  },
  quarterCell: {
    flex: 1,
  },
  numberCell: {
    flex: 1,
  },
  dateCell: {
    flex: 1,
  },
  daysCell: {
    flex: 0.8,
  },
  yieldCell: {
    color: Colors.chart.cashYield,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 40,
    color: Colors.text.secondary,
  },
});
