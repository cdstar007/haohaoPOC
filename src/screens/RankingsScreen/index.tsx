/**
 * 列表頁 - 主畫面
 * 最新配息 / 配最多 兩個 Tab
 * 點擊股票後切換到股利/估價頁
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Colors } from '../../constants';
import { RANKING_CATEGORY } from '../../constants/api';
import { StockListItem, SearchModal } from '../../components';
import { useRankingData } from '../../hooks';
import { useStockStore } from '../../store/stockStore';
import type { RankingItem } from '../../models';
import { formatDate } from '../../utils';
import type { BottomTabParamList } from '../../navigation/types';

// 篩選類型
type CategoryType = 'ETF' | '個股' | '全部';

const CATEGORIES: CategoryType[] = ['ETF', '個股', '全部'];

// Tab 定義
type TabType = 'latest' | 'highest';

interface TabConfig {
  key: TabType;
  label: string;
  categoryId: number;
  headers: string[];
}

const TABS: TabConfig[] = [
  {
    key: 'latest',
    label: '最新配息',
    categoryId: RANKING_CATEGORY.latestDividend,
    headers: ['排行', '股票', '除息日', '頻率', '股價', '殖利率'],
  },
  {
    key: 'highest',
    label: '配最多',
    categoryId: RANKING_CATEGORY.highestYield,
    headers: ['排行', '股票', '殖利率', '股價', '評比'],
  },
];

export const RankingsScreen: React.FC = () => {
  const navigation = useNavigation<BottomTabNavigationProp<BottomTabParamList>>();
  const { setSelectedStock } = useStockStore();
  
  // 狀態
  const [activeTab, setActiveTab] = useState<TabType>('latest');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('ETF');
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  // 取得當前 Tab 配置
  const currentTabConfig = TABS.find((t) => t.key === activeTab) || TABS[0];

  // 使用 Hook 載入資料
  const { items, updateTime, isLoading, error, refresh } = useRankingData(
    currentTabConfig.categoryId
  );

  // 篩選資料
  const filteredItems = useMemo(() => {
    if (selectedCategory === '全部') return items;
    return items.filter((item) => {
      const isETF = /^0\d{3,4}$/.test(item.stockId);
      if (selectedCategory === 'ETF') return isETF;
      if (selectedCategory === '個股') return !isETF;
      return true;
    });
  }, [items, selectedCategory]);

  // 處理 Tab 切換
  const handleTabChange = useCallback((tabKey: TabType) => {
    setActiveTab(tabKey);
  }, []);

  // 處理股票點擊 - 設置選中股票並切換到股利頁
  const handleStockPress = useCallback((item: RankingItem) => {
    setSelectedStock(item.stockId, item.stockName);
    navigation.navigate('DividendTab');
  }, [navigation, setSelectedStock]);

  // 處理搜尋選擇
  const handleSearchSelect = useCallback((stockId: string, stockName: string) => {
    setSelectedStock(stockId, stockName);
    setIsSearchVisible(false);
    navigation.navigate('DividendTab');
  }, [navigation, setSelectedStock]);

  // 渲染列表項 - 帶入排名
  const renderItem = useCallback(
    ({ item, index }: { item: RankingItem; index: number }) => (
      <StockListItem
        item={item}
        rank={index + 1}
        onPress={handleStockPress}
        showExDividendDate={activeTab === 'latest'}
      />
    ),
    [activeTab, handleStockPress]
  );

  // 渲染欄位標題列
  const renderHeader = () => (
    <View style={styles.headerRow}>
      {currentTabConfig.headers.map((header, index) => (
        <Text
          key={header}
          style={[
            styles.headerCell,
            index === 0 && styles.headerCellRank,
            index === 1 && styles.headerCellFirst,
            index === currentTabConfig.headers.length - 1 && styles.headerCellLast,
          ]}
        >
          {header}
        </Text>
      ))}
    </View>
  );

  // 格式化更新時間
  const formattedUpdateTime = useMemo(() => {
    if (!updateTime) return '--/--';
    return formatDate(updateTime, 'MM/DD');
  }, [updateTime]);

  return (
    <SafeAreaView style={styles.container}>
      {/* 頂部導覽列 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>好好理財</Text>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => setIsSearchVisible(true)}
        >
          <Text style={styles.searchIcon}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Tab 切換 */}
      <View style={styles.tabContainer}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => handleTabChange(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
            {activeTab === tab.key && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* 分類篩選 Chip */}
      <View style={styles.chipContainer}>
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.chip,
              selectedCategory === category && styles.chipActive,
            ]}
            onPress={() => setSelectedCategory(category)}
          >
            <Text
              style={[
                styles.chipText,
                selectedCategory === category && styles.chipTextActive,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 欄位標題列 */}
      {renderHeader()}

      {/* 錯誤提示 */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>載入失敗，請下拉重試</Text>
        </View>
      )}

      {/* 列表 */}
      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.stockId}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            tintColor={Colors.primary}
          />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            {isLoading ? (
              <Text style={styles.emptyText}>載入中...</Text>
            ) : (
              <>
                <Text style={styles.emptyText}>暫無資料</Text>
                <Text style={styles.emptySubText}>下拉刷新載入資料</Text>
              </>
            )}
          </View>
        }
      />

      {/* 更新日期 */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          更新日期：{formattedUpdateTime}，此功能無推薦買賣之意，投資請獨立思考
        </Text>
      </View>

      {/* 搜尋 Modal */}
      <SearchModal
        visible={isSearchVisible}
        onClose={() => setIsSearchVisible(false)}
        onSelectStock={handleSearchSelect}
      />
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  searchButton: {
    padding: 8,
  },
  searchIcon: {
    fontSize: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  activeTab: {},
  tabText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '20%',
    right: '20%',
    height: 3,
    backgroundColor: Colors.primary,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  chipContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: Colors.background.primary,
  },
  chipActive: {
    backgroundColor: Colors.primary,
  },
  chipText: {
    fontSize: 14,
    color: Colors.primary,
  },
  chipTextActive: {
    color: Colors.text.inverse,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerCell: {
    flex: 1,
    fontSize: 11,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  headerCellRank: {
    flex: 0.6,
    textAlign: 'center',
  },
  headerCellFirst: {
    flex: 1.3,
    textAlign: 'left',
  },
  headerCellLast: {
    textAlign: 'right',
  },
  listContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: Colors.text.tertiary,
  },
  errorContainer: {
    backgroundColor: '#FFF3F3',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  errorText: {
    fontSize: 13,
    color: Colors.up,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background.secondary,
  },
  footerText: {
    fontSize: 11,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
});
