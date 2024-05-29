import logger from '@lensshare/lib/logger';
import { error } from 'console';
import type { Handler } from 'express';
import { NextApiRequest, NextApiResponse } from 'next';
import allowCors from 'src/utils/allowCors';
import { SWR_CACHE_AGE_10_MINS_30_DAYS } from 'src/utils/constants';


import prisma from 'src/utils/prisma';


const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  if (!id) {
    return error(res);
  }

  try {
    const [globalStats, notificationStats] = await prisma.multi(
      `
        SELECT 
          total_posts,
          total_comments,
          total_mirrors,
          total_quotes,
          total_publications,
          total_reacted,
          total_reactions,
          total_collects,
          total_acted
        FROM global_stats.profile
        WHERE profile_id = $1;
        SELECT COUNT(*) as total_notifications
        FROM notification.record
        WHERE notification_receiving_profile_id = $1;
      `,
      [id]
    );

    if (!globalStats[0]) {
      return res.status(404).json({ success: false });
    }

    const result = {
      ...globalStats[0],
      total_notifications: Number(notificationStats[0]?.total_notifications)
    };

    logger.info(`Lens: Fetched global profile stats for ${id}`);

    return res
      .status(200)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Cache-Control', SWR_CACHE_AGE_10_MINS_30_DAYS)
      .json({ result, success: true });
  } catch (error) {
    error;
  }
};

export default allowCors(handler);