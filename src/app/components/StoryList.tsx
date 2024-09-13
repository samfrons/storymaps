'use client';

import React from 'react';
import TimeSlider from './TimeSlider';
import { StoryMap } from '../types';


interface StoryListProps {
  visibleStories: StoryMap[];
  activeStoryId: string | null;
  minDate: Date;
  maxDate: Date;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  onStoryClick: (storyId: string) => void;  // Add this line
}

const StoryList: React.FC<StoryListProps> = ({
  visibleStories,
  activeStoryId,
  minDate,
  maxDate,
  currentDate,
  setCurrentDate,
  onStoryClick  // Add this line
}) => {
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
          id={story.id}
          className={`mb-4 p-4 bg-base-200 rounded-lg cursor-pointer ${story.id === activeStoryId ? 'border-2 border-primary' : ''}`}
          onClick={() => onStoryClick(story.id)}
        >
          <h3 className="text-xl font-semibold mb-2">{story.title}</h3>
          <p className="mb-2">{story.description}</p>
          {story.mediaLink && <img src={story.mediaLink} alt={story.title} className="w-full h-auto mb-2" />}
          <p>Start: {new Date(story.startDate).toDateString()}</p>
          <p>End: {new Date(story.endDate).toDateString()}</p>
          <p className="mt-2">{story.longDescription}</p>
        </div>
      ))}
    </div>
  );
};

export default StoryList;