// file: src/app/components/StoryDetail.tsx

import React from 'react';
import Image from 'next/image';
import { StoryMap } from '../types';

interface StoryDetailProps {
  story: StoryMap;
}

const StoryDetail: React.FC<StoryDetailProps> = ({ story }) => {
  return (
    <div className="mt-4 p-4 bg-base-100 rounded-lg">
      <h4 className="text-lg font-semibold mb-2">Additional Details</h4>
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
      <p className="mb-2"><strong>Address:</strong> {story.address}</p>
      <p className="mb-2"><strong>Location:</strong> Lat: {story.lat}, Lng: {story.lng}</p>
    </div>
  );
};

export default StoryDetail;