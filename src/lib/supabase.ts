import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

import { ENV } from '../config/env';

type StorageAdapter = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

const memoryStorage = new Map<string, string>();
let hasWarnedStorageFallback = false;

const inMemoryAdapter: StorageAdapter = {
  getItem: async (key) => memoryStorage.get(key) ?? null,
  setItem: async (key, value) => {
    memoryStorage.set(key, value);
  },
  removeItem: async (key) => {
    memoryStorage.delete(key);
  },
};

const shouldFallbackToMemoryStorage = (error: unknown): boolean => {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes('native module is null') ||
    message.includes('legacy storage') ||
    message.includes('asyncstorageerror')
  );
};

const withStorageFallback = async <T>(
  operation: () => Promise<T>,
  fallback: () => Promise<T>,
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    if (!shouldFallbackToMemoryStorage(error)) {
      throw error;
    }

    if (!hasWarnedStorageFallback) {
      hasWarnedStorageFallback = true;
      console.warn('AsyncStorage unavailable. Falling back to in-memory auth session storage.');
    }

    return fallback();
  }
};

const supabaseStorage: StorageAdapter = {
  getItem: async (key) =>
    withStorageFallback(() => AsyncStorage.getItem(key), () => inMemoryAdapter.getItem(key)),
  setItem: async (key, value) =>
    withStorageFallback(() => AsyncStorage.setItem(key, value), () => inMemoryAdapter.setItem(key, value)),
  removeItem: async (key) =>
    withStorageFallback(() => AsyncStorage.removeItem(key), () => inMemoryAdapter.removeItem(key)),
};

// Single shared Supabase client instance for the entire app.
export const supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY, {
  auth: {
    storage: supabaseStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
