'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { focusMap } from '../../hooks/useMapFocus'
import { useMarkerStates } from '../../hooks/useMarkerStates'
import { StoryMap, MarkerData } from '../types'
import 'leaflet/dist/leaflet.css'

interface MapProps {
  stories: StoryMap[];
  center: [number, number];
  zoom: number;
  onMarkerClick: (id: string) => void;
  activeMarkerId: string | null;
  currentYear: number;
  mapStyle?: string;
}

function MapContent({ stories, onMarkerClick, activeMarkerId, currentYear, mapStyle }: Omit<MapProps, 'center' | 'zoom'>) {
  const map = useMap();
  const markerRefs = useRef<{ [key: string]: L.Marker }>({});
  const [scrolledStoryId, setScrolledStoryId] = useState<string | null>(null);
  
  const markers: MarkerData[] = stories.map(story => ({
    id: story.id,
    position: [story.lat, story.lng] as [number, number],
    popup: story.title
  }));

  const markerStates = useMarkerStates(stories, currentYear);

  useEffect(() => {
    focusMap(map, activeMarkerId, markers, scrolledStoryId);
  }, [map, activeMarkerId, markers, scrolledStoryId]);

  useEffect(() => {
    const handleScroll = () => {
      const storyElements = document.querySelectorAll('.story-item');
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;

      for (let i = 0; i < storyElements.length; i++) {
        const element = storyElements[i] as HTMLElement;
        const rect = element.getBoundingClientRect();

        if (rect.top >= 0 && rect.top <= windowHeight / 2) {
          setScrolledStoryId(element.id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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