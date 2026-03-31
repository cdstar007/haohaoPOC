/**
 * 格式化工具函數
 */

/**
 * 格式化數字為貨幣格式
 */
export const formatCurrency = (value: number, decimals: number = 2): string => {
  if (value === null || value === undefined || isNaN(value)) return '--';
  return value.toFixed(decimals);
};

/**
 * 格式化百分比
 */
export const formatPercent = (value: number, decimals: number = 2): string => {
  if (value === null || value === undefined || isNaN(value)) return '--';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
};

/**
 * 格式化漲跌幅顯示
 * 包含 ▲ ▼ 符號
 */
export const formatPriceChange = (change: number, changePct: number): string => {
  if (change === null || change === undefined) return '--';
  const symbol = change >= 0 ? '▲' : '▼';
  return `${symbol}${Math.abs(change).toFixed(2)}（${formatPercent(changePct)}）`;
};

/**
 * 格式化日期
 * @param dateString ISO 日期字串或 Unix timestamp
 * @param format 格式類型
 */
export const formatDate = (
  dateString: string | number,
  format: 'MM/DD' | 'YYYY/MM/DD' | 'full' = 'YYYY/MM/DD'
): string => {
  if (!dateString) return '--';

  let date: Date;
  if (typeof dateString === 'number' || !isNaN(Number(dateString))) {
    // Unix timestamp (毫秒或秒)
    const timestamp = Number(dateString);
    date = new Date(timestamp > 9999999999 ? timestamp : timestamp * 1000);
  } else {
    date = new Date(dateString);
  }

  if (isNaN(date.getTime())) return '--';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  switch (format) {
    case 'MM/DD':
      return `${month}/${day}`;
    case 'YYYY/MM/DD':
      return `${year}/${month}/${day}`;
    case 'full':
      return `${year}/${month}/${day} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    default:
      return `${year}/${month}/${day}`;
  }
};

/**
 * 格式化成交量
 */
export const formatVolume = (volume: number): string => {
  if (volume === null || volume === undefined || isNaN(volume)) return '--';
  
  if (volume >= 100000000) {
    return `${(volume / 100000000).toFixed(2)}億`;
  } else if (volume >= 10000) {
    return `${(volume / 10000).toFixed(0)}萬`;
  }
  return volume.toString();
};

/**
 * 取得漲跌顏色
 */
export const getPriceChangeColor = (change: number): string => {
  if (change > 0) return '#FF5E5E'; // 上漲紅色
  if (change < 0) return '#00B050'; // 下跌綠色
  return '#666666'; // 持平灰色
};
