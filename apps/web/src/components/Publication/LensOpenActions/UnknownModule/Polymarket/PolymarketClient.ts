import axios from 'axios';

const GAMMA_MARKETS_API = 'https://strapi-matic.poly.market';
const CLOB_API = 'https://clob.polymarket.com';

export class PolymarketClient {
  async getMarketData(eventSlug: string) {
    try {
      const response = await axios.get(`${GAMMA_MARKETS_API}/events?slug=${eventSlug}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching market data:', error);
      throw new Error('Failed to fetch market data');
    }
  }

  async getMarketBySlug(marketSlug: string) {
    try {
      const response = await axios.get(`${GAMMA_MARKETS_API}/markets?slug=${marketSlug}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching market by slug:', error);
      throw new Error('Failed to fetch market by slug');
    }
  }

  async placeOrder(order: any, apiKey: string) {
    try {
      const response = await axios.post(`${CLOB_API}/order`, { order, owner: apiKey });
      return response.data;
    } catch (error) {
      console.error('Error placing order:', error);
      throw new Error('Failed to place order');
    }
  }
}