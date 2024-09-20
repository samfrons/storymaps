import React from 'react';
import { StoryMap } from '../types';

interface SidePanelProps {
  stories: StoryMap[];
  onStoryClick: (storyId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const SidePanel: React.FC<SidePanelProps> = ({ stories, onStoryClick, isOpen, onClose }) => {
  const formatDate = (date: Date | null): string => {
    if (!date) return 'N/A';
    return date.getFullYear().toString();
  };

  return (
    <div 
      className={`fixed left-0 top-0 h-full w-64 bg-base-200 p-4 overflow-y-auto shadow-lg z-40 transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <button 
        onClick={onClose}
        className="absolute top-2 right-2 text-xl font-bold"
      >
        &times;
      </button>
      <h2 className="text-xl font-bold mb-4">Locations Overview</h2>
      <ul>
        {stories.map((story) => (
          <li key={story.id} className="mb-4">
            <h3 
              className="text-lg font-semibold cursor-pointer hover:text-primary"
              onClick={() => onStoryClick(story.id)}
            >
              {story.title}
            </h3>
            <p className="text-sm text-gray-600">
              {formatDate(story.startDate)} - {formatDate(story.endDate)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SidePanel;