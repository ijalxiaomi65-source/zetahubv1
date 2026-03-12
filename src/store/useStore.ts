import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  isVip: boolean;
  isVerified?: boolean;
  image?: string;
}

interface WatchlistItem {
  animeId: string;
  title: string;
  image: string;
  type: 'ANIME' | 'KDRAMA';
}

interface AppState {
  user: User | null;
  token: string | null;
  theme: 'dark' | 'light';
  watchlist: WatchlistItem[];
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setTheme: (theme: 'dark' | 'light') => void;
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
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setTheme: (theme) => set({ theme }),
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
