import { Localstorage } from '@lensshare/data/storage';
import { createTrackedSelector } from 'react-tracked';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
interface MarketState {
  market: any | null;
  loading: boolean;
  error: string | null;
  setMarket: (market: any) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}


const store = create(
  persist<MarketState>(
    (set) => ({
      market: null,
      loading: false,
      error: null,
      setMarket: (market) => set({ market }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
    }),
    { name: Localstorage.MarketStore }
  )
);
export const useMarketStore = createTrackedSelector(store);
