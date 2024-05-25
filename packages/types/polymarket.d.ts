// Types for Polymarket-related data
export interface Market {
  question: string;
  description: string;
  outcomes: Outcome[];
  imageUrl: string;
  currentPrices: number[];
  totalVolume: number;
}

export interface Outcome {
  name: string;
  price: number;
}

export interface PolymarketMarketData {
  title: string;
  description: string;
  outcomes: Outcome[];
  marketId: string;
  imageUrl: string;
  currentPrices: number[];
  totalVolume: number;
}
    