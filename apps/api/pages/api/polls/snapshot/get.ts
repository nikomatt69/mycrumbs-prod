import type { Handler } from 'express';

import logger from '@lensshare/lib/logger';
import parseJwt from '@lensshare/lib/parseJwt';
import { Errors } from '@lensshare/data/errors';

import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@utils/prisma';
import allowCors from '@utils/allowCors';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: Errors.NoBody, success: false });
  }

  const accessToken = req.headers['x-access-token'] as string;

  try {
    const payload = parseJwt(accessToken);

    const data = await prisma.poll.findUnique({
      select: {
        endsAt: true,
        id: true,
        options: {
          orderBy: { index: 'asc' },
          select: {
            _count: { select: { responses: true } },
            id: true,
            option: true,
            responses: {
              select: { id: true },
              where: { profileId: payload.id }
            }
          }
        }
      },
      where: { id: id as string }
    });

    if (!data) {
      return res.status(404).json({ error: 'Poll not found.', success: false });
    }

    const totalResponses = data.options.reduce(
      (acc, option) => acc + option._count.responses,
      0
    );

    const sanitizedData = {
      endsAt: data.endsAt,
      id: data.id,
      options: data.options.map(option => ({
        id: option.id,
        option: option.option,
        percentage:
          totalResponses > 0
            ? (option._count.responses / totalResponses) * 100
            : 0,
        responses: option._count.responses,
        voted: option.responses.length > 0
      }))
    };

    logger.info('Poll fetched');

    return res.status(200).json({ result: sanitizedData, success: true });
  } catch (error) {
    logger.error('Error fetching poll');
    return res.status(500).json({ error: 'Internal server error', success: false });
  }
};

export default allowCors(handler);
