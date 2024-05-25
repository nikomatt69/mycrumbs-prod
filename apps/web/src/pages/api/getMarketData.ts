
import { NextApiRequest, NextApiResponse } from 'next';
import { getMarketData } from 'src/hooks/polymarketUtils';

import { useAppStore } from 'src/store/persisted/useAppStore';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { marketId } = req.query;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { currentProfile } = useAppStore();

  if (!marketId || typeof marketId !== 'string') {
    res.status(400).json({ error: 'Invalid market ID' });
    return;
  }

  if (!currentProfile) {
    res.status(401).json({ error: 'User profile not found' });
    return;
  }

  try {
    const walletAddress = currentProfile.ownedBy.address;
    const marketData = await getMarketData(marketId as string, walletAddress);
    res.status(200).json(marketData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch market data', details: (error as Error).message });
  }
};

export default handler;
