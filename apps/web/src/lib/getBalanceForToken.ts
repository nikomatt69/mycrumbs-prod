
import getAuthApiHeaders from '@components/Shared/Oembed/Portal/getAuthApiHeaders main';
import { HEY_API_URL } from '@lensshare/data/constants';
import axios from 'axios';

const getBalanceForToken = async (tokenAddress: string, account: string) => {
  try {
    const res = await axios.get(`/api/tokens/balance`, {
      headers: getAuthApiHeaders(),
      params: {
        account,
        tokenAddress
      }
    });
    return res.data.result;
  } catch (error) {
    return 0;
  }
};

export default getBalanceForToken;
