import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { gql, useApolloClient } from '@apollo/client'

import { Button, Card, } from '@lensshare/ui'
import { useLensIntegration } from './useLensIntegration'
import getCurrentSessionProfileId from '@lib/getCurrentSessionProfileId'
import { useAppStore } from 'src/store/persisted/useAppStore'

const LENS_RIDES_QUERY = gql`
  query GetRides($profileId: String!) {
    publications(request: { profileId: $profileId, publicationTypes: [POST] }) {
      items {
        id
        metadata {
          name
          description
        }
      }
    }
  }
`

const LensRides: React.FC = () => {
  const [rides, setRides] = useState<any[]>([])
  const client = useApolloClient()
  const { collectRide } = useLensIntegration()
  const {currentProfile} = useAppStore()
  const { data, error, isLoading } = useQuery({
    queryKey: ['rides'],
    queryFn: async () => {
      const { data } = await client.query({
        query: LENS_RIDES_QUERY,
        variables: { profileId: currentProfile?.id },
      })
      return data.publications.items
    }
  })

  useEffect(() => {
    if (data) {setRides(data)}
    if (error) {console.error('Failed to fetch rides:', error)}
  }, [data, error])

  const handleCollectRide = async (publicationId: string) => {
    try {
      await collectRide(publicationId)
      console.log('Ride collected successfully')
    } catch (error) {
      console.error('Failed to collect ride:', error)
    }
  }

  if (isLoading) {return <div>Loading...</div>}

  return (
    <div className="flex flex-col h-full">
      <div className="text-center text-xl py-4 border-b text-gray-500">Available Rides on Lens</div>
      <div className="flex flex-col flex-1 overflow-auto">
        {rides.map((ride) => (
          <Card key={ride.id} className="p-3 m-2 border-2 flex items-center">
            <div className="ml-2 flex-1">
              <div className="font-medium">{ride.metadata.name}</div>
              <div>{ride.metadata.description}</div>
            </div>
            <Button onClick={() => handleCollectRide(ride.id)}>Collect Ride</Button>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default LensRides