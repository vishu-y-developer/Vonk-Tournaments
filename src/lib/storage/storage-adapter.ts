export interface StorageAdapter {
  getItem<T>(key: string, fallback: T): T;
  setItem<T>(key: string, value: T): void;
  removeItem(key: string): void;
  clear(): void;
}
