/**
 * Safe Storage Utility
 * Provides safe access to localStorage and sessionStorage with SSR support
 */

const isBrowser = (): boolean => {
  return typeof window !== 'undefined' && typeof window.document !== 'undefined';
};

export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (!isBrowser()) return null;
    try {
      const win = window as any;
      return win.localStorage ? win.localStorage.getItem(key) : null;
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    if (!isBrowser()) return;
    try {
      const win = window as any;
      if (win.localStorage) {
        win.localStorage.setItem(key, value);
      }
    } catch {
      // Ignore storage errors
    }
  },
  removeItem: (key: string): void => {
    if (!isBrowser()) return;
    try {
      const win = window as any;
      if (win.localStorage) {
        win.localStorage.removeItem(key);
      }
    } catch {
      // Ignore storage errors
    }
  },
};

export const safeSessionStorage = {
  getItem: (key: string): string | null => {
    if (!isBrowser()) return null;
    try {
      const win = window as any;
      return win.sessionStorage ? win.sessionStorage.getItem(key) : null;
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    if (!isBrowser()) return;
    try {
      const win = window as any;
      if (win.sessionStorage) {
        win.sessionStorage.setItem(key, value);
      }
    } catch {
      // Ignore storage errors
    }
  },
  removeItem: (key: string): void => {
    if (!isBrowser()) return;
    try {
      const win = window as any;
      if (win.sessionStorage) {
        win.sessionStorage.removeItem(key);
      }
    } catch {
      // Ignore storage errors
    }
  },
};

export const safeWindow = {
  addEventListener: (event: string, handler: EventListenerOrEventListenerObject): void => {
    if (!isBrowser()) return;
    try {
      window.addEventListener(event, handler);
    } catch {
      // Ignore errors
    }
  },
  removeEventListener: (event: string, handler: EventListenerOrEventListenerObject): void => {
    if (!isBrowser()) return;
    try {
      window.removeEventListener(event, handler);
    } catch {
      // Ignore errors
    }
  },
  clearTimeout: (id: number | null): void => {
    if (!isBrowser() || id === null) return;
    try {
      window.clearTimeout(id);
    } catch {
      // Ignore errors
    }
  },
  setTimeout: (handler: TimerHandler, timeout?: number): number | null => {
    if (!isBrowser()) return null;
    try {
      return window.setTimeout(handler, timeout);
    } catch {
      return null;
    }
  },
};

export default { safeLocalStorage, safeSessionStorage, safeWindow };
