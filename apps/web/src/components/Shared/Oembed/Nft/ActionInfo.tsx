
import { DEFAULT_COLLECT_TOKEN, WMATIC_ADDRESS } from '@lensshare/data/constants';
import { Profile, useDefaultProfileQuery } from '@lensshare/lens';
import getProfile from '@lensshare/lib/getProfile';
import truncateByWords from '@lensshare/lib/truncateByWords';
import type { ActionData, UIData } from 'nft-openaction-kit';
import type { FC } from 'react';
import type { Address } from 'viem';
import {Image} from '@lensshare/ui'



interface ActionInfoProps {
  collectionName: string;
  uiData?: UIData;
}

const ActionInfo: FC<ActionInfoProps> = ({ collectionName, uiData }) => {
  return (
    <div className="flex items-center space-x-2">
      <Image
        alt={uiData?.platformName}
        className="w-5 h-5 rounded-full border bg-gray-200 dark:border-gray-700"
        height={20}
        loading="lazy"
        src={uiData?.platformLogoUrl}
        width={20}
      />
      <b className="text-sm">{truncateByWords(collectionName, 3)}</b>
    </div>
  );
};

export default ActionInfo;