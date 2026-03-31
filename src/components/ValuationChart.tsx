/**
 * 估價圖表元件
 * 收盤價折線 + 高價/合理價/低價 三條虛線
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../constants';
import type { RichPrice, ValuationYear } from '../models';

interface ValuationChartProps {
  richPrice: RichPrice | null;
  selectedYear: ValuationYear;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_HEIGHT = 200;
const CHART_PADDING = { top: 20, right: 16, bottom: 30, left: 16 };

export const ValuationChart: React.FC<ValuationChartProps> = ({
  richPrice,
  selectedYear,
}) => {
  if (!richPrice || !richPrice.closingPrices.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>暫無資料</Text>
      </View>
    );
  }

  const { closingPrices, dividendMethod } = richPrice;

  // 取得選中年份的價格區間
  const getPriceRange = () => {
    switch (selectedYear) {
      case 1:
        return dividendMethod.oneYear;
      case 3:
        return dividendMethod.threeYear;
      case 5:
        return dividendMethod.fiveYear;
      case 10:
        return dividendMethod.tenYear;
      default:
        return dividendMethod.oneYear;
    }
  };

  const priceRange = getPriceRange();

  // 計算價格範圍
  const allPrices = [
    ...closingPrices.map((p) => p.price),
    priceRange.high,
    priceRange.fair,
    priceRange.low,
  ];
  const maxPrice = Math.max(...allPrices) * 1.05;
  const minPrice = Math.min(...allPrices) * 0.95;
  const priceSpan = maxPrice - minPrice || 1;

  const chartWidth = SCREEN_WIDTH - 64;
  const chartInnerWidth = chartWidth - CHART_PADDING.left - CHART_PADDING.right;
  const chartInnerHeight = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;

  // 座標轉換
  const priceToY = (price: number) => {
    return CHART_HEIGHT - CHART_PADDING.bottom - ((price - minPrice) / priceSpan) * chartInnerHeight;
  };

  const indexToX = (index: number) => {
    return CHART_PADDING.left + (index / (closingPrices.length - 1)) * chartInnerWidth;
  };

  // 收盤價線條點
  const closingPoints = closingPrices.map((item, index) => ({
    x: indexToX(index),
    y: priceToY(item.price),
  }));

  // 水平線 Y 座標
  const highY = priceToY(priceRange.high);
  const fairY = priceToY(priceRange.fair);
  const lowY = priceToY(priceRange.low);

  // 最新價格
  const latestPrice = closingPrices[closingPrices.length - 1].price;
  const latestDate = closingPrices[closingPrices.length - 1].date;

  return (
    <View style={styles.container}>
      {/* 圖表說明卡 */}
      <View style={styles.chartCard}>
        <View style={styles.chartCardRow}>
          <Text style={styles.chartCardDate}>{latestDate.slice(5)}</Text>
          <View style={styles.chartCardItem}>
            <View style={[styles.chartCardDot, { backgroundColor: Colors.valuation.price }]} />
            <Text style={styles.chartCardLabel}>股價</Text>
            <Text style={styles.chartCardValue}>{latestPrice.toFixed(2)}</Text>
          </View>
          <View style={styles.chartCardItem}>
            <View style={[styles.chartCardDot, { backgroundColor: Colors.valuation.fair }]} />
            <Text style={styles.chartCardLabel}>合理價</Text>
            <Text style={styles.chartCardValue}>{priceRange.fair.toFixed(2)}</Text>
          </View>
        </View>
        <View style={styles.chartCardRow}>
          <View style={styles.chartCardSpacer} />
          <View style={styles.chartCardItem}>
            <View style={[styles.chartCardDot, { backgroundColor: Colors.valuation.high }]} />
            <Text style={styles.chartCardLabel}>高價</Text>
            <Text style={styles.chartCardValue}>{priceRange.high.toFixed(2)}</Text>
          </View>
          <View style={styles.chartCardItem}>
            <View style={[styles.chartCardDot, { backgroundColor: Colors.valuation.low }]} />
            <Text style={styles.chartCardLabel}>低價</Text>
            <Text style={styles.chartCardValue}>{priceRange.low.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* 圖表 */}
      <View style={[styles.chartContainer, { width: chartWidth, height: CHART_HEIGHT }]}>
        {/* 網格線 */}
        <View style={[styles.gridLine, { top: CHART_PADDING.top }]} />
        <View style={[styles.gridLine, { top: CHART_PADDING.top + chartInnerHeight / 2 }]} />
        <View style={[styles.gridLine, { top: CHART_HEIGHT - CHART_PADDING.bottom }]} />

        {/* 高價虛線 */}
        <View style={[styles.dashedLine, { top: highY, borderColor: Colors.valuation.high }]}>
          <Text style={[styles.lineLabel, { color: Colors.valuation.high }]}>高價</Text>
        </View>

        {/* 合理價虛線 */}
        <View style={[styles.dashedLine, { top: fairY, borderColor: Colors.valuation.fair }]}>
          <Text style={[styles.lineLabel, { color: Colors.valuation.fair }]}>合理價</Text>
        </View>

        {/* 低價虛線 */}
        <View style={[styles.dashedLine, { top: lowY, borderColor: Colors.valuation.low }]}>
          <Text style={[styles.lineLabel, { color: Colors.valuation.low }]}>低價</Text>
        </View>

        {/* 收盤價折線 */}
        <View style={StyleSheet.absoluteFill}>
          {closingPoints.slice(0, -1).map((p, i) => {
            const nextP = closingPoints[i + 1];
            const dx = nextP.x - p.x;
            const dy = nextP.y - p.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

            return (
              <View
                key={`price-${i}`}
                style={{
                  position: 'absolute',
                  left: p.x,
                  top: p.y,
                  width: length,
                  height: 2,
                  backgroundColor: Colors.valuation.price,
                  transform: [{ rotate: `${angle}deg` }],
                  transformOrigin: '0 0',
                }}
              />
            );
          })}

          {/* 資料點 */}
          {closingPoints.map((p, i) => (
            <View
              key={`dot-${i}`}
              style={{
                position: 'absolute',
                left: p.x - 3,
                top: p.y - 3,
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: Colors.valuation.price,
              }}
            />
          ))}
        </View>

        {/* X 軸標籤 */}
        <View style={styles.xAxis}>
          {closingPrices
            .filter((_, i) => i % 3 === 0 || i === closingPrices.length - 1)
            .map((item, index) => (
              <Text key={item.date} style={styles.xAxisLabel}>
                {item.date.slice(5)}
              </Text>
            ))}
        </View>
      </View>

      {/* 圖例 */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: Colors.valuation.price }]} />
          <Text style={styles.legendText}>收盤價</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDashedLine, { borderColor: Colors.valuation.high }]} />
          <Text style={styles.legendText}>高價</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDashedLine, { borderColor: Colors.valuation.fair }]} />
          <Text style={styles.legendText}>合理價</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDashedLine, { borderColor: Colors.valuation.low }]} />
          <Text style={styles.legendText}>低價</Text>
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
    height: CHART_HEIGHT + 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  chartCard: {
    backgroundColor: Colors.background.primary,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chartCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  chartCardDate: {
    fontSize: 12,
    color: Colors.text.secondary,
    width: 60,
  },
  chartCardSpacer: {
    width: 60,
  },
  chartCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  chartCardDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  chartCardLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginRight: 4,
  },
  chartCardValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  chartContainer: {
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: CHART_PADDING.left,
    right: CHART_PADDING.right,
    height: 1,
    backgroundColor: Colors.border,
    opacity: 0.3,
  },
  dashedLine: {
    position: 'absolute',
    left: CHART_PADDING.left,
    right: CHART_PADDING.right,
    height: 1,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  lineLabel: {
    position: 'absolute',
    right: -40,
    top: -8,
    fontSize: 10,
    fontWeight: '600',
  },
  xAxis: {
    position: 'absolute',
    left: CHART_PADDING.left,
    right: CHART_PADDING.right,
    bottom: 0,
    height: CHART_PADDING.bottom,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  xAxisLabel: {
    fontSize: 10,
    color: Colors.text.tertiary,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendLine: {
    width: 16,
    height: 2,
    marginRight: 4,
  },
  legendDashedLine: {
    width: 16,
    height: 0,
    borderTopWidth: 2,
    borderStyle: 'dashed',
    marginRight: 4,
  },
  legendText: {
    fontSize: 11,
    color: Colors.text.tertiary,
  },
});
