// utils/test-utils.ts
import { AxiosError, InternalAxiosRequestConfig } from 'axios';

export interface MockAxiosError extends AxiosError {
  response?: {
    status: number;
    data: {
      error?: string;
    };
    statusText: string;
    config: InternalAxiosRequestConfig;
    headers: Record<string, string>;
  };
}

export const createMockAxiosError = (
  status: number,
  message?: string
): MockAxiosError => {
  const error = new Error(message || 'API Error') as MockAxiosError;
  error.isAxiosError = true;
  error.name = 'AxiosError';
  error.response = {
    status,
    data: { error: message || 'Error occurred' },
    statusText: '',
    config: {} as InternalAxiosRequestConfig,
    headers: {},
  };
  return error;
};

export const createNetworkError = (): Error => {
  const error = new Error('Network Error');
  error.name = 'NetworkError';
  return error;
};