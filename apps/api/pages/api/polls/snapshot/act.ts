import type { Handler } from 'express';

import logger from '@lensshare/lib/logger';
import parseJwt from '@lensshare/lib/parseJwt';

import { object, string } from 'zod';

import { Errors } from '@utils/errors';
import allowCors from '@utils/allowCors';
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@utils/prisma';

type ExtensionRequest = {
  option: string;
  poll: string;
};

const validationSchema = object({
  option: string().uuid(),
  poll: string().uuid()
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { body } = req;

  if (!body) {
    return res.status(400).json({ error: Errors.NoBody, success: false });
  }

  const accessToken = req.headers['x-access-token'] as string;
  const validation = validationSchema.safeParse(body);

  if (!validation.success) {
    return res.status(400).json({ error: Errors.NoBody, success: false });
  }

  const { option, poll } = body as ExtensionRequest;

  try {
    const payload = parseJwt(accessToken);

    // Check if the poll expired
    const pollData = await prisma.poll.findUnique({
      where: { id: poll }
    });

    if (!pollData || (pollData.endsAt as Date).getTime() < Date.now()) {
      return res.status(400).json({ error: 'Poll expired.', success: false });
    }

    // Check if the poll exists and delete the existing response
    const existingResponse = await prisma.pollResponse.findFirst({
      where: {
        option: { pollId: poll },
        profileId: payload.id
      }
    });

    if (existingResponse) {
      await prisma.pollResponse.delete({
        where: { id: existingResponse.id }
      });
    }

    const data = await prisma.pollResponse.create({
      data: { optionId: option, profileId: payload.id }
    });

    logger.info(`Responded to a poll ${option}:${data.id}`);

    return res.status(200).json({ id: data.id, success: true });
  } catch (error) {
    logger.error('Error responding to poll');
    return res.status(500).json({ error: 'Internal Server Error', success: false });
  }
};

export default allowCors(handler);
