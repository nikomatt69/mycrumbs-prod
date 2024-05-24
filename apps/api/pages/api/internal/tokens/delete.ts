import logger from '@lensshare/lib/logger';
import allowCors from '@utils/allowCors';
import { Errors } from '@utils/errors';
import validateIsStaff from '@utils/middlewares/validateIsStaff';
import prisma from '@utils/prisma';
import { NextApiRequest, NextApiResponse } from 'next';
import { object, string } from 'zod';

type ExtensionRequest = {
  id: string;
};

const validationSchema = object({
  id: string()
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { body } = req;

  if (!body) {
    return res.status(400).json({ error: 'Request body is missing' });
  }

  const validation = validationSchema.safeParse(body);

  if (!validation.success) {
    return res.status(400).json({ error: 'Invalid request body', details: Errors.SomethingWentWrong });
  }

  if (!(await validateIsStaff(req))) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { id } = body as ExtensionRequest;

  try {
    await prisma.allowedToken.delete({
      where: { id }
    });
    logger.info(`Deleted a token ${id}`);

    return res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Error deleting token');
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default allowCors(handler);
