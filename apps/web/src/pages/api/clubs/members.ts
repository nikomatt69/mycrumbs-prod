import { CLUBS_API_URL, CLUBS_APP_TOKEN, HEY_USER_AGENT } from "@lensshare/data/constants";
import logger from "@lensshare/lib/logger";
import { NextApiRequest, NextApiResponse } from "next";
import { object, string, number } from "zod";

const validationSchema = object({
  id: string().optional(),
  limit: number().max(50).optional(),
  skip: number().max(50).optional()
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { body } = req;

  if (!body) {
    return res.status(400).json({ error: 'No body provided' });
  }

  const validation = validationSchema.safeParse(body);

  if (!validation.success) {
    return res.status(400).json({ error: 'Invalid body' });
  }

  try {
    const accessToken = req.headers['x-access-token'] as string;
    const { handle } = req.query; // Get the handle from the dynamic route

    const response = await fetch(`${CLUBS_API_URL}/fetch-club-members`, {
      method: 'POST',
      headers: {
        'App-Access-Token': CLUBS_APP_TOKEN,
        'Content-Type': 'application/json',
        'User-Agent': HEY_USER_AGENT,
        'X-Access-Token': accessToken
      },
      body: JSON.stringify({ ...body, club_handle: handle })
    });

    logger.info(`Clubs members fetched for ${handle}`);

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('Error fetching club members:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}