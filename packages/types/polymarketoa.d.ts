// types.ts
export interface ConstructorParams {
  lensHub: string;
  lensModuleRegistry: string;
  exchange: string;
  collateralToken: string;
  conditionalTokens: string;
  umaCtfAdapterV2: string;
}

export interface MarketRegisteredEvent {
  publicationActedProfileId: number;
  publicationActedId: number;
  oracle: string;
  questionId: string;
  conditionId: string;
  tokenIds: [number, number];
}

export interface OrderVerifiedEvent {
  publicationActedProfileId: number;
  publicationActedId: number;
  actorProfileId: number;
  actorProfileOwner: string;
  oracle: string;
  questionId: string;
  conditionId: string;
  order: Order;
}

export interface Order {
  salt: number;
  maker: string;
  signer: string;
  taker: string;
  tokenId: number;
  makerAmount: number;
  takerAmount: number;
  expiration: number;
  nonce: number;
  feeRateBps: number;
  side: Side;
  signatureType: SignatureType;
  signature: string;
}

export enum Side {
  Buy,
  Sell
}

export enum SignatureType {
  EIP712,
  EthSign
}
