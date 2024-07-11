import { RPC_URL } from '@lensshare/data/constants';
import { Errors } from '@lensshare/data/errors';
import type { Handler } from 'express';
import { NextApiRequest, NextApiResponse } from 'next';
import allowCors from 'src/utils/allowCors';

import { createPublicClient, http, parseAbi } from 'viem';
import { polygon, polygonMumbai } from 'viem/chains';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { account, tokenAddress } = req.query;

  if (
    !tokenAddress ||
    typeof tokenAddress !== 'string' ||
    !account ||
    typeof account !== 'string'
  ) {
    return Errors.NoBody;
  }

  const network = req.headers['x-lens-network'] as string;
  const isMainnet = network === 'mainnet';

  try {
    const client = createPublicClient({
      chain: isMainnet ? polygon : polygon,
      transport: http(RPC_URL)
    });

    const result = await client.readContract({
      abi: parseAbi(['function balanceOf(address) view returns (uint256)']),
      address: tokenAddress as `0x${string}`,
      args: [account as `0x${string}`],
      functionName: 'balanceOf'
    });

    console.log('balance:get result', result);

    return res.status(200).json({ result: result.toString(), success: true });
  } catch (error) {
    return ( error);
  }
};
export default allowCors(handler);
