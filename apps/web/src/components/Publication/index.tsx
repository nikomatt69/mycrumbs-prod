import Feed from '@components/Comment/Feed';
import NoneRelevantFeed from '@components/Comment/NoneRelevantFeed';
import MetaTags from '@components/Common/MetaTags';
import NewPublication from '@components/Composer/NewPublication';
import CommentWarning from '@components/Shared/CommentWarning';
import Footer from '@components/Shared/Footer';
import UserProfile from '@components/Shared/UserProfile';
import { APP_NAME } from '@lensshare/data/constants';
import type { AnyPublication } from '@lensshare/lens';
import { TriStateValue, usePublicationQuery } from '@lensshare/lens';
import getProfile from '@lensshare/lib/getProfile';
import { isMirrorPublication } from '@lensshare/lib/publicationHelpers';
import { Card, GridItemEight, GridItemFour, GridLayout } from '@lensshare/ui';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import Custom404 from 'src/pages/404';
import Custom500 from 'src/pages/500';
import { useAppStore } from 'src/store/persisted/useAppStore';

import FullPublication from './FullPublication';
import OnchainMeta from './OnchainMeta';
import RelevantPeople from './RelevantPeople';
import PublicationPageShimmer from './Shimmer';
import { useGlobalModalStateStore } from 'src/store/non-persisted/useGlobalModalStateStore';

const ViewPublication: NextPage = () => {
  const { currentProfile } = useAppStore();

  const { showNewPostModal } = useGlobalModalStateStore();

  const {
    query: { id },
    isReady
  } = useRouter();

  const { data, loading, error } = usePublicationQuery({
    variables: { request: { forId: id } },
    skip: !id
  });

  if (!isReady || loading) {
    return <PublicationPageShimmer />;
  }

  if (!data?.publication) {
    return <Custom404 />;
  }

  if (error) {
    return <Custom500 />;
  }

  const publication = data?.publication as AnyPublication;
  const targetPublication = isMirrorPublication(publication)
    ? publication.mirrorOn
    : publication;
  const canComment =
    targetPublication?.operations.canComment === TriStateValue.Yes;

  return (
    <GridLayout>
      <MetaTags
        title={`${publication.__typename} by ${
          getProfile(publication.by).slugWithPrefix
        } • ${APP_NAME}`}
      />
      <GridItemEight className="space-y-5">
        <Card>
          <FullPublication publication={publication} key={publication?.id} />
        </Card>
        {currentProfile && !publication.isHidden && !showNewPostModal ? (
          canComment ? (
            <NewPublication publication={publication} />
          ) : (
            <CommentWarning />
          )
        ) : null}
        <Feed publication={publication} />
        <NoneRelevantFeed publication={publication} />
      </GridItemEight>
      <GridItemFour className="space-y-5">
        <Card as="aside" className="p-5">
          <UserProfile profile={targetPublication.by} showBio />
        </Card>
        <RelevantPeople publication={publication} />
        <OnchainMeta publication={publication} />

        <Footer />
      </GridItemFour>
    </GridLayout>
  );
};

export default ViewPublication;
