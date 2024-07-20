import { useState } from 'react';
import { Card } from '@lensshare/ui';
import useUberStore from 'src/store/persisted/useUberStore';
import { useLensIntegration } from './useLensIntegration';
import Confirm from './Confirm';
import RideSelector from './RideSelector';
import LensRiders from './LensRiders';

const UberCard = () => {
  const [activeTab, setActiveTab] = useState<'ride' | 'riders'>('ride');
  const { pickup, dropoff, selectedRide } = useUberStore();
  const { createRideOpenAction } = useLensIntegration();

  const handleCreateRide = async () => {
    if (pickup && dropoff && selectedRide) {
      try {
        await createRideOpenAction({
          pickupLocation: pickup,
          dropoffLocation: dropoff,
          selectedRide: selectedRide
        });
        // Handle success (e.g., show a success message)
      } catch (error) {
        console.error('Failed to create ride:', error);
        // Handle error (e.g., show an error message)
      }
    }
  };

  return (
    <Card className="p-5">
      <div className="flex justify-between mb-4">
        <button
          className={`px-4 py-2 ${activeTab === 'ride' ? 'bg-black text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('ride')}
        >
          Request Ride
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'riders' ? 'bg-black text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('riders')}
        >
          Available Riders
        </button>
      </div>
      
      {activeTab === 'ride' ? (
        <>
          <RideSelector />
          <Confirm />
          <button
            className="w-full bg-black text-white py-2 mt-4"
            onClick={handleCreateRide}
          >
            Create Ride on Lens
          </button>
        </>
      ) : (
        <LensRiders />
      )}
    </Card>
  );
};

export default UberCard;