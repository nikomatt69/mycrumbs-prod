import { IndexDB } from "@lensshare/data/storage";
import type { FiatRate } from "@lensshare/types/misc";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import createIdbStorage from "../lib/createIdbStorage";
import { createTrackedSelector } from "react-tracked";


interface State {
  fiatRates: [] | FiatRate[];
  setFiatRates: (fiatRates: FiatRate[]) => void;
}

const store = create(
  persist<State>(
    (set) => ({
      fiatRates: [],
      setFiatRates: (fiatRates) => set(() => ({ fiatRates }))
    }),
    { name: IndexDB.RateStore, storage: createIdbStorage() }
  )
);

export const useRatesStore = createTrackedSelector(store);
