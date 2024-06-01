import type {
  AmountInput,
  CollectOpenActionModuleType,
  RecipientDataInput
} from '@lensshare/lens';
import type { Database } from './database.types';

export type Group = Database['public']['Tables']['groups']['Row'];

export type StaffPick = Database['public']['Tables']['staff-picks']['Row'];

export type Group = {
  avatar: string;
  createdAt: Date;
  description: string;
  discord: null | string;
  featured: boolean;
  id: string;
  instagram: null | string;
  lens: null | string;
  name: string;
  slug: string;
  tags: string[];
  x: null | string;
};


export type TPeerMetadata = {
  displayName: string;
};


export type ProfileFlags = {
  isSuspended: boolean;
};

export type UniswapQuote = {
  amountOut: string;
  maxSlippage: string;
  routeString: string;
};

export type StaffPick = {
  profileId: string;
};

export type Feature = {
  createdAt: Date;
  enabled: boolean;
  id: string;
  key: string;
  type: 'FEATURE' | 'MODE' | 'PERMISSION';
};

export type AllowedToken = {
  contractAddress: string;
  decimals: number;
  id: string;
  name: string;
  symbol: string;
};


export type MembershipNft =
  Database['public']['Tables']['membership-nft']['Row'];

export type Preferences = {
  features: string[];
  hasDismissedOrMintedMembershipNft: boolean;
  highSignalNotificationFilter: boolean;
  isPride: boolean;
};
export type CollectModuleType = {
  type?:
    | CollectOpenActionModuleType.SimpleCollectOpenActionModule
    | CollectOpenActionModuleType.MultirecipientFeeCollectOpenActionModule
    | null;
  amount?: AmountInput | null;
  collectLimit?: string | null;
  referralFee?: number | null;
  recipient?: string | null;
  recipients?: RecipientDataInput[];
  followerOnly?: boolean;
  endsAt?: string | null;
};

export type PublicationViewCount = {
  id: string;
  views: number;
};


export type GlobalProfileStats = {
  total_acted: number;
  total_collects: number;
  total_comments: number;
  total_mirrors: number;
  total_notifications: number;
  total_posts: number;
  total_publications: number;
  total_quotes: number;
  total_reacted: number;
  total_reactions: number;
};


export type PollOption = {
  id: string;
  option: string;
  percentage: number;
  responses: number;
  voted: boolean;
};

export type Poll = {
  endsAt: Date;
  id: string;
  options: PollOption[];
};

export type SnapshotPollOption = {
  id: string;
  option: string;
  percentage: number;
  responses: number;
  voted: boolean;
};

export type SnapshotPoll = {
  endsAt: Date;
  id: string;
  options: SnapshotPollOption[];
};

export type EasPollOption = {
  index: number;
  option: string;
  percentage: number;
  responses: number;
  voted: boolean;
};

export type EasPoll = {
  endsAt?: Date;
  followersOnly: boolean;
  gateParams?: {
    minThreshold: string;
    tokenAddress: string;
  };
  options: EasPollOption[];
  publicationId: string;
  signatureRequired: boolean;
};

export type EasVote = {
  actorProfileId: string;
  actorProfileOwner: string;
  optionIndex: number;
  publicationId: string;
  timestamp?: number;
  transactionExecutor?: string;
};