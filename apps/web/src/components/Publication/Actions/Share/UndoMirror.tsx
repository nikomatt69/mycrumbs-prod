
import type { Dispatch, FC, SetStateAction } from 'react';

import { MenuItem } from '@headlessui/react';

import { toast } from 'react-hot-toast';
import { useAppStore } from 'src/store/persisted/useAppStore';
import { isMirrorPublication } from '@lensshare/lib/publicationHelpers';
import { useApolloClient } from '@lensshare/lens/apollo';
import { AnyPublication, useHidePublicationMutation } from '@lensshare/lens';
import errorToast from '@lib/errorToast';
import { Leafwatch } from '@lib/leafwatch';
import { Errors } from '@lensshare/data/errors';
import cn from '@lensshare/ui/cn';
import { ArrowsRightLeftIcon } from '@heroicons/react/24/outline';
import { PUBLICATION } from '@lensshare/data/tracking';


interface MirrorProps {
  isLoading: boolean;
  publication: AnyPublication;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
}

const UndoMirror: FC<MirrorProps> = ({
  isLoading,
  publication,
  setIsLoading
}) => {
  const { currentProfile } = useAppStore();
  const { cache } = useApolloClient();

  const targetPublication = isMirrorPublication(publication)
    ? publication?.mirrorOn
    : publication;

  const updateCache = () => {
    cache.modify({
      fields: { mirrors: () => targetPublication.stats.mirrors - 1 },
      id: cache.identify(targetPublication.stats)
    });
    cache.evict({
      id: `${publication?.__typename}:${publication?.id}`
    });
  };

  const onError = (error?: any) => {
    setIsLoading(false);
    errorToast(error);
  };

  const [hidePost] = useHidePublicationMutation({
    onCompleted: () => {
      Leafwatch.track(PUBLICATION.MIRROR);
      toast.success('Undone mirror successfully');
    },
    update: updateCache
  });

  const undoMirror = async () => {
    if (!currentProfile) {
      return toast.error(Errors.SignWallet);
    }

    try {
      setIsLoading(true);

      return await hidePost({
        variables: { request: { for: publication.id } }
      });
    } catch (error) {
      onError(error);
    }
  };

  return (
    <MenuItem
      as="div"
      className={({ focus }) =>
        cn(
          { 'dropdown-active': focus },
          'm-2 block cursor-pointer rounded-lg px-4 py-1.5 text-sm text-red-500'
        )
      }
      disabled={isLoading}
      onClick={undoMirror}
    >
      <div className="flex items-center space-x-2">
        <ArrowsRightLeftIcon className="w-4 h-4" />
        <div>Undo mirror</div>
      </div>
    </MenuItem>
  );
};

export default UndoMirror;
