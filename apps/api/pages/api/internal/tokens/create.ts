
import logger from '@lensshare/lib/logger';
import allowCors from '@utils/allowCors';
import { SWR_CACHE_AGE_1_MIN_30_DAYS } from '@utils/constants';
import { Errors } from '@utils/errors';
import validateIsStaff from '@utils/middlewares/validateIsStaff';
import prisma from '@utils/prisma';
import { Regex } from '@utils/regex';
import { NextApiRequest, NextApiResponse } from 'next';

import { number, object, string } from 'zod';

type ExtensionRequest = {
  contractAddress: string;
  decimals: number;
  name: string;
  symbol: string;
};

const validationSchema = object({
  contractAddress: string()
    .min(1)
    .max(42)
    .regex(Regex.ethereumAddress, { message: 'Invalid Ethereum address' }),
  decimals: number().min(0).max(18),
  name: string().min(1).max(100),
  symbol: string().min(1).max(100)
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { body } = req;

  if (!body) {
    return res.status(400).json({ error: 'Request body is missing' });
  }

  const validation = validationSchema.safeParse(body);

  if (!validation.success) {
    return res.status(400).json({ error: 'Invalid request body', details: Errors.SomethingWentWrong, });
  }

  if (!(await validateIsStaff(req))) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { contractAddress, decimals, name, symbol } = body as ExtensionRequest;

  try {
    const token = await prisma.allowedToken.create({
      data: { contractAddress, decimals, name, symbol }
    });
    logger.info(`Created a token ${token.id}`);

    return res
      .status(200)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Cache-Control', SWR_CACHE_AGE_1_MIN_30_DAYS)
      .json({ success: true, token });
  } catch (error) {
    logger.error('Error creating token');
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default allowCors(handler);