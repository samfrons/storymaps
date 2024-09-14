// File: app/components/Map.tsx
'use client'

import { useEffect } from 'react'
import L from 'leaflet'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import { useMapFocus } from '../../hooks/useMapFocus'
import { useMarkerStates } from '../../hooks/useMarkerStates'
import { StoryMap, MarkerData } from '../types'
import 'leaflet/dist/leaflet.css'

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
});

interface MapProps {
  stories: StoryMap[];
  center: [number, number];
  zoom: number;
  onMarkerClick: (id: string) => void;
  activeMarkerId: string | null;
  currentDate: Date;
}

function MapContent({ stories, onMarkerClick, activeMarkerId, currentDate }: Omit<MapProps, 'center' | 'zoom'>) {
  const markerStates = useMarkerStates(stories, currentDate);

   const markers: MarkerData[] = stories.map(story => ({
    id: story.id,
    position: [story.lat, story.lng] as [number, number],
    popup: story.title
  }));

    useMapFocus(activeMarkerId, markers);

  const getMarkerIcon = (state: string) => {
    return L.divIcon({
      className: `custom-marker ${state}`,
      html: `<div></div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    });
  };

  return (
    <>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <MarkerClusterGroup>
        {markers.map((marker) => {
          const markerState = markerStates.find(m => m.id === marker.id)?.state || 'active';
          return (
            <Marker 
              key={marker.id} 
              position={marker.position}
              icon={getMarkerIcon(markerState)}
              eventHandlers={{
                click: () => onMarkerClick(marker.id),
              }}
            >
              <Popup>{marker.popup}</Popup>
            </Marker>
          );
        })}
      </MarkerClusterGroup>
    </>
  );
}

const Map: React.FC<MapProps> = ({ stories, center, zoom, onMarkerClick, activeMarkerId, currentDate }) => {
  return (
    <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
      <MapContent 
        stories={stories} 
        onMarkerClick={onMarkerClick} 
        activeMarkerId={activeMarkerId} 
        currentDate={currentDate}
      />
    </MapContainer>
  )
}

export default Map