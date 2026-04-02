import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  /** Memory-only token: false until SessionBootstrap finishes trying cookie refresh */
  sessionReady: false,
  isLoading: false,
  setUser: (user) => set({ user }),
  setAccessToken: (accessToken) => set({ accessToken }),
  setSessionReady: (sessionReady) => set({ sessionReady }),
  logout: () => set({ user: null, accessToken: null }),
}));

export default useAuthStore;
