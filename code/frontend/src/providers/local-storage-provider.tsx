import React, { createContext, useContext, useEffect, useState } from "react";

type StorageValue = string | number | boolean | object | null;

type StorageContextType = {
  get: <T = StorageValue>(key: string, defaultValue?: T) => T;
  set: (key: string, value: StorageValue) => void;
  remove: (key: string) => void;
  clear: () => void;
};

const StorageContext = createContext<StorageContextType | undefined>(
  undefined
);

export const LocalStorageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [store, setStore] = useState<Record<string, StorageValue> | null>(null);

  // Load all localStorage on mount
  useEffect(() => {
    const data: Record<string, StorageValue> = {};

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      try {
        const value = JSON.parse(localStorage.getItem(key) as string);
        data[key] = value;
      } catch {
        data[key] = localStorage.getItem(key);
      }
    }

    setStore(data);
  }, []);

  // Get value
  const get = <T,>(key: string, defaultValue?: T): T => {

    if(!store) return "" as T;

    if (key in store) {
      return store[key] as T;
    }
    return defaultValue as T;
  };

  // Set value
  const set = (key: string, value: StorageValue) => {
    setStore((prev) => ({ ...prev, [key]: value }));
    localStorage.setItem(key, JSON.stringify(value));
  };

  // Remove key
  const remove = (key: string) => {
    setStore((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
    localStorage.removeItem(key);
  };

  // Clear all
  const clear = () => {
    setStore({});
    localStorage.clear();
  };

  return (
    <StorageContext.Provider value={{ get, set, remove, clear }}>
      {store ? children : <div>Loading config ...</div>}
    </StorageContext.Provider>
  );
};

// Hook
export const useStorage = () => {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error("useStorage must be used within LocalStorageProvider");
  }
  return context;
};