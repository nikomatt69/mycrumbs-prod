import type { AllowedToken } from '@lensshare/types/hey';

import { Localstorage } from '@lensshare/data/storage';
import { createTrackedSelector } from 'react-tracked';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Dispatch, SetStateAction } from 'react';
import type { Address } from 'viem';

interface NftOaCurrencyState {
  selectedNftOaCurrency: Address;
  setSelectedNftOaCurrency: (currency: Address) => void;
}

const store = create(
  persist<NftOaCurrencyState>(
    (set) => ({
      selectedNftOaCurrency:'0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
      setSelectedNftOaCurrency: (currency) => set({ selectedNftOaCurrency: currency })
    }),
    { name: Localstorage.NftOaCurrencyStore }
  )
);

export const useNftOaCurrencyStore = createTrackedSelector(store);
