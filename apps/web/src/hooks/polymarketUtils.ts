import axios from 'axios';
import { PolymarketMarketData } from '@lensshare/types/polymarket';

const POLYMARKET_API_URL = 'https://clob-staging.polymarket.com/';

/**
 * Extracts the market ID from a Polymarket URL.
 * @param {string} url - The full URL from Polymarket.
 * @returns {string | null} - The market ID or null if not found.
 */
export function extractMarketId(url: string): string | null {
  const regex = /polymarket\.com\/market\/([^/]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

/**
 * Fetches market data from Polymarket's API given a market ID.
 * @param {string} marketId - The market ID to fetch.
 * @returns {Promise<PolymarketMarketData>} - The market data as a JSON object.
 */
export async function fetchMarketData(marketId: string): Promise<PolymarketMarketData> {
  try {
    const response = await axios.get(`${POLYMARKET_API_URL}/${marketId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch market data:', error);
    throw new Error('Failed to fetch market data');
  }
}