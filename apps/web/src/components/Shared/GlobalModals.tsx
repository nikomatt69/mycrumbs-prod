import NewPublication from '@components/Composer/NewPublication';
import ReportPublication from '@components/Shared/Modal/ReportPublication';
import {
  ArrowRightCircleIcon,
  CircleStackIcon,
  ShieldCheckIcon,
  TicketIcon
} from '@heroicons/react/24/outline';
import { Modal } from '@lensshare/ui';
import type { FC } from 'react';

import Invites from './Modal/Invites';
import ReportProfile from './Modal/ReportProfile';
import SwitchProfiles from './SwitchProfiles';
import { useSignupStore } from './Auth/Signup';
import Auth from './Auth';
import WrongNetwork from './Auth/WrongNetwork';
import { usePublicationStore } from 'src/store/non-persisted/usePublicationStore';
import { useGlobalModalStateStore } from 'src/store/non-persisted/useGlobalModalStateStore';
import OptimisticTransactions from './Modal/OptimisticTransactions';
import GlobalModalsFromUrl from './GlobalModalsFromUrl';
import { useAccount } from 'wagmi';

const GlobalModals: FC = () => {
  const { address } = useAccount();
  // Report modal state
  const {
    showPublicationReportModal,
    reportingPublicationId,
    setShowPublicationReportModal,
    showProfileSwitchModal,
    setShowProfileSwitchModal,
    showNewPostModal,
    setShowNewPostModal,
    showAuthModal,
    setShowAuthModal,
    showWrongNetworkModal,
    setShowWrongNetworkModal,
    showInvitesModal,
    setShowInvitesModal,
    showReportProfileModal,
    reportingProfile,
    setShowReportProfileModal,
    setShowDiscardModal,
    showOptimisticTransactionsModal,
    setShowOptimisticTransactionsModal
  } = useGlobalModalStateStore();

  const {
    publicationContent,
    attachments,
    isUploading,
    videoDurationInSeconds,
    videoThumbnail,
    audioPublication,
    quotedPublication,
    showPollEditor,
    pollConfig,
    showMarketEditor,
    marketConfig
  } = usePublicationStore();
  const { authModalType } = useGlobalModalStateStore();
  const signupScreen = useSignupStore((state) => state.screen);

  const showSignupModalTitle = signupScreen === 'choose';
  const checkIfPublicationNotDrafted = () => {
    if (
      publicationContent === '' &&
      quotedPublication === null &&
      attachments.length === 0 &&
      audioPublication.title === '' &&
      videoThumbnail.url === '' &&
      videoDurationInSeconds === '' &&
      !showPollEditor &&
      !isUploading &&
      pollConfig.options[0] === ''
    ) {
      return true;
    }
    return false;
  };

  return (
    <>
    <GlobalModalsFromUrl />
      <Modal
        title="Report Publication"
        icon={<ShieldCheckIcon className="text-brand h-5 w-5" />}
        show={showPublicationReportModal}
        onClose={() =>
          setShowPublicationReportModal(false, reportingPublicationId)
        }
      >
        <ReportPublication publication={reportingPublicationId} />
      </Modal>
      <Modal
        title="Report profile"
        icon={<ShieldCheckIcon className="text-brand h-5 w-5" />}
        show={showReportProfileModal}
        onClose={() => setShowReportProfileModal(false, reportingProfile)}
      >
        <ReportProfile profile={reportingProfile} />
      </Modal>
      <Modal
        onClose={() => setShowProfileSwitchModal(false)}
        show={showProfileSwitchModal}
        size={!address ? 'sm' : 'xs'}
        title="Switch Profile"
      >
        <SwitchProfiles />
      </Modal>
      <Modal
        icon={<ArrowRightCircleIcon className="text-brand-500 h-5 w-5" />}
        onClose={() => setShowAuthModal(false, authModalType)}
        show={showAuthModal}
        title={
          showSignupModalTitle
            ? authModalType === 'signup'
              ? 'Signup'
              : 'Login'
            : null
        }
      >
        <Auth />
      </Modal>
      <Modal
        title="Wrong Network"
        show={showWrongNetworkModal}
        onClose={() => setShowWrongNetworkModal(false)}
      >
        <WrongNetwork />
      </Modal>
      <Modal
        title="Create post"
        size="md"
        show={showNewPostModal}
        onClose={() => {
          if (checkIfPublicationNotDrafted()) {
            setShowNewPostModal(false);
          } else {
            setShowDiscardModal(true);
          }
        }}
      >
        <NewPublication />
      </Modal>
      <Modal
        title="Invites"
        icon={<TicketIcon className="text-brand h-5 w-5" />}
        show={showInvitesModal}
        onClose={() => setShowInvitesModal(false)}
      >
        <Invites />
      </Modal>
      <Modal
        icon={<CircleStackIcon className="w-5 h-5" />}
        onClose={() => setShowOptimisticTransactionsModal(false)}
        show={showOptimisticTransactionsModal}
        title="Optimistic Transactions"
      >
        <OptimisticTransactions />
      </Modal>
    </>
  );
};

export default GlobalModals;
