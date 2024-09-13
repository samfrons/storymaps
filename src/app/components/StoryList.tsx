// file: src/app/components/StoryList.tsx

'use client';

import React, { useState } from 'react';
import TimeSlider from './TimeSlider';
import { StoryMap } from '../types';
import StoryDetail from './StoryDetail';

interface StoryListProps {
  visibleStories: StoryMap[];
  activeStoryId: string | null;
  minDate: Date;
  maxDate: Date;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  onStoryClick: (storyId: string) => void;
}

const StoryList: React.FC<StoryListProps> = ({
  visibleStories,
  activeStoryId,
  minDate,
  maxDate,
  currentDate,
  setCurrentDate,
  onStoryClick
}) => {
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);

  const handleViewDetails = (storyId: string) => {
    setSelectedStoryId(prevId => prevId === storyId ? null : storyId);
  };

  const handleStoryClick = (storyId: string) => {
    onStoryClick(storyId);
  };

  return (
    <div className="w-full h-full overflow-y-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Berlin Historical Tour</h1>
      <TimeSlider 
        minDate={minDate}
        maxDate={maxDate}
        currentDate={currentDate}
        onChange={setCurrentDate}
      />
      <h2 className="text-2xl font-bold mt-8 mb-4">Stories</h2>
      {visibleStories.map((story) => (
        <div 
          key={story.id}
          className={`mb-4 p-4 bg-base-200 rounded-lg ${story.id === activeStoryId ? 'border-2 border-primary' : ''}`}
        >
          <div onClick={() => handleStoryClick(story.id)} className="cursor-pointer">
            <h3 className="text-xl font-semibold mb-2">{story.title}</h3>
            <p className="mb-2">{story.description}</p>
            {story.mediaLink && <img src={story.mediaLink} alt={story.title} className="w-full h-auto mb-2" />}
            <p>Start: {new Date(story.startDate).getFullYear()}</p>
            <p>End: {new Date(story.endDate).getFullYear()}</p>
          </div>
          <button
            className="btn btn-secondary btn-sm mt-2"
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails(story.id);
            }}
          >
            {selectedStoryId === story.id ? 'Hide Details' : 'View Details'}
          </button>
          {selectedStoryId === story.id && (
            <StoryDetail story={story} />
          )}
        </div>
      ))}
    </div>
  );
};

export default StoryList;