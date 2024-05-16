import React, { createContext, FC, useContext, ReactNode } from 'react';
import { initWeb3InboxClient,
  usePrepareRegistration,
  useRegister,
  useSubscribe,
  useSubscription,
  useUnsubscribe,
  useWeb3InboxAccount,
  useWeb3InboxClient
} from "@web3inbox/react";
import { useSignMessage, useAccount } from 'wagmi';

// The project ID and domain you setup in the Domain Setup section
const projectId = '8974231b47453a6cae531515ed1787c7';
const appDomain = 'mycrumbs.xyz';

initWeb3InboxClient({
  projectId,
  domain: appDomain,
  allApps: process.env.NODE_ENV !== "production",
});

interface NotificationsContextProps {
  w3iClientIsLoading: boolean;
  handleRegistration: () => Promise<void>;
  isRegistered: boolean;
  subscribe: () => void;
  unsubscribe: () => void;
  isSubscribing: boolean;
  isUnsubscribing: boolean;
  isSubscribed: boolean;
}

const NotificationsContext = createContext<NotificationsContextProps | null>(null);

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};

interface Web3ProviderProps {
  children: ReactNode;
}

const NotificationsProvider: FC<Web3ProviderProps> = ({ children }) => {
  // Wagmi Hooks
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();

  // W3I Hooks
  const { prepareRegistration } = usePrepareRegistration();
  const { register, isLoading: isRegistering } = useRegister();
  const { data: w3iClient, isLoading: w3iClientIsLoading } = useWeb3InboxClient();
  const caip10Account = "eip155:1:" + address;
  const { isRegistered } = useWeb3InboxAccount(caip10Account);

  // Registration of your address to allow notifications
  // This is done via a signature of a message (SIWE) and the
  // signMessageAsync function from wagmi
  const handleRegistration = async () => {
    try {
      const { message, registerParams } = await prepareRegistration();
      const signature = await signMessageAsync({ message });
      await register({ registerParams, signature });
    } catch (registerIdentityError: any) {
      console.error(registerIdentityError);
    }
  };

  // Subscription to dapp notifications
  // Subscribe can be called as a function post registration
  // Can be moved above but shown for example clarity
  const { subscribe, isLoading: isSubscribing } = useSubscribe();
  const { unsubscribe, isLoading: isUnsubscribing } = useUnsubscribe();
  const { data: subscription } = useSubscription();
  const isSubscribed = Boolean(subscription);

  return (
    <NotificationsContext.Provider value={{
      w3iClientIsLoading,
      handleRegistration,
      isRegistered,
      subscribe,
      unsubscribe,
      isSubscribing,
      isUnsubscribing,
      isSubscribed
    }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export default NotificationsProvider;