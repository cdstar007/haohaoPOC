/**
 * API 客戶端
 * 封裝 axios，處理環境切換、通用參數、錯誤處理
 * 
 * CORS 說明：
 * - Web (瀏覽器): 受 CORS 限制，需要後端設置 Access-Control-Allow-Origin
 * - React Native (iOS/Android): 無 CORS 限制
 * 
 * 目前方案：Web 開發時暫時使用 Mock 資料，真機測試使用真實 API
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import {
  BASE_URL,
  getDefaultParams,
  API_TIMEOUT,
} from '../constants/api';

// 判斷是否在 Web 環境
const isWeb = typeof window !== 'undefined' && window.document;

// Web 開發時使用 Mock 資料 (避免 CORS 問題)
const USE_MOCK_IN_WEB = true;

/**
 * 建立 Axios 實例
 */
const createAPIClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  // 請求攔截器
  client.interceptors.request.use(
    (config) => {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.params);
      return config;
    },
    (error) => {
      console.error('[API Request Error]', error);
      return Promise.reject(error);
    }
  );

  // 回應攔截器
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      console.log(`[API Response] ${response.config.url} - Status: ${response.status}`);
      return response;
    },
    (error) => {
      console.error('[API Response Error]', error.message);
      
      const errorMessage = error.response?.data?.message || error.message || '發生錯誤';
      const statusCode = error.response?.status;
      
      console.error(`[API Error ${statusCode}]`, errorMessage);
      
      return Promise.reject({
        message: errorMessage,
        status: statusCode,
        originalError: error,
      });
    }
  );

  return client;
};

/**
 * API 客戶端實例
 */
export const apiClient = createAPIClient();

/**
 * 封裝 GET 請求
 */
export const get = async <T>(url: string, params?: Record<string, unknown>): Promise<T> => {
  const defaultParams = getDefaultParams();
  
  const response = await apiClient.get<{ data: T }>(url, {
    params: { ...defaultParams, ...params },
  });
  
  return response.data.data;
};

/**
 * 封裝 POST 請求
 */
export const post = async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
  const response = await apiClient.post<{ data: T }>(url, data, config);
  return response.data.data;
};

/**
 * 封裝多個並行請求
 */
export const parallelRequests = async <T extends Record<string, Promise<unknown>>>(
  requests: T
): Promise<{ [K in keyof T]: Awaited<T[K]> | null }> => {
  const entries = Object.entries(requests);
  const promises = entries.map(([, promise]) => promise);
  const results = await Promise.allSettled(promises);

  const settledResults = {} as { [K in keyof T]: Awaited<T[K]> | null };

  entries.forEach(([key], index) => {
    const result = results[index];
    if (result.status === 'fulfilled') {
      settledResults[key as keyof T] = result.value as Awaited<T[keyof T]>;
    } else {
      console.error(`[Parallel Request Failed] ${key}:`, result.reason);
      settledResults[key as keyof T] = null;
    }
  });

  return settledResults;
};

/**
 * 是否在 Web 環境 (用於判斷是否使用 Mock)
 */
export const shouldUseMockInWeb = (): boolean => {
  return isWeb && USE_MOCK_IN_WEB;
};
