import type { NextApiRequest, NextApiResponse } from 'next';
import { CLUBS_API_URL, CLUBS_APP_TOKEN } from '@lensshare/data/constants';
import logger from '@lensshare/lib/logger';
import { object, string } from 'zod';

const validationSchema = object({
  id: string().optional()
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { body } = req;

  if (!body) {
    return res.status(400).json({ error: 'Missing request body' });
  }

  const validation = validationSchema.safeParse(body);

  if (!validation.success) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  try {
    const accessToken = req.headers['x-access-token'] as string;
    const response = await fetch(`${CLUBS_API_URL}/join-club`, {
      method: 'POST',
      headers: {
        'App-Access-Token': CLUBS_APP_TOKEN,
        'Content-Type': 'application/json',
        'User-Agent': process.env.USER_AGENT || 'Unknown',
        'X-Access-Token': accessToken
      },
      body: JSON.stringify(body)
    });

    logger.info(`Joined a club ${body.id}`);

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    logger.error('Error joining club:');
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}