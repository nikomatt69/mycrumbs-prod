import Image from 'next/image'
import ethLogo from '../assets/eth-logo.png'
import { useEffect, useState } from 'react'

import mapboxgl from 'mapbox-gl'
import * as turf from '@turf/turf'
import { Button, Card } from '@lensshare/ui'

import useUberStore from 'src/store/persisted/useUberStore'
import { useLensIntegration } from './useLensIntegration'


const RideSelector: React.FC = () => {
  const [carList, setCarList] = useState<any[]>([])
  const { selectedRide, setSelectedRide, setPrice, basePrice, pickupCoordinates, dropoffCoordinates } = useUberStore()

  const [distance, setDistance] = useState<number | null>(null)
  const { collectRide } = useLensIntegration()

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch('api/db/getRideTypes')
        const data = await response.json()
        setCarList(data.data)
        setSelectedRide(data.data[0])
      } catch (error) {
        console.error('Failed to fetch ride types:', error)
      }
    })()
  }, [])

  useEffect(() => {
    const map = new mapboxgl.Map({
     container: 'map',
      style: 'mapbox://styles/coderweb3/clgqlo13q00jk01qy2cgb77z8',
      center: [-.2, 39.39],
      zoom: 4,
    })
    if (pickupCoordinates) {
      addToMap(map, pickupCoordinates as [number, number])
    }

    if (dropoffCoordinates) {
      addToMap(map, dropoffCoordinates as [number, number])
    }
    

    if (pickupCoordinates && dropoffCoordinates) {
      const distance = turf.distance(
        turf.point(pickupCoordinates),
        turf.point(dropoffCoordinates)
      )

      console.log('Distance:', distance)
      setDistance(distance);
      
      map.fitBounds([dropoffCoordinates as [number, number], pickupCoordinates as [number, number]], {
        padding: 400,
      })
    }
  }, [pickupCoordinates, dropoffCoordinates])
  const addToMap = (map: mapboxgl.Map, coordinates: [number, number]) => {
    const marker1 = new mapboxgl.Marker().setLngLat(coordinates).addTo(map)
  }

  const handleCollectRide = async (publicationId: string) => {
    try {
      await collectRide(publicationId)
      console.log('Ride collected successfully')
      // Handle successful collection (e.g., show a success message)
    } catch (error) {
      console.error('Failed to collect ride:', error)
      // Handle error (e.g., show an error message)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="text-center text-xs py-2 border-b text-gray-500">Choose a ride, or swipe up for more</div>
      <div className="flex flex-col flex-1 overflow-auto">
        {carList.map((car, index) => (
          <Card
            key={index}
            className={`p-3 m-2 border-2 flex items-center ${selectedRide.service === car.service ? 'border-black' : 'border-white'}`}
            onClick={() => {
              setSelectedRide(car)
              setPrice(Number(((basePrice as any/ 10 ** 5) * car.priceMultiplier).toFixed(5)))
            }}
          >
            <Image
              src={car.iconUrl}
              height={50}
              width={50}
              alt="carImage"
            />
            <div className="ml-2 flex-1">
              <div className="font-medium">{car.service}</div>
              <div className="text-xs text-blue-500">5 min away</div>
            </div>
            <div className="flex items-center">
              <div className="mr-2">{((basePrice as any / 10 ** 5) * car.priceMultiplier).toFixed(5)}</div>
              <Image src={'/images/chains/eth.png'} height={25} width={40} alt='ethLogo' />
            </div>
            <div className="flex items-center">
              <div id='map'>{(distance as any).toFixed(1)} km</div>
            </div>
            <Button className="ml-2" onClick={() => handleCollectRide(car.publicationId)}>Collect Ride</Button>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default RideSelector