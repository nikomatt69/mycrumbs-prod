
import type { Dispatch, FC, SetStateAction } from 'react';
import React, { useState } from 'react';

import {
  ChevronDownIcon,
  ChevronUpIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';

import toast from 'react-hot-toast';

import stopEventPropagation from '@lensshare/lib/stopEventPropagation';
import imageKit from '@lensshare/lib/imageKit';
import { STATIC_ASSETS_URL } from '@lensshare/data/constants';

interface SpacesWindowProps {
  isExpanded?: boolean;
  setIsExpanded: Dispatch<SetStateAction<boolean>>;
}

const SpaceWindowHeader: FC<SpacesWindowProps> = ({
  isExpanded,
  setIsExpanded
}) => {
  
  const [micDevices, setMicDevices] = useState<MediaDeviceInfo[]>([]);
  const [speakerDevices, setSpeakerDevices] = useState<MediaDeviceInfo[]>([]);

  return (
    <div className="border-0 border-gray-300 border-0 dark:border-gray-700">
      <div className="flex items-center  border-0 justify-between">
        <div className="flex items-center border-0 gap-1">
          {isExpanded ? (
            <ChevronDownIcon
              className="h-5 w-5"
              onClick={() => setIsExpanded((prev) => !prev)}
            />
          ) : (
            <ChevronUpIcon
              className="h-5 w-5"
              onClick={() => setIsExpanded((prev) => !prev)}
            />
          )}
          {!isExpanded  && (
            <div className=" flex text-sm font-medium border-0 text-gray-900  dark:text-gray-300">
              <img
                src={imageKit(`${STATIC_ASSETS_URL}/images/icon.png`)}
                draggable={false}
                className="h-6 w-6 "
                alt="lensshare"
              />{' '}
              <p className="">Space</p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <ClipboardDocumentIcon
            className="h-5 w-5"
            onClick={async (event) => {
              stopEventPropagation(event);
              await navigator.clipboard.writeText(`${location}`);
              toast.success(`Copied to clipboard!`);
            }}
          />

          
        </div>
      </div>
    </div>
  );
};

export default SpaceWindowHeader;
