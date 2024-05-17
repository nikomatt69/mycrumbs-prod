


import { NodeIrys } from '@irys/sdk';
import { signMetadata } from '@lens-protocol/metadata';
import { privateKeyToAccount } from 'viem/accounts';
import { NextApiRequest, NextApiResponse } from 'next';
import logger from '@lensshare/lib/logger';
import allowCors from 'src/utils/allowCors';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { body } = req;

  if (!body) {
    return body(res);
  }

  try {
    const url = 'https://arweave.mainnet.irys.xyz/tx/matic';
    const token = 'matic';
    const client = new NodeIrys({
      key: process.env.NEXT_PUBLIC_PRIVATE_KEY || '',
      token,
      url
    });

    const account = privateKeyToAccount(`0x${process.env.PRIVATE_KEY}`);
    const signed = await signMetadata(body, (message) =>
      account.signMessage({ message })
    );

    const receipt = await client.upload(JSON.stringify(signed), {
      tags: [
        { name: 'content-type', value: 'application/json' },
        { name: 'App-Name', value: 'MyCrumbs' }
      ]
    });

    logger.info(`Uploaded metadata to Irys: ar://${receipt.id}`);

    return res.status(200).json({ id: receipt.id, success: true });
  } catch (error) {
    console.error(error); // Log the error instead of throwing it
    return res
      .status(500)
      .json({ success: false, error: 'Internal Server Error' });
  }
};

export default allowCors(handler);