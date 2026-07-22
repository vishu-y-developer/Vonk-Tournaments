import { StorageAdapter } from './storage-adapter';

class BrowserStorage implements StorageAdapter {
  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  getItem<T>(key: string, fallback: T): T {
    if (!this.isBrowser()) {
      return fallback;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : fallback;
    } catch (error) {
      console.error(`Error reading key "${key}" from localStorage:`, error);
      return fallback;
    }
  }

  setItem<T>(key: string, value: T): void {
    if (!this.isBrowser()) {
      return;
    }
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing key "${key}" to localStorage:`, error);
    }
  }

  removeItem(key: string): void {
    if (!this.isBrowser()) {
      return;
    }
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing key "${key}" from localStorage:`, error);
    }
  }

  clear(): void {
    if (!this.isBrowser()) {
      return;
    }
    try {
      window.localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }
}

export const browserStorage = new BrowserStorage();
export default browserStorage;
