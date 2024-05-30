import type { Handler } from 'express';

import logger from '@lensshare/lib/logger';

import { array, number, object, string } from 'zod';

import { Errors } from '@lensshare/data/errors';

import { NextApiRequest, NextApiResponse } from 'next';
import allowCors from '@utils/allowCors';
import prisma from '@utils/prisma';


type ExtensionRequest = {
  length: number;
  options: string[];
};

const validationSchema = object({
  length: number(),
  options: array(string())
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { body } = req;

  if (!body) {
    return res.status(400).json({
      error: Errors.NoBody,
      success: false
    });
  }

  const validation = validationSchema.safeParse(body);

  if (!validation.success) {
    return res.status(400).json({
      error: Errors.InvalidBody,
      success: false
    });
  }

  const { length, options } = body as ExtensionRequest;

  if (length < 1 || length > 30) {
    return res.status(400).json({
      error: 'Poll length should be between 1 and 30 days.',
      success: false
    });
  }

  try {
    const data = await prisma.poll.create({
      data: {
        endsAt: new Date(Date.now() + length * 24 * 60 * 60 * 1000),
        options: {
          createMany: {
            data: options.map((option, index) => ({ index, option })),
            skipDuplicates: true
          }
        }
      },
      select: { createdAt: true, endsAt: true, id: true, options: true }
    });

    logger.info(`Created a poll ${data.id}`);

    return res.status(200).json({ poll: data, success: true });
  } catch (error) {
    logger.error(`Failed to create poll: ${error.message}`);
    return res.status(500).json({
      error: 'Internal Server Error',
      success: false
    });
  }
};

export default allowCors(handler);
