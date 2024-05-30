import type { EasPoll } from '@lensshare/types/hey';
import type { TokenInfo } from '@lib/getToken';
import type { FC } from 'react';


import {
  IdentificationIcon,
  LockClosedIcon,
  LockOpenIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import {
  Bars3BottomLeftIcon,
  CheckCircleIcon
} from '@heroicons/react/24/solid';
import { Errors } from '@lensshare/data/errors';
import { HEY_API_URL, ZERO_ADDRESS } from '@lensshare/data/constants';
import { PUBLICATION } from '@lensshare/data/tracking';
import {
  type Profile,
  type UnknownOpenActionModuleSettings,
  useProfileQuery
} from '@lensshare/lens';
import getTimetoNow from '@lensshare/lib/datetime/getTimetoNow';
import humanize from '@lensshare/lib/humanize';
import stopEventPropagation from '@lensshare/lib/stopEventPropagation';
import { Card, Spinner, Tooltip } from '@lensshare/ui';
import cn from '@lensshare/ui/cn';

import getBalanceForToken from '@lib/getBalanceForToken';
import getToken from '@lib/getToken';
import { Leafwatch } from '@lib/leafwatch';
import axios from 'axios';
import plur from 'plur';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import useActOnUnknownOpenAction from 'src/hooks/useActOnUnknownOpenAction';
import { encodeAbiParameters, formatUnits } from 'viem';
import { useAccount } from 'wagmi';

import { useProfileRestriction } from '../../../../store/non-persisted/useProfileRestriction';

import getAuthApiHeaders from '@components/Shared/Oembed/Portal/getAuthApiHeaders main';
import { useAppStore } from 'src/store/persisted/useAppStore';


interface ChoicesProps {
  module: UnknownOpenActionModuleSettings;
  poll: EasPoll;
  refetch?: () => void;
}

const Choices: FC<ChoicesProps> = ({ module, poll, refetch }) => {
  const { address: account } = useAccount();
  const {currentProfile} = useAppStore();
  const { isSuspended } = useProfileRestriction();
  const [pollSubmitting, setPollSubmitting] = useState(false);
  const [votingEnabled, setVotingEnabled] = useState(true);
  const [tokenGated, setTokenGated] = useState(false);
  const [followRequired, setFollowRequired] = useState(false);
  const [selectedOption, setSelectedOption] = useState<null | number>(null);
  const [gatedTokenInfo, setGatedTokenInfo] = useState<null | TokenInfo>(null);

  const {
    endsAt,
    followersOnly,
    gateParams,
    options,
    publicationId,
    signatureRequired
  } = poll;
  const totalResponses = options.reduce((acc, { responses }) => {
    return acc + responses;
  }, 0);

  const { data } = useProfileQuery({
    variables: {
      request: {
        forProfileId: publicationId.split('-')[0]
      }
    }
  });

  const publicationProfile = data?.profile as Profile;

  const getVoteForCurrentProfile = () =>
    axios.get(`/api/polls/eas/vote/get`, {
      headers: getAuthApiHeaders(),
      params: {
        actorProfileId: currentProfile?.id,
        publicationId: publicationId
      }
    });

  const pollForIndexing = async () => {
    const maxRetries = 10;
    let retryCount = 0;

    const checkIndexed = async () => {
      try {
        const response = await getVoteForCurrentProfile();
        if (response.data) {
          refetch?.();
          setPollSubmitting(false);
        }
      } catch (error) {
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(checkIndexed, Math.pow(1.5, retryCount) * 1000); // exponential backoff
        }
      }
    };

    await checkIndexed();
  };

  const { actOnUnknownOpenAction } = useActOnUnknownOpenAction({
    errorCallback: () => setPollSubmitting(false),
    signlessApproved: module.signlessApproved,
    successCallback: pollForIndexing,
    successToast: 'Your vote has been cast!'
  });

  useEffect(() => {
    const onGateParamsUpdate = async () => {
      if (gateParams) {
        await getToken(gateParams.tokenAddress).then((tokenInfo) => {
          if (tokenInfo) {
            setGatedTokenInfo(tokenInfo);
          }
        });

        const balance = await getBalanceForToken(
          gateParams.tokenAddress,
          account ?? currentProfile?.ownedBy.address
        );
        if (parseInt(balance) < parseInt(gateParams.minThreshold)) {
          if (!tokenGated) {
            setTokenGated(true);
          }
          return;
        }
      }
    };

    onGateParamsUpdate();
  }, [account, gateParams, currentProfile, tokenGated]);

  useEffect(() => {
    const voted = options.some((option) => option.voted);
    const ended = endsAt && new Date(endsAt) < new Date();

    if ((voted || ended) && votingEnabled) {
      setVotingEnabled(false);
    }
  }, [
    currentProfile,
    poll,
    publicationProfile,
    votingEnabled,
    endsAt,
    options
  ]);

  useEffect(() => {
    if (followersOnly) {
      const followedByMe =
        publicationProfile?.operations?.isFollowedByMe?.value ?? false;
      const newFollowRequired =
        !followedByMe || publicationProfile?.id !== currentProfile?.id;
      if (newFollowRequired !== followRequired) {
        setFollowRequired(newFollowRequired);
      }
    }
  }, [followersOnly, publicationProfile, currentProfile, followRequired]);

  const votePoll = async (index: number) => {
    if (!currentProfile) {
      return toast.error(Errors.SignWallet);
    }


    try {
      const data = encodeAbiParameters(
        [
          {
            components: [
              { name: 'publicationProfileId', type: 'uint256' },
              { name: 'publicationId', type: 'uint256' },
              { name: 'actorProfileId', type: 'uint256' },
              { name: 'actorProfileOwner', type: 'address' },
              { name: 'transactionExecutor', type: 'address' },
              { name: 'optionIndex', type: 'uint8' },
              { name: 'timestamp', type: 'uint40' }
            ],
            name: 'vote',
            type: 'tuple'
          }
        ],
        [
          {
            actorProfileId: 0n,
            actorProfileOwner: ZERO_ADDRESS,
            optionIndex: index,
            publicationId: 0n,
            publicationProfileId: 0n,
            timestamp: 0,
            transactionExecutor: ZERO_ADDRESS
          }
        ]
      );

      setPollSubmitting(true);
      setSelectedOption(index);

      await actOnUnknownOpenAction({
        address: module.contract.address,
        data,
        publicationId
      });

      Leafwatch.track(PUBLICATION.WIDGET.SNAPSHOT.VOTE, {
        poll_id: publicationId
      });
    } catch {
      toast.error(Errors.SomethingWentWrong);
      setPollSubmitting(false);
    }
  };

  return (
    <Card className="mt-3" onClick={stopEventPropagation}>
      <div className="space-y-1 p-3">
        {options.map(({ index, option, percentage, voted }) => (
          <button
            className="flex w-full items-center space-x-2.5 rounded-xl p-2 text-xs enabled:hover:bg-gray-100 disabled:cursor-not-allowed sm:text-sm enabled:dark:hover:bg-gray-900"
            disabled={pollSubmitting || !votingEnabled}
            key={index}
            onClick={() => votePoll(index)}
            type="button"
          >
            {pollSubmitting && index === selectedOption ? (
              <Spinner className="mr-1" size="sm" />
            ) : (
              <CheckCircleIcon
                className={cn(
                  voted ? 'text-green-500' : 'text-gray-500',
                  'w-6 h-6 '
                )}
              />
            )}
            <div className="w-full space-y-1">
              <div className="flex items-center justify-between">
                <b>{option}</b>
                <div>
                  <span className="ld-text-gray-500">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="flex h-2.5 overflow-hidden rounded-full bg-gray-300 dark:bg-gray-800">
                <div
                  className={cn(voted ? 'bg-green-500' : 'bg-brand-500')}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between border-t px-5 py-3 dark:border-gray-700 ">
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <Bars3BottomLeftIcon className="w-4 h-4" />
          <span>
            {humanize(totalResponses || 0)} {plur('vote', totalResponses || 0)}
          </span>
          {endsAt && (
            <>
              <span>·</span>
              {new Date(endsAt) > new Date() ? (
                <span>{getTimetoNow(new Date(endsAt))} left</span>
              ) : (
                <span>Poll ended</span>
              )}
            </>
          )}
        </div>
        <div className="flex gap-3 text-gray-500">
          {signatureRequired && (
            <Tooltip
              content="Signature required (not supported)"
              placement="top"
            >
              <IdentificationIcon className="w-4 h-4" />
            </Tooltip>
          )}
          {gatedTokenInfo && gateParams && (
            <Tooltip
              content={`Requires holding ${gatedTokenInfo.decimals ? formatUnits(BigInt(gateParams.minThreshold), gatedTokenInfo.decimals) + ' $' + gatedTokenInfo.symbol : gateParams.minThreshold + ' ' + gatedTokenInfo?.name}`}
              placement="top"
            >
              {tokenGated ? (
                <LockClosedIcon className="w-4 h-4" />
              ) : (
                <LockOpenIcon className="w-4 h-4" />
              )}
            </Tooltip>
          )}
          {followersOnly && (
            <Tooltip content="Followers only" placement="top">
              <UserGroupIcon className="w-4 h-4" />
            </Tooltip>
          )}
          <Tooltip
            content="Smart Polls are onchain and powered by Open Actions"
            placement="top"
            withDelay={true}
          >
            <div title={'Smart Poll'} />
          </Tooltip>
        </div>
      </div>
    </Card>
  );
};

export default Choices;
