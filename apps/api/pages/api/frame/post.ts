import { HEY_USER_AGENT, IS_MAINNET } from '@lensshare/data/constants';
import { Errors } from '@lensshare/data/errors';
import logger from '@lensshare/lib/logger';
import parseJwt from '@lensshare/lib/parseJwt';
import allowCors from '@utils/allowCors';
import validateLensAccount from '@utils/middlewares/validateLensAccount';
import getFrame from '@utils/oembed/meta/getFrame';
import signFrameAction from '@utils/signFrameAction';
import axios from 'axios';
import { parseHTML } from 'linkedom';
import { NextApiRequest, NextApiResponse } from 'next';

import { polygon } from 'viem/chains';
import { number, object, string } from 'zod';

type ExtensionRequest = {
  buttonIndex: number;

  postUrl: string;
  pubId: string;
};

const validationSchema = object({
  buttonIndex: number(),
  
  postUrl: string(),
  pubId: string()
});

// Default export for Next.js API route
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { body } = req;

  if (!body) {
    return Errors.NoBody;
  }

  const accessToken = req.headers['x-access-token'] as string;
  const validation = validationSchema.safeParse(body);

  if (!validation.success) {
    return Errors.NoBody
  }

  const validateLensAccountStatus = await validateLensAccount(req);
  if (!validateLensAccountStatus) {
    return Errors.NoBody
  }

  const { buttonIndex, postUrl, pubId } =
    body as ExtensionRequest;

  try {
    const payload = parseJwt(accessToken);
    const { id } = payload;

    const request = {
      actionResponse: '',
      buttonIndex,
      inputText: '',
      profileId: id,
      pubId,
      specVersion: '1.0.0',
      state: '',
      url: postUrl
    };

    const signature = await signFrameAction(
      request,
      accessToken,
      IS_MAINNET ? 'mainnet' : 'testnet'
    );

    const trustedData = { messageBytes: signature?.signature };
    const untrustedData = {
      
      unixTimestamp: Math.floor(Date.now() / 1000),
      ...signature?.signedTypedData.value
    };

    const { data } = await axios.post(
      postUrl,
      {clientProtocol: 'lens@1.0.0', trustedData, untrustedData },
      { headers: { 'User-Agent': HEY_USER_AGENT } }
    );

    const { document } = parseHTML(data);

    logger.info(`Open frame button clicked by ${id} on ${postUrl}`);

    return res
      .status(200)
      .json({ frame: getFrame(document, postUrl), success: true });
  } catch (error) {
    return Errors.NoBody
  }
};

export default allowCors(handler);

