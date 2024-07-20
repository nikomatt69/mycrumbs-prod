import type { FC } from 'react';

import { Bars3BottomLeftIcon } from '@heroicons/react/24/solid';

import { motion } from 'framer-motion';
import { usePublicationStore } from 'src/store/non-persisted/usePublicationStore';
import { Tooltip } from '@lensshare/ui';


const PollSettings: FC = () => {
  const { resetPollConfig, setShowPollEditor, showPollEditor } =
    usePublicationStore();

  return (
    <Tooltip content="Poll" placement="top">
      <motion.button
        aria-label="Poll"
        className="rounded-full outline-offset-8"
        onClick={() => {
          resetPollConfig();
          setShowPollEditor(!showPollEditor);
        }}
        type="button"
        whileTap={{ scale: 0.9 }}
      >
        <Bars3BottomLeftIcon className="w-5 h-5 text-brand" />
      </motion.button>
    </Tooltip>
  );
};

export default PollSettings;
