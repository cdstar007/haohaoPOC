/**
 * 主題色定義
 */

export const Colors = {
  /** 主題色 - 用於 App 標題、選中 Tab 底線、選中 Chip 背景等 */
  primary: '#2D6AE7',
  /** 主題色淺色版本 */
  primaryLight: '#4A85F7',
  /** 主題色深色版本 */
  primaryDark: '#1E55C9',

  /** 上漲紅色 */
  up: '#FF5E5E',
  /** 下跌綠色 */
  down: '#00B050',

  /** 年度股利圖表顏色 */
  chart: {
    cashDividend: '#749BDD',
    stockDividend: '#90B4CF',
    cashYield: '#FF5E5E',
  },

  /** 估價虛線顏色 */
  valuation: {
    price: '#FF9F40',
    high: '#FF5E5E',
    fair: '#2D6AE7',
    low: '#00B050',
  },

  /** 文字顏色 */
  text: {
    primary: '#1A1A1A',
    secondary: '#666666',
    tertiary: '#999999',
    inverse: '#FFFFFF',
  },

  /** 背景色 */
  background: {
    primary: '#FFFFFF',
    secondary: '#F5F5F5',
    tertiary: '#EEEEEE',
  },

  /** 邊框色 */
  border: '#E0E0E0',
} as const;
