import type { Frame as IFrame } from '@lensshare/types/misc';
import type { FC } from 'react';

import { LinkIcon } from '@heroicons/react/24/outline';

import { HEY_API_URL } from '@lensshare/data/constants';

import { Button, Card } from '@lensshare/ui';
import cn from '@lensshare/ui/cn';
import axios from 'axios';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAppStore } from 'src/store/persisted/useAppStore';
import { Errors } from '@lensshare/data/errors';
import getAuthApiHeaders from '../Portal/getAuthApiHeaders main';
import stopEventPropagation from '@lensshare/lib/stopEventPropagation';


interface FrameProps {
  frame: IFrame;
  publicationId?: string;
}

const Frame: FC<FrameProps> = ({ frame, publicationId }) => {
  const { currentProfile } = useAppStore();
  const [frameData, setFrameData] = useState<IFrame | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (frame) {
      setFrameData(frame);
    }
  }, [frame]);

  if (!frameData) {
    return null;
  }

  const { buttons, frameUrl, image, postUrl } = frameData;

  const onPost = async (index: number) => {
    if (!currentProfile) {
      return toast.error(Errors.SignWallet);
    }

    try {
      setIsLoading(true);

      const { data }: { data: { frame: IFrame } } = await axios.post(
        `/api/frame/post`,
        {
          buttonIndex: index + 1,
         
          postUrl: buttons[index].target || buttons[index].postUrl || postUrl,
          pubId: publicationId
        },
        { headers: getAuthApiHeaders() }
      );

      if (!data.frame) {
        return toast.error(Errors.SomethingWentWrong);
      }

      return setFrameData(data.frame);
    } catch {
      toast.error(Errors.SomethingWentWrong);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mt-3" forceRounded onClick={stopEventPropagation}>
      <img
        alt={image}
        className="h-[350px] max-h-[350px] w-full rounded-t-xl object-cover"
        src={image}
      />
      <div
        className={cn(
          buttons.length === 1 && 'grid-cols-1',
          buttons.length === 2 && 'grid-cols-2',
          buttons.length === 3 && 'grid-cols-3',
          buttons.length === 4 && 'grid-cols-2',
          'grid gap-4 p-5 dark:border-gray-700'
        )}
      >
        {buttons.map(({ action, button, target }, index) => (
          <Button
            className="justify-center"
            disabled={isLoading || !publicationId || !currentProfile}
            icon={
              (action === 'link' ||
                action === 'post_redirect' ||
                action === 'mint') && <LinkIcon className="size-4" />
            }
            key={index}
            onClick={() => {
              // Leafwatch.track(PUBLICATION.CLICK_PORTAL_BUTTON, {
              //   action,
              //   publication_id: publicationId
              // });

              if (
                action === 'link' ||
                action === 'post_redirect' ||
                action === 'mint'
              ) {
                const url = action === 'mint' ? frameUrl : target || frameUrl;
                window.open(url, '_blank');
              } else if (action === 'post') {
                onPost(index);
              }
            }}
            outline
            size="lg"
            type={
              action === 'post' || action === 'post_redirect'
                ? 'submit'
                : 'button'
            }
          >
            {button}
          </Button>
        ))}
      </div>
    </Card>
  );
};

export default Frame;