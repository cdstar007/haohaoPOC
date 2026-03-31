/**
 * 股票搜尋 Modal
 * POC 階段僅實作靜態畫面
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors } from '../constants';

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectStock?: (stockId: string, stockName: string) => void;
}

// 模擬熱門搜尋股票
const POPULAR_STOCKS = [
  { stockId: '0050', stockName: '元大台灣50' },
  { stockId: '0056', stockName: '元大高股息' },
  { stockId: '2330', stockName: '台積電' },
  { stockId: '2317', stockName: '鴻海' },
  { stockId: '00878', stockName: '國泰永續高股息' },
  { stockId: '00881', stockName: '國泰台灣5G+' },
];

export const SearchModal: React.FC<SearchModalProps> = ({
  visible,
  onClose,
  onSelectStock,
}) => {
  const [searchText, setSearchText] = useState('');
  const [results, setResults] = useState<typeof POPULAR_STOCKS>([]);

  const handleSearch = (text: string) => {
    setSearchText(text);
    if (text.trim()) {
      // 模擬搜尋結果
      const filtered = POPULAR_STOCKS.filter(
        (stock) =>
          stock.stockId.includes(text) ||
          stock.stockName.includes(text)
      );
      setResults(filtered);
    } else {
      setResults([]);
    }
  };

  const handleSelect = (stockId: string, stockName: string) => {
    onSelectStock?.(stockId, stockName);
    setSearchText('');
    setResults([]);
    onClose();
  };

  const renderItem = ({ item }: { item: (typeof POPULAR_STOCKS)[0] }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleSelect(item.stockId, item.stockName)}
    >
      <Text style={styles.resultStockId}>{item.stockId}</Text>
      <Text style={styles.resultStockName}>{item.stockName}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.content}>
          {/* 搜尋欄 */}
          <View style={styles.header}>
            <View style={styles.searchInputContainer}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="輸入股票代號或名稱"
                placeholderTextColor={Colors.text.tertiary}
                value={searchText}
                onChangeText={handleSearch}
                autoFocus
              />
              {searchText.length > 0 && (
                <TouchableOpacity onPress={() => handleSearch('')}>
                  <Text style={styles.clearIcon}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelText}>取消</Text>
            </TouchableOpacity>
          </View>

          {/* 搜尋結果或熱門股票 */}
          <View style={styles.body}>
            {!searchText ? (
              <>
                <Text style={styles.sectionTitle}>熱門股票</Text>
                <FlatList
                  data={POPULAR_STOCKS}
                  renderItem={renderItem}
                  keyExtractor={(item) => item.stockId}
                  ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
              </>
            ) : results.length > 0 ? (
              <FlatList
                data={results}
                renderItem={renderItem}
                keyExtractor={(item) => item.stockId}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>找不到符合的股票</Text>
              </View>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  content: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    marginTop: 60,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
    padding: 0,
  },
  clearIcon: {
    fontSize: 14,
    color: Colors.text.tertiary,
    padding: 4,
  },
  cancelButton: {
    marginLeft: 12,
    paddingHorizontal: 8,
  },
  cancelText: {
    fontSize: 16,
    color: Colors.primary,
  },
  body: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  resultStockId: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
    width: 70,
  },
  resultStockName: {
    fontSize: 15,
    color: Colors.text.primary,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.text.secondary,
  },
});
