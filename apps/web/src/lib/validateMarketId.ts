
export const validateMarketId = (marketId: string): boolean => {
  // Simple validation: check if marketId is a non-empty string
  return marketId.trim().length > 0;
};
    