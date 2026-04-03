import { create } from "zustand";

const TOKEN_KEY = "admin_token";
const USER_KEY = "admin_user";

function readStorage(key) {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key, value) {
  if (typeof window === "undefined") return;
  try {
    if (value === null || value === undefined) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // ignore storage errors
  }
}

function parseUser(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  isLoading: true,
  setUser: (user) => {
    writeStorage(USER_KEY, user ? JSON.stringify(user) : null);
    set({ user: user || null });
  },
  setAccessToken: (accessToken) => {
    writeStorage(TOKEN_KEY, accessToken || null);
    set({ accessToken: accessToken || null });
  },
  setLoading: (isLoading) => set({ isLoading: Boolean(isLoading) }),
  hydrateFromStorage: () => {
    const token = readStorage(TOKEN_KEY);
    const user = parseUser(readStorage(USER_KEY));
    set({
      accessToken: token || null,
      user: user || null,
    });
    return { token: token || null, user: user || null };
  },
  logout: () => {
    writeStorage(TOKEN_KEY, null);
    writeStorage(USER_KEY, null);
    set({ user: null, accessToken: null, isLoading: false });
  },
}));

export default useAuthStore;
