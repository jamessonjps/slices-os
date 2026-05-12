export const safeLocalStorage = {
  get(key) {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return null;
      return window.localStorage.getItem(key);
    } catch (error) {
      console.warn('safeLocalStorage.get failed for', key, error);
      return null;
    }
  },

  set(key, value) {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      window.localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn('safeLocalStorage.set failed for', key, error);
      return false;
    }
  },

  remove(key) {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      window.localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn('safeLocalStorage.remove failed for', key, error);
      return false;
    }
  }
};

export function safeJsonParse(value, fallback = null) {
  try {
    if (typeof value !== 'string') return fallback;
    return JSON.parse(value);
  } catch (error) {
    console.warn('safeJsonParse failed', error);
    return fallback;
  }
}
