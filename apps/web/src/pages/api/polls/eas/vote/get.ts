import type { EasVote } from '@lensshare/types/hey';
import type { AxiosResponse } from 'axios';
import type { Handler } from 'express';

import { EasPollActionModule } from '@lensshare/abis/EasPollActionModule';
import EasEndpoint from '@lensshare/data/eas-endpoint';
import { VerifiedOpenActionModules } from '@lensshare/data/verified-openaction-modules';
import logger from '@lensshare/lib/logger';
import axios from 'axios';
import {
  createPublicClient,
  decodeAbiParameters,
  encodeAbiParameters,
  http
} from 'viem';
import { polygon, polygonMumbai } from 'viem/chains';
import { Errors } from 'src/enums';
import { RPC_URL } from '@lensshare/data/constants';
import { NextApiRequest, NextApiResponse } from 'next';
import allowCors from 'src/utils/allowCors';

interface Attestation {
  attester: string;
  data: `0x${string}`;
  id: string;
  revoked: boolean;
}

interface AttestationsData {
  data: {
    attestations: Attestation[];
  };
}

export type VoteAttestation = {
  attester: string;
  data: EasVote;
  id: string;
  revoked: boolean;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { actorProfileId, publicationId } = req.query;

  if (
    !publicationId ||
    typeof publicationId !== 'string' ||
    !actorProfileId ||
    typeof actorProfileId !== 'string'
  ) {
    return Errors.NoBody;
  }

  const network = req.headers['x-lens-network'] as string;
  const isMainnet = network === 'mainnet';

  try {
    const client = createPublicClient({
      chain: isMainnet ? polygon : polygon,
      transport: http(RPC_URL)
    });

    const schemaId: any = await client.readContract({
      abi: EasPollActionModule,
      address: VerifiedOpenActionModules.Poll as `0x${string}`,
      functionName: 'schemaUid'
    });

    const profileId = BigInt(publicationId.split('-')[0]);
    const pubId = BigInt(publicationId.split('-')[1]);
    const data = encodeAbiParameters(
      [
        { name: 'publicationProfileId', type: 'uint256' },
        { name: 'publicationId', type: 'uint256' },
        { name: 'actorProfileId', type: 'uint256' }
      ],
      [profileId, pubId, BigInt(actorProfileId)]
    );

    const getVoteRes: AxiosResponse<AttestationsData> = await axios.post(
      isMainnet ? EasEndpoint.Mainnet : EasEndpoint.Testnet,
      {
        query: `
          query GetVote($schemaId: String!, $data: String!) {
            attestations(
              where: {schemaId: {equals: $schemaId}, data: {startsWith: $data}}
            ) {
              attester
              id
              revoked
              data
            }
          }
          `,
        variables: { data, schemaId }
      }
    );

    const { attestations } = getVoteRes.data.data;

    if (attestations.length === 0) {
      logger.info('No vote found');
      return res.status(404).json({ error: 'Record not found' });
    }

    const decodedData = decodeAbiParameters(
      [
        { name: 'publicationProfileId', type: 'uint256' },
        { name: 'publicationId', type: 'uint256' },
        { name: 'actorProfileId', type: 'uint256' },
        { name: 'actorProfileOwner', type: 'address' },
        { name: 'transactionExecutor', type: 'address' },
        { name: 'optionIndex', type: 'uint8' },
        { name: 'timestamp', type: 'uint40' }
      ],
      attestations[0].data
    );

    const vote: EasVote = {
      actorProfileId: '0x' + decodedData[2].toString(16),
      actorProfileOwner: decodedData[3] as `0x${string}`,
      optionIndex: decodedData[5],
      publicationId:
        '0x' +
        decodedData[0].toString(16) +
        '-' +
        '0x' +
        decodedData[1].toString(16),
      timestamp: decodedData[6],
      transactionExecutor: decodedData[4] as `0x${string}`
    };

    const attestation: VoteAttestation = {
      attester: attestations[0].attester,
      data: vote,
      id: attestations[0].id,
      revoked: attestations[0].revoked
    };

    logger.info('Vote fetched');

    return res.status(200).json({ result: attestation, success: true });
  } catch (error) {
    return (error);
  }
};

export default allowCors(handler);
