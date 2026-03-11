import type { StateStorage } from 'zustand/middleware';

const DB_NAME = 'linkvisa-db';
const STORE_NAME = 'kv-store';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function transaction(mode: IDBTransactionMode): Promise<IDBObjectStore> {
  return openDB().then(
    (db) => db.transaction(STORE_NAME, mode).objectStore(STORE_NAME)
  );
}

export const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const store = await transaction('readonly');
    return new Promise((resolve, reject) => {
      const req = store.get(name);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
    });
  },
  setItem: async (name: string, value: string): Promise<void> => {
    const store = await transaction('readwrite');
    return new Promise((resolve, reject) => {
      const req = store.put(value, name);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },
  removeItem: async (name: string): Promise<void> => {
    const store = await transaction('readwrite');
    return new Promise((resolve, reject) => {
      const req = store.delete(name);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },
};
