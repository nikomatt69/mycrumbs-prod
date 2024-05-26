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
export type ButtonType = 'link' | 'mint' | 'post_redirect' | 'post' | 'tx';
export interface PolymarketMarketData {
  buttons: {
    action: ButtonType;
    button: string;
    target?: string;
  }[];
  title: string;
  description: string;
  outcomes: Outcome[];
  marketId: string;
  imageUrl: string;
  currentPrices: number[];
  totalVolume: number;
}
    