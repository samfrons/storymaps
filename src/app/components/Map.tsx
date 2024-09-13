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

type MarkerData = {
  id: string;
  position: [number, number];
  popup: string;
}

type MapProps = {
  markers: MarkerData[];
}

const Map: React.FC<MapProps> = ({ markers }) => {
  useEffect(() => {
    console.log('Markers in Map component:', markers);
  }, [markers]);

  // Calculate the center of the map based on markers
  const center = markers.length > 0
    ? [
        markers.reduce((sum, marker) => sum + marker.position[0], 0) / markers.length,
        markers.reduce((sum, marker) => sum + marker.position[1], 0) / markers.length,
      ] as [number, number]
    : [40.7128, -74.0060] as [number, number]; // Default to New York City coordinates

  return (
    <MapContainer center={center} zoom={10} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <MarkerClusterGroup>
        {markers.map((marker) => (
          <Marker key={marker.id} position={marker.position}>
            <Popup>{marker.popup}</Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  )
}

export default Map