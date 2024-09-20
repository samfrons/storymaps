'use client';

import React, { useEffect, useState } from 'react';
import { StoryMap } from '../types';
import StoryDetail from './StoryDetail';

interface StoryPopupProps {
  storyId: string | null;
  onClose: () => void;
}

const StoryPopup: React.FC<StoryPopupProps> = ({ storyId, onClose }) => {
  const [story, setStory] = useState<StoryMap | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStory = async () => {
      if (!storyId) return;

      try {
        const response = await fetch(`/api/storymaps/${storyId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch story: ${response.statusText}`);
        }
        const data = await response.json();
        setStory(data);
      } catch (error) {
        console.error('Error fetching story:', error);
        setError('Failed to load story. Please try again later.');
      }
    };

    fetchStory();
  }, [storyId]);

  if (!storyId) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="float-right text-xl">&times;</button>
        {error ? (
          <div className="text-red-500">{error}</div>
        ) : !story ? (
          <div>Loading...</div>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-4">{story.title}</h1>
            <StoryDetail story={story} />
          </>
        )}
      </div>
    </div>
  );
};

export default StoryPopup;