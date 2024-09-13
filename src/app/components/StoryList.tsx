import React from 'react';

interface Story {
  id: string;
  title: string;
  description: string;
  mediaLink: string;
  startDate: string;
  endDate: string;
  longDescription: string;
}

interface StoryListProps {
  visibleStories: Story[];
  activeStoryId: string | null;
  minDate: Date;
  maxDate: Date;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
}

const StoryList: React.FC<StoryListProps> = ({
  visibleStories,
  activeStoryId,
  minDate,
  maxDate,
  currentDate,
  setCurrentDate
}) => {
  return (
    <div className="w-full h-full overflow-y-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Berlin Historical Tour</h1>
      <h2 className="text-2xl font-bold mt-8 mb-4">Stories</h2>
      {visibleStories.map((story) => (
        <div 
          key={story.id}
          id={story.id}
          className={`mb-4 p-4 bg-base-200 rounded-lg ${story.id === activeStoryId ? 'border-2 border-primary' : ''}`}>
          <h3 className="text-xl font-semibold mb-2">{story.title}</h3>
          <p className="mb-2">{story.description}</p>
          <img src={story.mediaLink} alt={story.title} className="w-full h-auto mb-2" />
          <p>Start: {new Date(story.startDate).toDateString()}</p>
          <p>End: {new Date(story.endDate).toDateString()}</p>
          <p className="mt-2">{story.longDescription}</p>
        </div>
      ))}
    </div>
  );
};

export default StoryList;