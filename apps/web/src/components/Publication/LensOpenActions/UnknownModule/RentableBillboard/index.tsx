import type {
  AnyPublication,
  MirrorablePublication,
  UnknownOpenActionModuleSettings
} from '@lensshare/lens';
import type { FC } from 'react';


import { Button, Card } from '@lensshare/ui';
import stopEventPropagation from '@lensshare/lib/stopEventPropagation';

interface RentableBillboardOpenActionProps {
  module: UnknownOpenActionModuleSettings;
  publication?: AnyPublication | MirrorablePublication;
}

const RentableBillboardOpenAction: FC<RentableBillboardOpenActionProps> = ({
  module,
  publication
}) => {
  return (
    <Card
      className="space-y-4 p-10 text-center"
      forceRounded
      onClick={stopEventPropagation}
    >
      <div>
        <b>
          This post space is available for rent! Rent now to promote your post.
        </b>
      </div>
      <Button>Rent now</Button>
    </Card>
  );
};

export default RentableBillboardOpenAction;
