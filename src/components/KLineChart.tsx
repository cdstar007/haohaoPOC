/**
 * K 線圖元件
 * 顯示蠟燭圖、成交量、均線 (5MA, 10MA, 20MA, 60MA)
 * 使用簡易實作，不依賴複雜圖表庫
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Colors } from '../constants';
import type { CandleStick } from '../models';

interface KLineChartProps {
  data: CandleStick[];
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_HEIGHT = 200;

export const KLineChart: React.FC<KLineChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>暫無資料</Text>
      </View>
    );
  }

  // 只取最近 30 筆資料顯示
  const displayData = data.slice(-30);
  const latest = data[data.length - 1];

  // 計算價格範圍
  const prices = displayData.flatMap((d) => [d.high, d.low]);
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  const priceRange = maxPrice - minPrice || 1;

  // 計算成交量範圍
  const maxVolume = Math.max(...displayData.map((d) => d.volume));
  const minVolume = Math.min(...displayData.map((d) => d.volume));

  // 將價格轉換為 Y 座標
  const priceToY = (price: number) => {
    return CHART_HEIGHT - ((price - minPrice) / priceRange) * CHART_HEIGHT;
  };

  const barWidth = (SCREEN_WIDTH - 64) / displayData.length;

  return (
    <View style={styles.container}>
      {/* 頂部資訊列 */}
      <View style={styles.infoBar}>
        <Text style={styles.infoText}>開: {latest.open.toFixed(2)}</Text>
        <Text style={styles.infoText}>高: {latest.high.toFixed(2)}</Text>
        <Text style={styles.infoText}>低: {latest.low.toFixed(2)}</Text>
        <Text style={[styles.infoText, { color: latest.close >= latest.open ? Colors.up : Colors.down }]}>
          收: {latest.close.toFixed(2)}
        </Text>
        <Text style={[styles.infoText, { color: latest.change >= 0 ? Colors.up : Colors.down }]}>
          {latest.change >= 0 ? '+' : ''}{latest.change.toFixed(2)} ({latest.changePct.toFixed(2)}%)
        </Text>
      </View>

      {/* 均線圖例 */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: '#F5A623' }]} />
          <Text style={styles.legendText}>MA5</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: '#4A90E2' }]} />
          <Text style={styles.legendText}>MA10</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: '#7ED321' }]} />
          <Text style={styles.legendText}>MA20</Text>
        </View>
      </View>

      {/* K 線圖 */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={[styles.chartContainer, { width: displayData.length * barWidth }]}>
          {/* 網格線 */}
          <View style={styles.gridLines}>
            {[0, 1, 2, 3].map((i) => (
              <View
                key={i}
                style={[
                  styles.gridLine,
                  { top: (CHART_HEIGHT / 4) * i },
                ]}
              />
            ))}
          </View>

          {/* K 線蠟燭 */}
          {displayData.map((item, index) => {
            const x = index * barWidth;
            const isUp = item.close >= item.open;
            const color = isUp ? Colors.up : Colors.down;
            const bodyTop = priceToY(Math.max(item.open, item.close));
            const bodyBottom = priceToY(Math.min(item.open, item.close));
            const bodyHeight = bodyBottom - bodyTop || 1;
            const wickTop = priceToY(item.high);
            const wickBottom = priceToY(item.low);

            return (
              <View key={item.date} style={[styles.candleContainer, { left: x, width: barWidth }]}>
                {/* 上影線 */}
                <View style={[styles.wick, { top: wickTop, height: bodyTop - wickTop, backgroundColor: color }]} />
                {/* 實體 */}
                <View
                  style={[
                    styles.body,
                    {
                      top: bodyTop,
                      height: bodyHeight,
                      backgroundColor: color,
                    },
                  ]}
                />
                {/* 下影線 */}
                <View style={[styles.wick, { top: bodyBottom, height: wickBottom - bodyBottom, backgroundColor: color }]} />
              </View>
            );
          })}

          {/* 均線 - MA5 */}
          <SvgMALine data={displayData} field="ma5" color="#F5A623" priceToY={priceToY} barWidth={barWidth} />
          {/* 均線 - MA10 */}
          <SvgMALine data={displayData} field="ma10" color="#4A90E2" priceToY={priceToY} barWidth={barWidth} />
          {/* 均線 - MA20 */}
          <SvgMALine data={displayData} field="ma20" color="#7ED321" priceToY={priceToY} barWidth={barWidth} />
        </View>
      </ScrollView>

      {/* 成交量圖 */}
      <View style={styles.volumeContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={[styles.volumeChart, { width: displayData.length * barWidth }]}>
            {displayData.map((item, index) => {
              const x = index * barWidth;
              const isUp = item.close >= item.open;
              const height = (item.volume / maxVolume) * 40;

              return (
                <View
                  key={`vol-${item.date}`}
                  style={[
                    styles.volumeBar,
                    {
                      left: x + barWidth * 0.2,
                      width: barWidth * 0.6,
                      height,
                      backgroundColor: isUp ? Colors.up : Colors.down,
                    },
                  ]}
                />
              );
            })}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

// 均線組件
interface MALineProps {
  data: CandleStick[];
  field: 'ma5' | 'ma10' | 'ma20' | 'ma60';
  color: string;
  priceToY: (price: number) => number;
  barWidth: number;
}

const SvgMALine: React.FC<MALineProps> = ({ data, field, color, priceToY, barWidth }) => {
  const points = data
    .map((item, index) => {
      const value = item[field];
      if (value === undefined || value === null) return null;
      return {
        x: index * barWidth + barWidth / 2,
        y: priceToY(value),
      };
    })
    .filter((p): p is { x: number; y: number } => p !== null);

  if (points.length < 2) return null;

  // 生成 SVG path
  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  // 使用 View 模擬線條
  return (
    <View style={StyleSheet.absoluteFill}>
      {points.slice(0, -1).map((p, i) => {
        const nextP = points[i + 1];
        const dx = nextP.x - p.x;
        const dy = nextP.y - p.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

        return (
          <View
            key={`${field}-${i}`}
            style={{
              position: 'absolute',
              left: p.x,
              top: p.y,
              width: length,
              height: 1,
              backgroundColor: color,
              transform: [{ rotate: `${angle}deg` }],
              transformOrigin: '0 0',
            }}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.primary,
  },
  emptyContainer: {
    height: CHART_HEIGHT + 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  infoBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.background.secondary,
    borderRadius: 4,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 11,
    color: Colors.text.secondary,
    marginRight: 12,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  legendLine: {
    width: 12,
    height: 2,
    marginRight: 4,
  },
  legendText: {
    fontSize: 10,
    color: Colors.text.secondary,
  },
  chartContainer: {
    height: CHART_HEIGHT,
    position: 'relative',
  },
  gridLines: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Colors.border,
    opacity: 0.5,
  },
  candleContainer: {
    position: 'absolute',
    height: CHART_HEIGHT,
  },
  wick: {
    position: 'absolute',
    width: 1,
    alignSelf: 'center',
  },
  body: {
    position: 'absolute',
    width: 6,
    alignSelf: 'center',
    borderRadius: 1,
  },
  volumeContainer: {
    marginTop: 8,
    height: 50,
  },
  volumeChart: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  volumeBar: {
    position: 'absolute',
    bottom: 0,
    borderRadius: 1,
  },
});
