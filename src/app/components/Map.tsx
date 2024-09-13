'use client'

import { useEffect } from 'react'
import L from 'leaflet'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
});

type StoryMapData = {
  id: string;
  title: string;
  author: string;
  description: string;
  address: string;
  lat: number;
  lng: number;
  startDate: string | null;
  midDate: string | null;
  endDate: string | null;
  category: string;
  media: any[];
}

type MapProps = {
  storyMaps: StoryMapData[];
}

const Map: React.FC<MapProps> = ({ storyMaps }) => {
  useEffect(() => {
    console.log('StoryMaps in Map component:', storyMaps);
  }, [storyMaps]);

  // Calculate the center of the map based on storyMaps
  const center = storyMaps.length > 0
    ? [
        storyMaps.reduce((sum, storyMap) => sum + storyMap.lat, 0) / storyMaps.length,
        storyMaps.reduce((sum, storyMap) => sum + storyMap.lng, 0) / storyMaps.length,
      ] as [number, number]
    : [52.52, 13.405] as [number, number]; // Default to Berlin coordinates

  return (
    <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <MarkerClusterGroup>
        {storyMaps.map((storyMap) => (
          <Marker key={storyMap.id} position={[storyMap.lat, storyMap.lng]}>
            <Popup>
              <div>
                <h3>{storyMap.title}</h3>
                <p>{storyMap.description}</p>
                <p>Address: {storyMap.address}</p>
                {storyMap.startDate && <p>Start Date: {storyMap.startDate}</p>}
                {storyMap.endDate && <p>End Date: {storyMap.endDate}</p>}
                {storyMap.category && <p>Category: {storyMap.category}</p>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  )
}

export default Map