import { HEY_API_URL } from '@lensshare/data/constants';
import type { AllowedToken } from '@lensshare/types/hey';

import axios from 'axios';

/**
 * Get all allowed tokens
 * @returns all allowed tokens
 */
const getAllTokens = async (): Promise<AllowedToken[]> => {
  try {
    const response = await axios.get(`/api/tokens/all`, {
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
    const { data} = response;

    return data?.tokens || [];
  } catch {
    return [];
  }
};

export default getAllTokens;