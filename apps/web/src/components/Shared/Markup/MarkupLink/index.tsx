import type { MarkupLinkProps } from '@lensshare/types/misc';

import ExternalLink from './ExternalLink';
import Hashtag from './Hashtag';
import Mention from './Mention';
import Club from './Club';

const MarkupLink = ({ title, mentions }: MarkupLinkProps) => {
  if (!title) {
    return null;
  }

  if (title.startsWith('@')) {
    if (title.startsWith('@club/')) {
      return <Club title={title} />;
    }

    return <Mention mentions={mentions} title={title} />;
  }

  if (title.startsWith('#')) {
    return <Hashtag title={title} />;
  }

  return <ExternalLink title={title} />;
};

export default MarkupLink;
