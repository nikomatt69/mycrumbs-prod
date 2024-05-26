import { PolymarketMarketData, ButtonType } from '@lensshare/types/polymarket';
import type { Document } from 'linkedom';

/**
 * Parses a Document object to extract metadata relevant to a Polymarket market.
 * @param document - The Document object parsed from an HTML response.
 * @param url - The original URL fetched, used as a fallback for the market URL.
 * @returns A PolymarketMarketData object or null if essential data can't be extracted.
 */
const getPolymarket = (document: Document, url?: string): PolymarketMarketData | null => {
  const getMeta = (key: string): string | null => {
    const selector = `meta[name="${key}"], meta[property="${key}"]`;
    const metaTag = document.querySelector(selector);
    return metaTag ? metaTag.getAttribute('content') : null;
  };

  const parseMetaContentToList = (content: string | null): string[] => (content ? content.split('|') : []);

  const title = getMeta('pm:title');
  const description = getMeta('pm:description');
  const outcomes = parseMetaContentToList(getMeta('pm:outcomes'));
  const marketId = getMeta('pm:market_id');
  const imageUrl = getMeta('pm:image_url');
  const currentPrices = parseMetaContentToList(getMeta('pm:current_prices')).map((price) => parseFloat(price));
  const totalVolume = parseFloat(getMeta('pm:total_volume') || '0');

  let buttons: PolymarketMarketData['buttons'] = [];
  for (let i = 1; i < 5; i++) {
    const button =
      getMeta(`pm:button:${i}`) || getMeta(`pm:button:${i}`);
    const action = (getMeta(`pm:button:${i}:action`) ||
      getMeta(`pm:button:${i}:action`) ||
      'post') as ButtonType;
    const target = (getMeta(`pm:button:${i}:target`) ||
      getMeta(`pm:button:${i}:target`)) as string;

    if (!button) {
      break;
    }

    buttons.push({ action, button, target });
  }

 
  if (!marketId || !title || outcomes.length === 0 || currentPrices.length === 0 || buttons.length === 0) {
    return null; // Ensuring all essential data is present
  }

  return {
    title: title ?? '',
    description: description ?? '',
    outcomes: outcomes.map((name, index) => ({ name, price: currentPrices[index] })),
    marketId: url ?? '',
    imageUrl: imageUrl ?? '',
    currentPrices,
    totalVolume,
    buttons,
  };
};

export default getPolymarket;