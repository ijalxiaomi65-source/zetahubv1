import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  isVip: boolean;
  isVerified?: boolean;
  image?: string;
}

interface WatchlistItem {
  animeId: string;
  title: string;
  image: string;
  type: 'anime' | 'donghua' | 'kdrama';
}

interface AppState {
  user: User | null;
  token: string | null;
  theme: 'dark' | 'light';
  watchlist: WatchlistItem[];
  isPreparing: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  setIsPreparing: (isPreparing: boolean) => void;
  addToWatchlist: (item: WatchlistItem) => void;
  removeFromWatchlist: (animeId: string) => void;
  logout: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      theme: 'dark',
      watchlist: [],
      isPreparing: false,
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setTheme: (theme) => set({ theme }),
      setIsPreparing: (isPreparing) => set({ isPreparing }),
      addToWatchlist: (item) => set((state) => ({
        watchlist: state.watchlist.some(i => i.animeId === item.animeId) 
          ? state.watchlist 
          : [...state.watchlist, item]
      })),
      removeFromWatchlist: (animeId) => set((state) => ({
        watchlist: state.watchlist.filter(i => i.animeId !== animeId)
      })),
      logout: () => set({ user: null, token: null, watchlist: [] }),
    }),
    {
      name: 'zetahub-storage',
    }
  )
);
