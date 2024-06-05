/* eslint-disable @typescript-eslint/no-unused-vars */

import type { FC } from 'react';
import React, { createRef, useState } from 'react';
import { useAppStore } from 'src/store/persisted/useAppStore';

import SpaceWindowHeader from './SpaceWindowHeader';
import type { HTMLAudioElementWithSetSinkId } from './SpacesTypes';
import Meet from '@components/Meet/Meet';
import { DynamicIsland, FamilyDrawer } from '@lensshare/ui';

import { useAppUtils } from '@huddle01/react/app-utils';
import toast from 'react-hot-toast';
import Lobby from '@components/Meet';

const SpacesWindow: FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
 

  
 
  return (
    <div className="fixed inset-0 bottom-14 top-auto z-[100] mx-auto flex h-fit w-screen grow rounded-xl xl:bottom-14">
      
        <div className="absolute bottom-0 space-x-auto mx-auto rounded-xl  border-[1.5px] border-gray-300 bg-white p-2 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex justify-center" />
          <SpaceWindowHeader
            isExpanded={isExpanded}
            setIsExpanded={setIsExpanded}
          />
          <div className="min-w-[22rem]">
            {isExpanded ? <FamilyDrawer/>:null}
          </div>
        </div>
    
    </div>
  );
};

export default SpacesWindow;
