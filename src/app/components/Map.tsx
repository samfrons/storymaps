'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { useMarkerStates } from '../../hooks/useMarkerStates'
import { StoryMap, MarkerData } from '../types'
import 'leaflet/dist/leaflet.css'

interface MapProps {
  stories: StoryMap[];
  center: [number, number];
  zoom: number;
  onMarkerClick: (id: string) => void;
  activeMarkerId: string | null;
  currentDate: Date;
  mapStyle?: string;
  focusedStoryId: string | null;
}

function MapContent({ 
  stories, 
  onMarkerClick, 
  activeMarkerId, 
  currentDate, 
  mapStyle,
  focusedStoryId 
}: Omit<MapProps, 'center' | 'zoom'>) {
  const map = useMap();
  const markerRefs = useRef<{ [key: string]: L.Marker }>({});
  const [activePopup, setActivePopup] = useState<string | null>(null);
  const markerStates = useMarkerStates(stories, currentDate);
  
  const markers: MarkerData[] = stories.map(story => ({
    id: story.id,
    position: [Number(story.lat), Number(story.lng)] as [number, number],
    popup: story.title
  }));

  useEffect(() => {
    if (focusedStoryId) {
      const story = stories.find(s => s.id === focusedStoryId);
      if (story) {
        map.setView([Number(story.lat), Number(story.lng)], 15, { animate: true, duration: 1 });
        setActivePopup(focusedStoryId);
      }
    }
  }, [focusedStoryId, stories, map]);

  useEffect(() => {
    if (activePopup) {
      const marker = markerRefs.current[activePopup];
      if (marker) {
        marker.openPopup();
      }
    }
  }, [activePopup]);

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
        url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>'
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
              click: (e) => {
                L.DomEvent.stopPropagation(e);
                onMarkerClick(marker.id);
                setActivePopup(marker.id);
              },
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
    </>
  );
}

const Map: React.FC<MapProps> = ({ 
  stories, 
  center, 
  zoom, 
  onMarkerClick, 
  activeMarkerId, 
  currentDate,
  focusedStoryId 
}) => {
  return (
    
    <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
      <MapContent 
        stories={stories} 
        onMarkerClick={onMarkerClick} 
        activeMarkerId={activeMarkerId} 
        currentDate={currentDate}
        focusedStoryId={focusedStoryId}
      />
    </MapContainer>
  )
}

export default Map