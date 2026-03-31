/**
 * 年度股利複合圖表
 * 左 Y 軸: 現金股利 + 股票股利 (長條圖)
 * 右 Y 軸: 現金殖利率 (折線圖)
 * 簡易實作，不依賴複雜圖表庫
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Colors } from '../constants';
import type { YearlyDividend } from '../models';

interface DividendChartProps {
  data: YearlyDividend[];
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_HEIGHT = 180;
const CHART_PADDING = { top: 20, right: 40, bottom: 30, left: 40 };

export const DividendChart: React.FC<DividendChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>暫無資料</Text>
      </View>
    );
  }

  // 資料排序 (由舊到新，最多顯示 5 年)
  const sortedData = [...data].sort((a, b) => a.year.localeCompare(b.year)).slice(-5);

  // 計算範圍
  const maxDividend = Math.max(
    ...sortedData.map((d) => Math.max(d.cashDividend, d.stockDividend))
  );
  const maxYield = Math.max(...sortedData.map((d) => d.cashYield));

  const chartWidth = SCREEN_WIDTH - 64;
  const chartInnerWidth = chartWidth - CHART_PADDING.left - CHART_PADDING.right;
  const chartInnerHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;
  const barWidth = chartInnerWidth / sortedData.length / 3;
  const groupWidth = chartInnerWidth / sortedData.length;

  // 轉換座標
  const dividendToY = (value: number) => {
    return CHART_HEIGHT - CHART_PADDING.bottom - (value / (maxDividend * 1.1)) * chartInnerHeight;
  };

  const yieldToY = (value: number) => {
    return CHART_HEIGHT - CHART_PADDING.bottom - (value / (maxYield * 1.1)) * chartInnerHeight;
  };

  return (
    <View style={styles.container}>
      {/* 圖例 */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: Colors.chart.cashDividend }]} />
          <Text style={styles.legendText}>現金股利</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, { backgroundColor: Colors.chart.stockDividend }]} />
          <Text style={styles.legendText}>股票股利</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: Colors.chart.cashYield }]} />
          <Text style={styles.legendText}>現金殖利率</Text>
        </View>
      </View>

      {/* 圖表 */}
      <View style={[styles.chartContainer, { width: chartWidth, height: CHART_HEIGHT }]}>
        {/* Y 軸標籤 - 左 (股利) */}
        <View style={styles.yAxisLeft}>
          <Text style={styles.axisLabel}>{maxDividend.toFixed(1)}</Text>
          <Text style={styles.axisLabel}>{(maxDividend / 2).toFixed(1)}</Text>
          <Text style={styles.axisLabel}>0</Text>
        </View>

        {/* Y 軸標籤 - 右 (殖利率) */}
        <View style={styles.yAxisRight}>
          <Text style={[styles.axisLabel, { color: Colors.chart.cashYield }]}>{maxYield.toFixed(1)}%</Text>
          <Text style={[styles.axisLabel, { color: Colors.chart.cashYield }]}>{(maxYield / 2).toFixed(1)}%</Text>
          <Text style={[styles.axisLabel, { color: Colors.chart.cashYield }]}>0%</Text>
        </View>

        {/* 繪圖區域 */}
        <View style={styles.plotArea}>
          {/* 網格線 */}
          <View style={styles.gridLine} />
          <View style={[styles.gridLine, { top: chartInnerHeight / 2 }]} />

          {/* 長條圖 - 現金股利 */}
          {sortedData.map((item, index) => {
            const x = index * groupWidth + groupWidth / 2 - barWidth;
            const y = dividendToY(item.cashDividend);
            const height = CHART_HEIGHT - CHART_PADDING.bottom - y;

            return (
              <View
                key={`cash-${item.year}`}
                style={[
                  styles.bar,
                  {
                    left: x,
                    top: y,
                    width: barWidth * 0.9,
                    height,
                    backgroundColor: Colors.chart.cashDividend,
                  },
                ]}
              />
            );
          })}

          {/* 長條圖 - 股票股利 */}
          {sortedData.map((item, index) => {
            const x = index * groupWidth + groupWidth / 2 + barWidth * 0.1;
            const y = dividendToY(item.stockDividend);
            const height = CHART_HEIGHT - CHART_PADDING.bottom - y;

            return (
              <View
                key={`stock-${item.year}`}
                style={[
                  styles.bar,
                  {
                    left: x,
                    top: y,
                    width: barWidth * 0.9,
                    height,
                    backgroundColor: Colors.chart.stockDividend,
                  },
                ]}
              />
            );
          })}

          {/* 折線圖 - 殖利率 */}
          <View style={StyleSheet.absoluteFill}>
            {sortedData.map((item, index) => {
              if (index === sortedData.length - 1) return null;
              const x1 = index * groupWidth + groupWidth / 2;
              const y1 = yieldToY(item.cashYield);
              const x2 = (index + 1) * groupWidth + groupWidth / 2;
              const y2 = yieldToY(sortedData[index + 1].cashYield);

              const dx = x2 - x1;
              const dy = y2 - y1;
              const length = Math.sqrt(dx * dx + dy * dy);
              const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

              return (
                <View
                  key={`yield-line-${index}`}
                  style={{
                    position: 'absolute',
                    left: x1,
                    top: y1,
                    width: length,
                    height: 2,
                    backgroundColor: Colors.chart.cashYield,
                    transform: [{ rotate: `${angle}deg` }],
                    transformOrigin: '0 0',
                  }}
                />
              );
            })}

            {/* 資料點 */}
            {sortedData.map((item, index) => {
              const x = index * groupWidth + groupWidth / 2;
              const y = yieldToY(item.cashYield);

              return (
                <View
                  key={`yield-dot-${item.year}`}
                  style={{
                    position: 'absolute',
                    left: x - 4,
                    top: y - 4,
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: Colors.chart.cashYield,
                  }}
                />
              );
            })}
          </View>
        </View>

        {/* X 軸標籤 */}
        <View style={styles.xAxis}>
          {sortedData.map((item, index) => (
            <Text key={item.year} style={styles.xAxisLabel}>
              {item.year.slice(-2)}年
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.primary,
  },
  emptyContainer: {
    height: CHART_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  legendBox: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 4,
  },
  legendLine: {
    width: 12,
    height: 2,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  chartContainer: {
    position: 'relative',
  },
  yAxisLeft: {
    position: 'absolute',
    left: 0,
    top: CHART_PADDING.top,
    bottom: CHART_PADDING.bottom,
    width: CHART_PADDING.left,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 4,
  },
  yAxisRight: {
    position: 'absolute',
    right: 0,
    top: CHART_PADDING.top,
    bottom: CHART_PADDING.bottom,
    width: CHART_PADDING.right,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingLeft: 4,
  },
  axisLabel: {
    fontSize: 10,
    color: Colors.text.tertiary,
  },
  plotArea: {
    position: 'absolute',
    left: CHART_PADDING.left,
    top: CHART_PADDING.top,
    right: CHART_PADDING.right,
    bottom: CHART_PADDING.bottom,
    overflow: 'hidden',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Colors.border,
    opacity: 0.3,
  },
  bar: {
    position: 'absolute',
    borderRadius: 2,
  },
  xAxis: {
    position: 'absolute',
    left: CHART_PADDING.left,
    right: CHART_PADDING.right,
    bottom: 0,
    height: CHART_PADDING.bottom,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  xAxisLabel: {
    fontSize: 11,
    color: Colors.text.secondary,
  },
});
