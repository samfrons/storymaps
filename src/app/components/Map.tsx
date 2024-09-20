'use client'

import { useEffect, useRef } from 'react'
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
  activeStoryId: string | null;
  currentDate: Date;
  mapStyle?: string;
  onViewFullStory: (storyId: string) => void;
}

function MapContent({ 
  stories, 
  onMarkerClick, 
  activeStoryId, 
  currentDate, 
  mapStyle,
  onViewFullStory
}: Omit<MapProps, 'center' | 'zoom'>) {
  const map = useMap();
  const markerRefs = useRef<{ [key: string]: L.Marker }>({});
  const markerStates = useMarkerStates(stories, currentDate);
  
  const markers: MarkerData[] = stories.map(story => ({
    id: story.id,
    position: [Number(story.lat), Number(story.lng)] as [number, number],
    popup: story.title
  }));

  useEffect(() => {
    if (activeStoryId) {
      const activeStory = stories.find(s => s.id === activeStoryId);
      if (activeStory) {
        const position: [number, number] = [Number(activeStory.lat), Number(activeStory.lng)];
        map.flyTo(position, 15, {
          duration: 1.5,
          easeLinearity: 0.25
        });
        const marker = markerRefs.current[activeStoryId];
        if (marker) {
          marker.openPopup();
        }
      }
    }
  }, [activeStoryId, stories, map]);

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
        const isActive = marker.id === activeStoryId;
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
            <Popup>
              <div>
                <h3>{marker.popup}</h3>
                <button onClick={() => onViewFullStory(marker.id)} className="btn btn-primary btn-sm mt-2">
                  View Full Story
                </button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}

const Map: React.FC<MapProps> = (props) => {
  return (
    <MapContainer center={props.center} zoom={props.zoom} style={{ height: '100%', width: '100%' }}>
      <MapContent {...props} />
    </MapContainer>
  )
}

export default Map