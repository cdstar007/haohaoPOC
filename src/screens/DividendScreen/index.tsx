/**
 * 股利頁 - 個股詳情
 * K 線圖、年度股利圖表、殖利率/除權息表格
 * 使用全局狀態顯示當前選中的股票
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Colors } from '../../constants';
import { KLineChart, DividendChart, DividendTable } from '../../components';
import { useDividendData } from '../../hooks';
import { useStockStore } from '../../store/stockStore';
import type { KLineConfig, KLinePeriod } from '../../models';
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

// K 線週期
const KLINE_PERIODS: { key: KLinePeriod; label: string }[] = [
  { key: 'daily', label: '日線' },
  { key: 'weekly', label: '週線' },
  { key: 'monthly', label: '月線' },
];

// 表格 Segment
type TableSegment = 'yield' | 'exDividend';

export const DividendScreen: React.FC = () => {
  const navigation = useNavigation<BottomTabNavigationProp<BottomTabParamList>>();
  const { selectedStock, setSelectedStock } = useStockStore();
  const { stockId, stockName } = selectedStock;

  // 狀態
  const [activeTab, setActiveTab] = useState<PageTab>('dividend');
  const [kLineConfig, setKLineConfig] = useState<KLineConfig>({
    period: 'daily',
    isReduction: false,
  });
  const [tableSegment, setTableSegment] = useState<TableSegment>('yield');

  // 使用 Hook 載入資料
  const { kLineData, yearlyDividend, exDividend, summary, isLoading, error, refresh } = useDividendData(
    stockId,
    kLineConfig
  );

  // 處理 K 線週期切換
  const handlePeriodChange = useCallback((period: KLinePeriod) => {
    setKLineConfig((prev) => ({ ...prev, period }));
  }, []);

  const handleReductionToggle = useCallback((isReduction: boolean) => {
    setKLineConfig((prev) => ({ ...prev, isReduction }));
  }, []);

  // 處理頁面 Tab 切換
  const handlePageTabChange = useCallback((tab: PageTab) => {
    setActiveTab(tab);
    if (tab === 'profit') {
      navigation.navigate('ValuationTab');
    }
  }, [navigation]);

  // 切換至上一檔/下一檔股票
  const goToPrevStock = useCallback(() => {
    // 實際應用中應該從列表取得前後股票
    console.log('Previous stock');
  }, []);

  const goToNextStock = useCallback(() => {
    console.log('Next stock');
  }, []);

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
          <Text style={styles.currentPrice}>{stockId}</Text>
          <Text style={styles.priceChange}>{stockName}</Text>
        </View>
        <View style={styles.dividendInfo}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>殖利率</Text>
            <Text style={styles.infoValue}>{summary?.yield ? `${summary.yield.toFixed(2)}%` : '--'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>股利</Text>
            <Text style={styles.infoValue}>{summary?.cashDividend ? `${summary.cashDividend.toFixed(2)}元` : '--'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>頻率</Text>
            <Text style={styles.infoValue}>{summary?.frequency || '--'}</Text>
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
        {isLoading && !kLineData && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        )}

        {/* K 線圖區域 */}
        <View style={styles.section}>
          <View style={styles.klineControls}>
            <View style={styles.periodButtons}>
              {KLINE_PERIODS.map((period) => (
                <TouchableOpacity
                  key={period.key}
                  style={[
                    styles.periodButton,
                    kLineConfig.period === period.key && styles.periodButtonActive,
                  ]}
                  onPress={() => handlePeriodChange(period.key)}
                >
                  <Text
                    style={[
                      styles.periodButtonText,
                      kLineConfig.period === period.key && styles.periodButtonTextActive,
                    ]}
                  >
                    {period.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.reductionToggle}>
              <Text style={styles.reductionLabel}>還原</Text>
              <Switch
                value={kLineConfig.isReduction}
                onValueChange={handleReductionToggle}
                trackColor={{ false: '#ddd', true: Colors.primaryLight }}
                thumbColor={kLineConfig.isReduction ? Colors.primary : '#f4f3f4'}
              />
            </View>
          </View>

          {/* K 線圖 */}
          <KLineChart data={kLineData || []} />
        </View>

        {/* 年度股利複合圖表 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIndicator} />
            <Text style={styles.sectionTitle}>年度股利統計</Text>
          </View>
          <DividendChart data={yearlyDividend || []} />
        </View>

        {/* 資料表格 */}
        <View style={styles.tableSection}>
          <View style={styles.tableSegmentContainer}>
            <TouchableOpacity
              style={[styles.tableSegment, tableSegment === 'yield' && styles.tableSegmentActive]}
              onPress={() => setTableSegment('yield')}
            >
              <Text
                style={[
                  styles.tableSegmentText,
                  tableSegment === 'yield' && styles.tableSegmentTextActive,
                ]}
              >
                殖利率
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tableSegment,
                tableSegment === 'exDividend' && styles.tableSegmentActive,
              ]}
              onPress={() => setTableSegment('exDividend')}
            >
              <Text
                style={[
                  styles.tableSegmentText,
                  tableSegment === 'exDividend' && styles.tableSegmentTextActive,
                ]}
              >
                除權息
              </Text>
            </TouchableOpacity>
          </View>

          {/* 表格內容 */}
          <DividendTable
            mode={tableSegment}
            yearlyData={yearlyDividend || []}
            exDividendData={exDividend || []}
          />
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
    marginBottom: 12,
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
  klineControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  periodButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  periodButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: Colors.background.secondary,
  },
  periodButtonActive: {
    backgroundColor: Colors.primary,
  },
  periodButtonText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  periodButtonTextActive: {
    color: Colors.text.inverse,
  },
  reductionToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reductionLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginRight: 8,
  },
  tableSection: {
    padding: 16,
  },
  tableSegmentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 16,
  },
  tableSegment: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: Colors.background.secondary,
  },
  tableSegmentActive: {
    backgroundColor: Colors.primary,
  },
  tableSegmentText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  tableSegmentTextActive: {
    color: Colors.text.inverse,
    fontWeight: '600',
  },
});
