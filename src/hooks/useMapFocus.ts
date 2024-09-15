// File: hooks/useMapFocus.ts

import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { MarkerData } from '../types';

export const useMapFocus = (activeMarkerId: string | null, markers: MarkerData[]) => {
  const map = useMap();
  const prevZoom = useRef(map.getZoom());

  useEffect(() => {
    if (activeMarkerId) {
      const activeMarker = markers.find(marker => marker.id === activeMarkerId);
      if (activeMarker) {
        map.setView(activeMarker.position, prevZoom.current);
        
        const leafletMarkers = (map as any)._layers;
        Object.values(leafletMarkers).forEach((layer: any) => {
          if (layer.options && layer.options.id === activeMarkerId) {
            layer.openPopup();
          }
        });
      }
    }
  }, [activeMarkerId, markers, map]);

  useEffect(() => {
    const updateZoom = () => {
      prevZoom.current = map.getZoom();
    };
    map.on('zoomend', updateZoom);
    return () => {
      map.off('zoomend', updateZoom);
    };
  }, [map]);
};