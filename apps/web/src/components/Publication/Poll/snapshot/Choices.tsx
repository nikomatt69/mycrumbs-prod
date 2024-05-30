import type { SnapshotPoll } from '@lensshare/types/hey';
import type { FC } from 'react';

import Beta from '@components/Shared/Badges/Beta';
import {
  Bars3BottomLeftIcon,
  CheckCircleIcon
} from '@heroicons/react/24/solid';
import { HEY_API_URL } from '@lensshare/data/constants';
import { Errors } from '@lensshare/data/errors';
import { PUBLICATION } from '@lensshare/data/tracking';
import getTimetoNow from '@lensshare/lib/datetime/getTimetoNow';
import humanize from '@lensshare/lib/humanize';
import stopEventPropagation from '@lensshare/lib/stopEventPropagation';
import { Card, Spinner } from '@lensshare/ui';
import cn from '@lensshare/ui/cn';
import getAuthApiHeaders from '@components/Shared/Oembed/Portal/getAuthApiHeaders main';
import { Leafwatch } from '@lib/leafwatch';
import axios from 'axios';
import plur from 'plur';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

import { useProfileRestriction } from '../../../../store/non-persisted/useProfileRestriction';
import { useAppStore } from 'src/store/persisted/useAppStore';


interface ChoicesProps {
  poll: SnapshotPoll;
  refetch?: () => void;
}

const Choices: FC<ChoicesProps> = ({ poll, refetch }) => {
  const {currentProfile} = useAppStore();

  const [pollSubmitting, setPollSubmitting] = useState(false);
  const [selectedOption, setSelectedOption] = useState<null | string>(null);

  const { endsAt, options } = poll;
  const totalResponses = options.reduce((acc, { responses }) => {
    return acc + responses;
  }, 0);

  const votePoll = async (id: string) => {
    if (!currentProfile) {
      return toast.error(Errors.SignWallet);
    }

  

    try {
      setPollSubmitting(true);
      setSelectedOption(id);

      await axios.post(
        `/api/polls/snapshot/act`,
        { option: id, poll: poll.id },
        { headers: getAuthApiHeaders() }
      );

      refetch?.();
      Leafwatch.track(PUBLICATION.WIDGET.SNAPSHOT.VOTE, { poll_id: id });
      toast.success('Your poll has been casted!');
    } catch {
      toast.error(Errors.SomethingWentWrong);
    } finally {
      setPollSubmitting(false);
    }
  };

  return (
    <Card className="mt-3" onClick={stopEventPropagation}>
      <div className="space-y-1 p-3">
        {options.map(({ id, option, percentage, voted }) => (
          <button
            className="flex w-full items-center space-x-2.5 rounded-xl p-2 text-xs hover:bg-gray-100 sm:text-sm dark:hover:bg-gray-900"
            disabled={pollSubmitting}
            key={id}
            onClick={() => votePoll(id)}
            type="button"
          >
            {pollSubmitting && id === selectedOption ? (
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
          <span>·</span>
          {new Date(endsAt) > new Date() ? (
            <span>{getTimetoNow(new Date(endsAt))} left</span>
          ) : (
            <span>Poll ended</span>
          )}
        </div>
        <Beta />
      </div>
    </Card>
  );
};

export default Choices;
