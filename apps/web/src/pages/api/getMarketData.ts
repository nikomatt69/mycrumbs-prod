import { NextApiRequest, NextApiResponse } from 'next';
import { ClobClient } from '@polymarket/clob-client';
import { Address, useAccount, useWalletClient } from 'wagmi';
import { CHAIN_ID } from '@lensshare/data/constants';
import { useAppStore } from 'src/store/persisted/useAppStore';
import walletClient from '@lib/walletClient';
import getCurrentSession from '@lib/getCurrentSession';

const API_URL = 'https://poly-prod-6m862b8v2.polymarket.dev/api/markets/';

const getMarketData = async (marketId: string, walletAddress: string) => {
  const clobClient = new ClobClient(API_URL, CHAIN_ID, walletClient(walletAddress));
  const market = await clobClient.getMarket(marketId);
  
  return {
    title: market?.question,
    description: market?.description,
    outcomes: market?.outcomes.map((o: any) => ({ name: o?.name, price: o?.price })),
    marketId,
    imageUrl: market?.imageUrl,
    currentPrices: market?.currentPrices,
    totalVolume: market?.totalVolume,
  };
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { marketId } = req.query;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  

  if (!marketId || typeof marketId !== 'string') {
    res.status(400).json({ error: 'Invalid market ID' });
    return;
  }

  if (!walletClient as any) {
    res.status(401).json({ error: 'User profile not found' });
    return;
  }

  try {
    const walletAddress = getCurrentSession().id as string;
    const marketData = await getMarketData(marketId, walletAddress);
    res.status(200).json(marketData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch market data', details: error });
  }
};

export default handler;