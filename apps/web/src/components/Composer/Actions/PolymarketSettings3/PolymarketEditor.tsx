import type { FC, Key } from 'react';
import { useState } from 'react';
import { ClockIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Bars3BottomLeftIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { Button, Card, Input, Modal, Tooltip } from '@lensshare/ui';
import { usePublicationStore } from 'src/store/non-persisted/usePublicationStore';
import { useOpenActionStore } from 'src/store/non-persisted/useOpenActionStore';
import { VerifiedOpenActionModules } from '@lensshare/data/verified-openaction-modules';
import { ZERO_ADDRESS } from '@lensshare/data/constants';
import plur from 'plur';

const PolymarketEditor: FC = () => {
  const { marketConfig, resetMarketConfig, setMarketConfig, setShowMarketEditor } = usePublicationStore();
  const [showMarketLengthModal, setShowMarketLengthModal] = useState(false);
  const { setOpenAction } = useOpenActionStore();

  return (
    <Card className="m-5 px-5 py-3" forceRounded>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm">
          <Bars3BottomLeftIcon className="text-brand-500 w-4 h-4" />
          <b>Polymarket</b>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            icon={<ClockIcon className="w-4 h-4" />}
            onClick={() => setShowMarketLengthModal(true)}
            outline
            size="sm"
            variant="primary"
          >
            {marketConfig.endTime} {plur('day', marketConfig.endTime)}
          </Button>
          <Modal
            icon={<ClockIcon className="text-brand-500 w-5 h-5" />}
            onClose={() => setShowMarketLengthModal(false)}
            show={showMarketLengthModal}
            title="Market length"
          >
            <div className="p-5">
              <Input
                label="Market length (days)"
                max={30}
                min={1}
                onChange={(e) =>
                  setMarketConfig({
                    ...marketConfig,
                    endTime: Number(e.target.value)
                  })
                }
                type="number"
                value={marketConfig.endTime}
              />
              <div className="mt-5 flex space-x-2">
                <Button
                  className="ml-auto"
                  onClick={() => {
                    setMarketConfig({ ...marketConfig, endTime: 7 });
                    setShowMarketLengthModal(false);
                  }}
                  outline
                  variant="danger"
                >
                  Cancel
                </Button>
                <Button
                  className="ml-auto"
                  onClick={() => setShowMarketLengthModal(false)}
                  variant="primary"
                >
                  Save
                </Button>
              </div>
            </div>
          </Modal>
          <Tooltip content="Delete" placement="top">
            <button
              className="flex"
              onClick={() => {
                resetMarketConfig();
                setShowMarketEditor(false);
              }}
              type="button"
            >
              <XCircleIcon className="w-5 h-5 text-red-400" />
            </button>
          </Tooltip>
        </div>
      </div>
      <div className="mt-3 space-y-2">
        {marketConfig.outcomes.map((outcome, index) => (
          <div className="flex items-center space-x-2 text-sm" key={index}>
            <Input
              iconRight={
                index > 1 ? (
                  <button
                    className="flex"
                    onClick={() => {
                      const newOptions = [...marketConfig.outcomes];
                      newOptions.splice(index, 1);
                      setMarketConfig({ ...marketConfig, outcomes: newOptions });
                    }}
                    type="button"
                  >
                    <XMarkIcon className="w-5 h-5 text-red-500" />
                  </button>
                ) : null
              }
              onChange={(event) => {
                const newOptions = [...marketConfig.outcomes];
                newOptions[index] = event.target.value;
                setMarketConfig({ ...marketConfig, outcomes: newOptions });
              }}
              placeholder={`Choice ${index + 1}`}
              value={outcome}
            />
          </div>
        ))}
        {marketConfig.outcomes.length !== 4 ? (
          <button
            className="text-brand-500 mt-2 flex items-center space-x-2 text-sm"
            onClick={() => {
              const newOptions = [...marketConfig.outcomes];
              newOptions.push('');
              setMarketConfig({ ...marketConfig, outcomes: newOptions });
            }}
            type="button"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Add another option</span>
          </button>
        ) : null}
      </div>
    </Card>
  );
};

export default PolymarketEditor;