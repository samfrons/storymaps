import { Map as LeafletMap } from 'leaflet';
import { MarkerData } from '../types';

const DEFAULT_ZOOM = 10;

export const focusMap = (
  map: LeafletMap,
  activeMarkerId: string | null, 
  markers: MarkerData[], 
  scrolledStoryId: string | null
) => {
  const focusOnMarker = (markerId: string) => {
    const activeMarker = markers.find(marker => marker.id === markerId);
    if (activeMarker) {
      map.setView(activeMarker.position, DEFAULT_ZOOM, {
        animate: true,
        duration: 1
      });
    }
  };

  if (activeMarkerId) {
    focusOnMarker(activeMarkerId);
  } else if (scrolledStoryId) {
    focusOnMarker(scrolledStoryId);
  }
};