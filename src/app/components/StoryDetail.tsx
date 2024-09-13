import React from 'react';
import { StoryMap } from '../types';



interface StoryDetailProps {
  story: StoryMap;
}

const StoryDetail: React.FC<StoryDetailProps> = ({ story }) => {
  return (
    <div className="detail bg-base-100 p-4 rounded-lg mt-4">
      <h4 className="text-lg font-semibold mb-2">Additional Details</h4>
      <p className="mb-2"><strong>Description:</strong> {story.description}</p>
      <p className="mb-2"><strong>Long Description:</strong> {story.longDescription}</p>
      <p className="mb-2"><strong>Location:</strong> Lat: {story.lat}, Lng: {story.lng}</p>
      <p className="mb-2"><strong>Start Date:</strong> {new Date(story.startDate).toLocaleDateString()}</p>
      <p className="mb-2"><strong>End Date:</strong> {new Date(story.endDate).toLocaleDateString()}</p>
      {story.mediaLink && (
        <img src={story.mediaLink} alt={story.title} className="mt-4 w-full h-auto rounded" />
      )}
    </div>
  );
};

export default StoryDetail;