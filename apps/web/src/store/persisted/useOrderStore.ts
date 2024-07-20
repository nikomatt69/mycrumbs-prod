import { Localstorage } from '@lensshare/data/storage';
import { createTrackedSelector } from 'react-tracked';
import {create } from 'zustand';
import { persist } from 'zustand/middleware';


interface OrderState {
  amount: number;
  success: string | null;
  error: string | null;
  setAmount: (amount: number) => void;
  setSuccess: (success: string | null) => void;
  setError: (error: string | null) => void;
}

const store = create(
  persist<OrderState>(
    (set) => ({
      amount: 0,
      success: null,
      error: null,
      setAmount: (amount) => set({ amount }),
      setSuccess: (success) => set({ success }),
      setError: (error) => set({ error }),
    }),
    { name: Localstorage.OrderStore }
  )
);
export const useOrderStore = createTrackedSelector(store);
