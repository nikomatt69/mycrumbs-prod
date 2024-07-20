import { useWalletClient } from 'wagmi'
import { useAppStore } from 'src/store/persisted/useAppStore'
import sanitizeDStorageUrl from '@lensshare/lib/sanitizeDStorageUrl'
import uploadToIPFS from '@lib/uploadToIPFS'
import { ApolloClient, gql, useApolloClient } from '@apollo/client'


export const CREATE_POST_VIA_DISPATCHER = gql`
  mutation CreatePostViaDispatcher($request: CreatePostRequest!) {
    createPostViaDispatcher(request: $request) {
      ... on RelayerResult {
        txHash
        txId
      }
      ... on RelayError {
        reason
      }
    }
  }
`;

export const COLLECT_PUBLICATION = gql`
  mutation CollectPublication($request: CollectRequest!) {
    collect(request: $request) {
      ... on RelayerResult {
        txHash
        txId
      }
      ... on RelayError {
        reason
      }
    }
  }
`;
export const useLensIntegration = () => {
  const { data: walletClient } = useWalletClient()
  const apolloClient = useApolloClient()
  const { currentProfile } = useAppStore()

  const createRideOpenAction = async (rideDetails: any) => {
    if (!walletClient) {
      throw new Error('Wallet not connected')
    }

    try {
      const ipfsResult = await uploadToIPFS(rideDetails)
      const result = await apolloClient.mutate({
        mutation: CREATE_POST_VIA_DISPATCHER,
        variables: {
          request: {
            profileId: currentProfile?.id,
            contentURI: sanitizeDStorageUrl(ipfsResult as any),
            openActionModules: [{
              collectOpenAction: {
                followerOnly: false,
                customData: rideDetails,
              },
            }],
          }
        }
      })

      return result.data.createPostViaDispatcher
    } catch (error) {
      console.error('Failed to create ride open action:', error)
      throw error
    }
  }

  const collectRide = async (publicationId: string) => {
    if (!walletClient) {
      throw new Error('Wallet not connected')
    }

    try {
      const result = await apolloClient.mutate({
        mutation: COLLECT_PUBLICATION,
        variables: {
          request: {
            publicationId,
            profileId: currentProfile?.id,
          }
        }
      })

      return result.data.collect
    } catch (error) {
      console.error('Failed to collect ride:', error)
      throw error
    }
  }

  return {
    createRideOpenAction,
    collectRide,
  }
}