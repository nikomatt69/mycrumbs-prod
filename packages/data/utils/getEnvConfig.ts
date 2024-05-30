import { LENS_NETWORK } from '../constants';
import { MainnetContracts, TestnetContracts } from '../contracts';
import LensEndpoint from '../lens-endpoints';

const getEnvConfig = (): {
  publicActProxyAddress: `0x${string}`;
  apiEndpoint: string;
  lensHubProxyAddress: `0x${string}`;
  defaultCollectToken: string;
  permissionlessCreator?: `0x${string}`;
  tokenHandleRegistry: `0x${string}`;
  litProtocolEnvironment: string;
  heyLensSignup: `0x${string}`;
} => {
  switch (LENS_NETWORK) {
    case 'testnet':
      return {
        apiEndpoint: LensEndpoint.Mainnet,
        lensHubProxyAddress: MainnetContracts.LensHubProxy,
        defaultCollectToken: MainnetContracts.DefaultToken,
        litProtocolEnvironment: 'polygon',
        publicActProxyAddress: MainnetContracts.PublicActProxy,
        heyLensSignup: TestnetContracts.HeyLensSignup,
        permissionlessCreator: TestnetContracts.PermissionlessCreator,
        tokenHandleRegistry: TestnetContracts.TokenHandleRegistry
        
      };
    default:
      return {
        apiEndpoint: LensEndpoint.Mainnet,
        lensHubProxyAddress: MainnetContracts.LensHubProxy,
        defaultCollectToken: MainnetContracts.DefaultToken,
        litProtocolEnvironment: 'polygon',
        publicActProxyAddress: MainnetContracts.PublicActProxy,
        heyLensSignup: TestnetContracts.HeyLensSignup,
        permissionlessCreator: MainnetContracts.PermissionlessCreator,
        tokenHandleRegistry: MainnetContracts.TokenHandleRegistry
      };
  }
};

export default getEnvConfig;
