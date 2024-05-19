import type { AllowedToken } from '@lensshare/types/hey';

import { Localstorage } from '@lensshare/data/storage';
import { createTrackedSelector } from 'react-tracked';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Dispatch, SetStateAction } from 'react';

interface NftOaCurrencyState {
  selectedNftOaCurrency: AllowedToken;
  setSelectedNftOaCurrency: (currency: AllowedToken) => void;
}

const store = create(
  persist<NftOaCurrencyState>(
    (set) => ({
      selectedNftOaCurrency: {
        contractAddress: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
        decimals: 18,
        id: 'WMATIC',
        name: 'Wrapped MATIC',
        symbol: 'WMATIC'
      },
      setSelectedNftOaCurrency: (currency) => set({ selectedNftOaCurrency: currency })
    }),
    { name: Localstorage.NftOaCurrencyStore }
  )
);

export const useNftOaCurrencyStore = createTrackedSelector(store);
