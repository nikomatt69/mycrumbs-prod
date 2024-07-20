import { RPC_URL } from '@lensshare/data/constants';
import { Errors } from '@lensshare/data/errors';
import type { Handler } from 'express';
import { NextApiRequest, NextApiResponse } from 'next';
import allowCors from 'src/utils/allowCors';

import { createPublicClient, http, parseAbi } from 'viem';
import { polygon, polygonMumbai } from 'viem/chains';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { tokenAddress } = req.query;

  if (!tokenAddress || typeof tokenAddress !== 'string') {
    return Errors.NoBody;
  }

  const network = req.headers['x-lens-network'] as string;
  const isMainnet = network === 'mainnet';

  try {
    const client = createPublicClient({
      chain: isMainnet ? polygon : polygon,
      transport: http(RPC_URL)
    });

    const tokenContract = {
      abi: parseAbi([
        'function name() view returns (string memory)',
        'function symbol() view returns (string memory)',
        'function decimals() view returns (uint8)'
      ]),
      address: tokenAddress as `0x${string}`
    } as const;

    const results = await client.multicall({
      contracts: [
        {
          ...tokenContract,
          functionName: 'name'
        },
        {
          ...tokenContract,
          functionName: 'symbol'
        },
        {
          ...tokenContract,
          functionName: 'decimals'
        }
      ]
    });

    console.log('balance:get result', results);

    return res.status(200).json({ result: results, success: true });
  } catch (error) {
    return (error);
  }
};
export default allowCors(handler);
