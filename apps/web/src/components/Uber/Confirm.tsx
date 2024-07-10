
import { useState } from "react"

import { Button, HeyPopover, Modal } from '@lensshare/ui'
import useUberStore from "src/store/persisted/useUberStore"
import { useLensIntegration } from "./useLensIntegration"
import RideSelector from "./RideSelector"


const Confirm: React.FC = () => {
  const {
    currentAccount,
    pickup,
    dropoff,
    price,
    selectedRide,
    pickupCoordinates,
    dropoffCoordinates,
  } = useUberStore()

  const [transactionStatus, setTransactionStatus] = useState<string | null>(null)
  const { createRideOpenAction } = useLensIntegration()

  const createRideAction = async (pickup: string, dropoff: string) => {
    try {
      const rideDetails = {
        pickupLocation: pickup,
        dropoffLocation: dropoff,
        userWalletAddress: currentAccount,
        price: price,
        selectedRide: selectedRide,
      }

      const result = await createRideOpenAction(rideDetails)
      console.log("Ride action created:", result)
      setTransactionStatus("success")
    } catch (error) {
      console.error(error)
      setTransactionStatus("error")
    }
  }

  return (
    <div className="flex-1 h-full flex flex-col justify-between">
      <div className="h-full flex flex-col overflow-auto mb-20">
        {pickupCoordinates && dropoffCoordinates && <RideSelector />}
      </div>
      <div className="cursor-pointer z-20 absolute bottom-[5px] bg-white left-0 right-0">
        <Button className="bg-black text-white m-4 py-4 text-center text-xl" onClick={() => createRideAction(pickup, dropoff)}>
          Create Ride Action on Lens
        </Button>
      </div>
      {transactionStatus === "success" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 text-xl text-center justify-center">
            <div className="font-bold">Awesome!</div>
            <div>Your ride action has been created successfully on Lens</div>
            <Button onClick={() => setTransactionStatus(null)} className="bg-green-500 text-white w-32 mt-4 py-2 rounded">
              OK
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Confirm