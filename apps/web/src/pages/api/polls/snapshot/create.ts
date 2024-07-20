import type { Handler } from 'express';

import logger from '@lensshare/lib/logger';

import { array, number, object, string } from 'zod';
import validateLensAccount from 'src/utils/middlewares/validateLensAccount';
import { Errors } from '@lensshare/data/errors';
import prisma from 'src/utils/prisma';
import { NextApiRequest, NextApiResponse } from 'next';
import allowCors from 'src/utils/allowCors';

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
    return Errors.NoBody;
  }

  const validation = validationSchema.safeParse(body);

  if (!validation.success) {
    return Errors.NoBody;
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
    return (error);
  }
};

export default allowCors(handler);
