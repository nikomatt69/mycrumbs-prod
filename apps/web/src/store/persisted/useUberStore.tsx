import create from 'zustand'

export interface UberState {
  pickup: string
  dropoff: string
  pickupCoordinates: number[] | null
  dropoffCoordinates: number[] | null
  currentAccount: string | null
  currentUser: any
  selectedRide: any
  price: number | null
  basePrice: number | null
  metamask: any
  setPickup: (pickup: string) => void
  setDropoff: (dropoff: string) => void
  setPickupCoordinates: (coords: number[]) => void
  setDropoffCoordinates: (coords: number[]) => void
  setCurrentAccount: (account: string) => void
  setCurrentUser: (user: any) => void
  setSelectedRide: (ride: any) => void
  setPrice: (price: number) => void
  setBasePrice: (price: number) => void
  connectWallet: () => void
  checkIfWalletIsConnected: () => void
  requestToCreateUserOnSanity: (address: string) => void
  requestToGetCurrentUsersInfo: (walletAddress: string) => void
}
const useUberStore = create<UberState>((set, get) => ({
  pickup: '',
  dropoff: '',
  pickupCoordinates: null,
  dropoffCoordinates: null,
  currentAccount: null,
  currentUser: null,
  selectedRide: null,
  price: null,
  basePrice: null,
  metamask: typeof window !== 'undefined' ? window.ethereum : null,
  setPickup: (pickup) => set({ pickup }),
  setDropoff: (dropoff) => set({ dropoff }),
  setPickupCoordinates: (coords) => set({ pickupCoordinates: coords }),
  setDropoffCoordinates: (coords) => set({ dropoffCoordinates: coords }),
  setCurrentAccount: (account) => set({ currentAccount: account }),
  setCurrentUser: (user) => set({ currentUser: user }),
  setSelectedRide: (ride) => set({ selectedRide: ride }),
  setPrice: (price) => set({ price }),
  setBasePrice: (price) => set({ basePrice: price }),
  connectWallet: async () => {
    const { metamask, setCurrentAccount, requestToCreateUserOnSanity } = get()
    if (!metamask) return
    try {
      const addressArray = await metamask.request({ method: 'eth_requestAccounts' })
      if (addressArray.length > 0) {
        setCurrentAccount(addressArray[0])
        requestToCreateUserOnSanity(addressArray[0])
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    }
  },
  checkIfWalletIsConnected: async () => {
    const { metamask, setCurrentAccount, requestToCreateUserOnSanity } = get()
    if (!metamask) return
    try {
      const addressArray = await metamask.request({ method: 'eth_accounts' })
      if (addressArray.length > 0) {
        setCurrentAccount(addressArray[0])
        requestToCreateUserOnSanity(addressArray[0])
      }
    } catch (error) {
      console.error('Failed to check wallet connection:', error)
    }
  },
  requestToCreateUserOnSanity: async (address) => {
    try {
      await fetch('api/db/createUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userWalletAddress: address,
          name: address,
          profileImage: 'https://example.com/placeholder.png',
        }),
      })
    } catch (error) {
      console.error('Failed to create user on Sanity:', error)
    }
  },
  requestToGetCurrentUsersInfo: async (walletAddress) => {
    try {
      const response = await fetch(`api/db/getUserInfo?walletAddress=${walletAddress}`)
      const data = await response.json()
      set({ currentUser: data.data })
    } catch (error) {
      console.error('Failed to get current user info:', error)
    }
  }
}))

export default useUberStore