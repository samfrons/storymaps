// File: app/components/Map.tsx
'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-cluster'
import { useMapFocus } from '../../hooks/useMapFocus'
import { useMarkerStates } from '../../hooks/useMarkerStates'
import { StoryMap, MarkerData } from '../types'
import 'leaflet/dist/leaflet.css'

// ... (keep the Leaflet icon setup)

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
  const map = useMap();
  const markerRefs = useRef<{ [key: string]: L.Marker }>({});
  
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

  useEffect(() => {
    if (activeMarkerId) {
      const marker = markerRefs.current[activeMarkerId];
      if (marker) {
        marker.openPopup();
        map.panTo(marker.getLatLng());
      }
    }
  }, [activeMarkerId, map]);

  return (
    <>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

<MarkerClusterGroup>
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
            ref={(ref) => {
              if (ref) {
                markerRefs.current[marker.id] = ref;
              }
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