import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = '@cinesearch_watchlist';

export type WatchlistMovie = {
  imdbID: string;
  Title: string;
  Year: string;
  Poster: string;
  Type?: string;
  addedAt: number; // timestamp
};

type WatchlistContextType = {
  watchlist: WatchlistMovie[];
  isInWatchlist: (imdbID: string) => boolean;
  addToWatchlist: (movie: Omit<WatchlistMovie, 'addedAt'>) => Promise<void>;
  removeFromWatchlist: (imdbID: string) => Promise<void>;
  toggleWatchlist: (movie: Omit<WatchlistMovie, 'addedAt'>) => Promise<void>;
  clearWatchlist: () => Promise<void>;
};

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const [watchlist, setWatchlist] = useState<WatchlistMovie[]>([]);

  // Load watchlist from storage on mount
  useEffect(() => {
    (async () => {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        if (json) {
          setWatchlist(JSON.parse(json));
        }
      } catch (e) {
        console.warn('Failed to load watchlist:', e);
      }
    })();
  }, []);

  // Persist to storage
  const persist = useCallback(async (list: WatchlistMovie[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Failed to save watchlist:', e);
    }
  }, []);

  const isInWatchlist = useCallback(
    (imdbID: string) => watchlist.some((m) => m.imdbID === imdbID),
    [watchlist]
  );

  const addToWatchlist = useCallback(
    async (movie: Omit<WatchlistMovie, 'addedAt'>) => {
      const updated = [{ ...movie, addedAt: Date.now() }, ...watchlist];
      setWatchlist(updated);
      await persist(updated);
    },
    [watchlist, persist]
  );

  const removeFromWatchlist = useCallback(
    async (imdbID: string) => {
      const updated = watchlist.filter((m) => m.imdbID !== imdbID);
      setWatchlist(updated);
      await persist(updated);
    },
    [watchlist, persist]
  );

  const toggleWatchlist = useCallback(
    async (movie: Omit<WatchlistMovie, 'addedAt'>) => {
      if (isInWatchlist(movie.imdbID)) {
        await removeFromWatchlist(movie.imdbID);
      } else {
        await addToWatchlist(movie);
      }
    },
    [isInWatchlist, addToWatchlist, removeFromWatchlist]
  );

  const clearWatchlist = useCallback(async () => {
    setWatchlist([]);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <WatchlistContext.Provider
      value={{ watchlist, isInWatchlist, addToWatchlist, removeFromWatchlist, toggleWatchlist, clearWatchlist }}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const ctx = useContext(WatchlistContext);
  if (!ctx) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return ctx;
}
