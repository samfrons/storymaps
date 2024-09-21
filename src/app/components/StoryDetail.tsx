'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { StoryMap } from '../types';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface StoryDetailProps {
  story: StoryMap;
  isStandalone?: boolean;
}

const StoryDetail: React.FC<StoryDetailProps> = ({ story, isStandalone = false }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

   if (!isMounted) {
    return null // or a loading placeholder
  }

  if (!story) {
    return <div>No story details available.</div>;
  }

  const markerIcon = L.divIcon({
    className: 'custom-marker',
    html: `<div></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });

  return (
    <div className="mt-4 p-4 bg-base-100 rounded-lg">
      <h4 className="text-lg font-semibold mb-2">{isStandalone ? story.title : 'Additional Details'}</h4>
      {story.imageUrls && story.imageUrls.length > 0 && (
        <div className="mb-4">
          {story.imageUrls.map((url, index) => (
            <div key={index} className="relative w-full h-64 mb-2">
              <Image
                src={url}
                alt={`${story.title} - Image ${index + 2}`}
                layout="fill"
                objectFit="cover"
                className="rounded"
              />
            </div>
          ))}
        </div>
      )}
      <p className="mb-2"><strong>Category:</strong> {story.category || 'N/A'}</p>
      <p className="mb-2"><strong>Address:</strong> {story.address || 'N/A'}</p>
      <p className="mb-2"><strong>Location:</strong> Lat: {story.lat.toFixed(6)}, Lng: {story.lng.toFixed(6)}</p>
      <p className="mb-2"><strong>Start Date:</strong> {new Date(story.startDate).toLocaleDateString()}</p>
      <p className="mb-2"><strong>End Date:</strong> {new Date(story.endDate).toLocaleDateString()}</p>
      {story.longDescription && <p className="mb-2">{story.longDescription}</p>}
      
      {isStandalone && isMounted && (
        <div style={{ height: '400px', width: '100%' }}>
          <MapContainer center={[story.lat, story.lng]} zoom={15} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>'
            />
            <Marker position={[story.lat, story.lng]} icon={markerIcon}>
              <Popup>{story.title}</Popup>
            </Marker>
          </MapContainer>
        </div>
      )}
    </div>
  );
};

export default StoryDetail;