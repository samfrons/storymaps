'use client'

import { useEffect } from 'react'
import L from 'leaflet'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import { useMapFocus } from '../../hooks/useMapFocus'
import 'leaflet/dist/leaflet.css'

delete (L.Icon.Default.prototype as any)._getIconUrl;
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
  markers?: MarkerData[];
  center: [number, number];
  zoom: number;
  onMarkerClick: (id: string) => void;
  activeMarkerId: string | null;
}

function MapContent({ markers, onMarkerClick, activeMarkerId }: Omit<MapProps, 'center' | 'zoom'>) {
  useMapFocus(activeMarkerId, markers || []);

  return (
    <>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <MarkerClusterGroup>
        {markers && markers.length > 0 && markers.map((marker) => (
          <Marker 
            key={marker.id} 
            position={marker.position}
            eventHandlers={{
              click: () => onMarkerClick(marker.id),
            }}
          >
            <Popup>{marker.popup}</Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </>
  );
}

const Map: React.FC<MapProps> = ({ markers = [], center, zoom, onMarkerClick, activeMarkerId }) => {
  useEffect(() => {
    console.log('Markers in Map component:', markers);
  }, [markers]);

  return (
    <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
      <MapContent markers={markers} onMarkerClick={onMarkerClick} activeMarkerId={activeMarkerId} />
    </MapContainer>
  )
}

export default Map