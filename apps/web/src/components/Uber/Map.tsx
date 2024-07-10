import { useEffect, useContext, useCallback, FC } from 'react'
import mapboxgl from 'mapbox-gl'
import MapboxDirections from '@mapbox/mapbox-sdk/services/directions'
import { UberContext } from '@components/Common/Providers/UberProvider'



export const Map = () => {
  const { pickupCoordinates, dropoffCoordinates } = useContext(UberContext)

  const addToMap = useCallback((map: mapboxgl.Map, coordinates: [number, number]) => {
    new mapboxgl.Marker().setLngLat(coordinates).addTo(map)
  }, [])

  

  const directionsService = MapboxDirections({
    accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string
  })

  const style = {
    wrapper: `flex-1 h-full w-full absolute bottom-0`
  }

  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/coderweb3/clgqlo13q00jk01qy2cgb77z8',
      center: [-0.2, 39.39],
      zoom: 4
    })

    if (pickupCoordinates) {
      addToMap(map, pickupCoordinates)
    }

    if (dropoffCoordinates) {
      addToMap(map, dropoffCoordinates)
    }

    if (pickupCoordinates && dropoffCoordinates) {
      map.fitBounds([dropoffCoordinates, pickupCoordinates], {
        padding: 400
      })
      // Add directions
      directionsService.getDirections({
        waypoints: [
          { coordinates: pickupCoordinates },
          { coordinates: dropoffCoordinates }
        ],
        profile: 'driving-traffic'
      }).send().then(response => {
        if (response.body.routes.length) {
          const route = response.body.routes[0]
          map.addLayer({
            id: 'route',
            type: 'line',
            source: {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: JSON.parse(route.geometry)
              }
            },
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#888',
              'line-width': 8
            }
          })
        }
        })
    }

    return () => map.remove()
  }, [pickupCoordinates, dropoffCoordinates, addToMap, directionsService])

  return 
}

export default Map;
