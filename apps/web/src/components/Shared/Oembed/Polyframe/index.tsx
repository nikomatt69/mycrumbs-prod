
import type { PolymarketMarketData as IPolymarketMarketData, PolymarketMarketData } from '@lensshare/types/polymarket';

import type { FC } from 'react';

import { LinkIcon } from '@heroicons/react/24/outline';

import { Leafwatch } from '@lib/leafwatch';
import axios from 'axios';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import { Errors } from '@lensshare/data/errors';
import getAuthApiHeaders from '../Portal/getAuthApiHeaders main';
import stopEventPropagation from '@lensshare/lib/stopEventPropagation';
import { Button, Card } from '@lensshare/ui';
import { PUBLICATION } from '@lensshare/data/tracking';
import cn from '@lensshare/ui/cn';
import { useAppStore } from 'src/store/persisted/useAppStore';
import getPolymarket from 'src/utils/oembed/meta/getPolymarket';


interface FrameProps {
  frame: IPolymarketMarketData;
  publicationId?: string;
}

const Polyframe: FC<FrameProps> = ({ frame, publicationId }) => {
  const { currentProfile } = useAppStore();
  
  const [marketData, setMarketData] = useState<PolymarketMarketData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (frame) {
      setMarketData(frame);
    }
     else {
      toast.error(Errors.SomethingWentWrong);
    }
  }, [frame]);

  if (!marketData) {
    return null;
  }

  const { title, description, outcomes, imageUrl, buttons } = marketData;


  const onPost = async (index: number) => {
    if (!currentProfile) {
      return toast.error(Errors.SignWallet);
    }

    try {
      setIsLoading(true);

      // Example API call to post data
      const { data }: { data: { market: PolymarketMarketData } } = await axios.post(
        `/api/act`,
        { buttonIndex: index + 1 },
        { headers: { Authorization: `Bearer ${currentProfile}` } }
      );

      if (!data.market) {
        return toast.error(Errors.SomethingWentWrong);
      }

      return setMarketData(data.market);
    } catch {
      toast.error(Errors.SomethingWentWrong);
    } finally {
      setIsLoading(false);
    }
  };

  
    return (
      <Card className="mt-3" forceRounded>
        {imageUrl && (
          <img
            alt={title}
            className="object-fit h-[full] w-[full] rounded-t-xl"
            src={imageUrl}
          />
        )}
        <div className="p-5">
          <h2 className="text-xl font-bold">{title}</h2>
          <p className="text-gray-600">{description}</p>
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Outcomes</h3>
            <ul className="list-disc list-inside">
              {outcomes.map((outcome, index) => (
                <li key={index}>{outcome.name}: {outcome.price}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className={cn(
          buttons.length === 1 && 'grid-cols-1',
          buttons.length === 2 && 'grid-cols-2',
          buttons.length === 3 && 'grid-cols-3',
          buttons.length === 4 && 'grid-cols-2',
          'grid gap-4 p-5 dark:border-gray-700'
        )}>
          {buttons.map(({ action, button, target: outcome }, index) => (
            <Button
              className="justify-center"
              disabled={isLoading || !currentProfile}
              icon={
                (action === 'link' || action === 'post_redirect' || action === 'mint') &&
                <LinkIcon className="h-4 w-4" />
              }
              key={index}
              onClick={() => {
                if (action === 'link' || action === 'post_redirect' || action === 'mint') {
                  const outcomes = action === 'mint' ? outcome : outcome || '';
                  window.open(outcomes, '_blank');
                } else if (action === 'post') {
                  onPost(index);
                }
              }}
              outline
              size="md"
              type={action === 'post' || action === 'post_redirect' ? 'submit' : 'button'}
            >
              {button}
            </Button>
          ))}
        </div>
      </Card>
    );
  };
  
  export default Polyframe;