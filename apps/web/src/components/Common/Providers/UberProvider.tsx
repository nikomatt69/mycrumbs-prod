import { createContext, ReactNode, useEffect } from 'react'
import useUberStore from 'src/store/persisted/useUberStore'


export const UberContext = createContext<any>(null)

interface UberProviderProps {
  children: ReactNode
}
 const UberProvider: React.FC<UberProviderProps> = ({ children }) => {
  const {
    checkIfWalletIsConnected,
    currentAccount,
    requestToGetCurrentUsersInfo,
  } = useUberStore((state) => ({
    checkIfWalletIsConnected: state.checkIfWalletIsConnected,
    currentAccount: state.currentAccount,
    requestToGetCurrentUsersInfo: state.requestToGetCurrentUsersInfo,
  }))

  useEffect(() => {
    checkIfWalletIsConnected()
  }, [checkIfWalletIsConnected])

  useEffect(() => {
    if (!currentAccount) return
    requestToGetCurrentUsersInfo(currentAccount)
  }, [currentAccount, requestToGetCurrentUsersInfo])

  return (
    <UberContext.Provider value={useUberStore}>
      {children}
    </UberContext.Provider>
  )
}

export default UberProvider