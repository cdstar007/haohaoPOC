/**
 * 估價頁 - 個股估價
 * 股利法估算、歷史收盤價走勢圖、估價區間、股價通知
 * 使用全局狀態顯示當前選中的股票
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Colors } from '../../constants';
import { ValuationChart } from '../../components';
import { useValuationData } from '../../hooks';
import { useStockStore } from '../../store/stockStore';
import type { ValuationYear } from '../../models';
import { VALUATION_YEAR_OPTIONS } from '../../models';
import type { BottomTabParamList } from '../../navigation/types';

// 頁面內 Tab
type PageTab = 'trend' | 'rating' | 'kline' | 'dividend' | 'profit';

const PAGE_TABS: { key: PageTab; label: string }[] = [
  { key: 'trend', label: '走勢' },
  { key: 'rating', label: '評分' },
  { key: 'kline', label: 'K線' },
  { key: 'dividend', label: '股利' },
  { key: 'profit', label: '獲利' },
];

// 取得價格區間
const getPriceRange = (richPrice: any, year: ValuationYear) => {
  if (!richPrice) return { high: 0, fair: 0, low: 0 };
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

export const ValuationScreen: React.FC = () => {
  const navigation = useNavigation<BottomTabNavigationProp<BottomTabParamList>>();
  const { selectedStock } = useStockStore();
  const { stockId, stockName } = selectedStock;

  // 狀態
  const [activeTab, setActiveTab] = useState<PageTab>('profit');
  const [selectedYear, setSelectedYear] = useState<ValuationYear>(1);
  const [upperLimit, setUpperLimit] = useState(131.5);
  const [lowerLimit, setLowerLimit] = useState(131.5);

  // 使用 Hook 載入資料
  const { richPrice, isLoading, error, refresh } = useValuationData(stockId);

  // 取得選中年份的價格
  const priceRange = useMemo(() => {
    return getPriceRange(richPrice, selectedYear);
  }, [richPrice, selectedYear]);

  // 處理頁面 Tab 切換
  const handlePageTabChange = useCallback((tab: PageTab) => {
    setActiveTab(tab);
    if (tab === 'dividend') {
      navigation.navigate('DividendTab');
    }
  }, [navigation]);

  // 切換至上一檔/下一檔股票
  const goToPrevStock = useCallback(() => {
    console.log('Previous stock');
  }, []);

  const goToNextStock = useCallback(() => {
    console.log('Next stock');
  }, []);

  // 調整價格限制
  const adjustLimit = (type: 'upper' | 'lower', delta: number) => {
    if (type === 'upper') {
      setUpperLimit(prev => parseFloat((prev + delta).toFixed(1)));
    } else {
      setLowerLimit(prev => parseFloat((prev + delta).toFixed(1)));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 頂部股票導覽列 */}
      <View style={styles.header}>
        <View style={styles.headerCenter}>
          <Text style={styles.stockName}>{stockName}</Text>
          <Text style={styles.stockId}>{stockId}</Text>
        </View>
        <View style={styles.headerNav}>
          <TouchableOpacity onPress={goToPrevStock}>
            <Text style={styles.navArrow}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={goToNextStock}>
            <Text style={styles.navArrow}>→</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.favoriteButton}>
          <Text style={styles.favoriteIcon}>♡</Text>
        </TouchableOpacity>
      </View>

      {/* 個股摘要資訊列 */}
      <View style={styles.summaryRow}>
        <View style={styles.priceSection}>
          <Text style={styles.currentPrice}>583.0</Text>
          <Text style={styles.priceChange}>▼3.00（-0.51%）</Text>
        </View>
        <View style={styles.dividendInfo}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>殖利率</Text>
            <Text style={styles.infoValue}>10%</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>股利</Text>
            <Text style={styles.infoValue}>8.5元</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>頻率</Text>
            <Text style={styles.infoValue}>季配</Text>
          </View>
        </View>
      </View>

      {/* 頁面 Tab */}
      <View style={styles.pageTabContainer}>
        {PAGE_TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.pageTab, activeTab === tab.key && styles.pageTabActive]}
            onPress={() => handlePageTabChange(tab.key)}
          >
            <Text
              style={[
                styles.pageTabText,
                activeTab === tab.key && styles.pageTabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refresh} />
        }
      >
        {/* 錯誤提示 */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>載入失敗，請下拉重試</Text>
          </View>
        )}

        {/* 載入中 */}
        {isLoading && !richPrice && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        )}

        {/* 合理價估算區塊 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIndicator} />
            <Text style={styles.sectionTitle}>合理價估算</Text>
          </View>

          {/* 年份選擇 */}
          <View style={styles.yearSelector}>
            {VALUATION_YEAR_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.yearButton,
                  selectedYear === option.value && styles.yearButtonActive,
                ]}
                onPress={() => setSelectedYear(option.value)}
              >
                <Text
                  style={[
                    styles.yearButtonText,
                    selectedYear === option.value && styles.yearButtonTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 估價圖表 */}
          <ValuationChart richPrice={richPrice} selectedYear={selectedYear} />

          {/* 三卡片數值 */}
          <View style={styles.priceCards}>
            <View style={styles.priceCard}>
              <Text style={styles.priceCardLabel}>低價</Text>
              <Text style={styles.priceCardValue}>{priceRange.low.toFixed(2)}</Text>
            </View>
            <View style={[styles.priceCard, styles.priceCardHighlight]}>
              <Text style={[styles.priceCardLabel, styles.priceCardLabelHighlight]}>合理價</Text>
              <Text style={[styles.priceCardValue, styles.priceCardValueHighlight]}>
                {priceRange.fair.toFixed(2)}
              </Text>
            </View>
            <View style={styles.priceCard}>
              <Text style={styles.priceCardLabel}>高價</Text>
              <Text style={styles.priceCardValue}>{priceRange.high.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* 股價通知區塊 (僅靜態 UI) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIndicator} />
            <Text style={styles.sectionTitle}>股價通知（每日通知一次）</Text>
          </View>

          <View style={styles.notificationContainer}>
            {/* 價格超過 */}
            <View style={styles.notificationRow}>
              <TouchableOpacity style={styles.radioContainer}>
                <View style={styles.radioOuter}>
                  <View style={styles.radioInnerInactive} />
                </View>
              </TouchableOpacity>
              <Text style={styles.notificationLabel}>價格超過</Text>
              <Text style={styles.notificationDivider}>─</Text>
              <View style={styles.valueControl}>
                <TouchableOpacity 
                  style={styles.adjustButton}
                  onPress={() => adjustLimit('upper', -0.1)}
                >
                  <Text style={styles.adjustButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.notificationValue}>{upperLimit.toFixed(1)}</Text>
                <TouchableOpacity 
                  style={styles.adjustButton}
                  onPress={() => adjustLimit('upper', 0.1)}
                >
                  <Text style={styles.adjustButtonText}>＋</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 價格低於 */}
            <View style={styles.notificationRow}>
              <TouchableOpacity style={styles.radioContainer}>
                <View style={styles.radioOuter}>
                  <View style={styles.radioInnerInactive} />
                </View>
              </TouchableOpacity>
              <Text style={styles.notificationLabel}>價格低於</Text>
              <Text style={styles.notificationDivider}>─</Text>
              <View style={styles.valueControl}>
                <TouchableOpacity 
                  style={styles.adjustButton}
                  onPress={() => adjustLimit('lower', -0.1)}
                >
                  <Text style={styles.adjustButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.notificationValue}>{lowerLimit.toFixed(1)}</Text>
                <TouchableOpacity 
                  style={styles.adjustButton}
                  onPress={() => adjustLimit('lower', 0.1)}
                >
                  <Text style={styles.adjustButtonText}>＋</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <Text style={styles.notificationNote}>
            * POC 階段僅顯示靜態畫面，不實作通知功能
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  stockId: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginLeft: 8,
  },
  headerNav: {
    flexDirection: 'row',
    marginHorizontal: 12,
  },
  navArrow: {
    fontSize: 18,
    color: Colors.primary,
    marginHorizontal: 8,
  },
  favoriteButton: {
    padding: 4,
  },
  favoriteIcon: {
    fontSize: 22,
    color: Colors.primary,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  priceSection: {
    marginRight: 24,
  },
  currentPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.down,
  },
  priceChange: {
    fontSize: 14,
    color: Colors.down,
    marginTop: 2,
  },
  dividendInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  pageTabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  pageTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  pageTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  pageTabText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  pageTabTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    paddingVertical: 40,
  },
  errorContainer: {
    backgroundColor: '#FFF3F3',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 4,
  },
  errorText: {
    fontSize: 13,
    color: Colors.up,
    textAlign: 'center',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIndicator: {
    width: 4,
    height: 20,
    backgroundColor: Colors.primary,
    marginRight: 8,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  yearSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  yearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: Colors.background.secondary,
  },
  yearButtonActive: {
    backgroundColor: Colors.primary,
  },
  yearButtonText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  yearButtonTextActive: {
    color: Colors.text.inverse,
    fontWeight: '600',
  },
  priceCards: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  priceCard: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  priceCardHighlight: {
    backgroundColor: Colors.primary,
  },
  priceCardLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  priceCardLabelHighlight: {
    color: 'rgba(255,255,255,0.8)',
  },
  priceCardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  priceCardValueHighlight: {
    color: Colors.text.inverse,
  },
  notificationContainer: {
    gap: 12,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioContainer: {
    marginRight: 12,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInnerInactive: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'transparent',
  },
  notificationLabel: {
    fontSize: 14,
    color: Colors.text.primary,
    width: 70,
  },
  notificationDivider: {
    fontSize: 14,
    color: Colors.text.tertiary,
    marginHorizontal: 8,
  },
  valueControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notificationValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    minWidth: 50,
    textAlign: 'center',
  },
  adjustButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adjustButtonText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  notificationNote: {
    fontSize: 11,
    color: Colors.text.tertiary,
    marginTop: 12,
    fontStyle: 'italic',
  },
});
