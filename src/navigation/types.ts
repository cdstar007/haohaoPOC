/**
 * 導航型別定義
 */

// 底部 Tab 導航參數列表
export type BottomTabParamList = {
  RankingsTab: undefined;    // 列表頁
  DividendTab: undefined;    // 股利頁
  ValuationTab: undefined;   // 估價頁
};

// 根堆疊導航參數列表 (用於 Modal 等全屏頁面)
export type RootStackParamList = {
  Main: undefined;           // 主頁面 (包含底部 Tab)
  Search: undefined;         // 搜尋頁 (未來擴展)
};

// 宣告模組以獲得型別支援
declare global {
  namespace ReactNavigation {
    interface RootParamList extends BottomTabParamList {}
  }
}
