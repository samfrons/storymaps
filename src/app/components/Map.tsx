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
  currentYear: number;
}

function MapContent({ stories, onMarkerClick, activeMarkerId, currentYear }: Omit<MapProps, 'center' | 'zoom'>) {
  const markerStates = useMarkerStates(stories, currentYear);
  
  const markers: MarkerData[] = stories.map(story => ({
    id: story.id,
    position: [story.lat, story.lng] as [number, number],
    popup: story.title
  }));

  useMapFocus(activeMarkerId, markers);

  const getMarkerIcon = (state: string, isActive: boolean) => {
    let className = `custom-marker ${state}`;
    if (isActive) {
      className += ' active';
    }
    return L.divIcon({
      className: className,
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
      {markers.map((marker) => {
        const markerState = markerStates.find(m => m.id === marker.id)?.state || 'normal';
        const isActive = marker.id === activeMarkerId;
        return (
          <Marker 
            key={marker.id} 
            position={marker.position}
            icon={getMarkerIcon(markerState, isActive)}
            eventHandlers={{
              click: () => onMarkerClick(marker.id),
            }}
          >
            <Popup>{marker.popup}</Popup>
          </Marker>
        );
      })}
    </>
  );
}

const Map: React.FC<MapProps> = ({ stories, center, zoom, onMarkerClick, activeMarkerId, currentYear }) => {
  return (
    <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
      <MapContent 
        stories={stories} 
        onMarkerClick={onMarkerClick} 
        activeMarkerId={activeMarkerId} 
        currentYear={currentYear}
      />
    </MapContainer>
  )
}

export default Map