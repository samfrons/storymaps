'use client';

import React, { useEffect, useState } from 'react';
import { StoryMap } from '../types';
import dynamic from 'next/dynamic';

const StoryDetail = dynamic(() => import('./StoryDetail'), { ssr: false });

interface StoryPopupProps {
  storyId: string | null;
  onClose: () => void;
}

const StoryPopup: React.FC<StoryPopupProps> = ({ storyId, onClose }) => {
  const [story, setStory] = useState<StoryMap | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

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
        // Trigger the open animation after fetching the data
        setTimeout(() => setIsOpen(true), 50);
      } catch (error) {
        console.error('Error fetching story:', error);
        setError('Failed to load story. Please try again later.');
      }
    };

    fetchStory();

    // Clean up function
    return () => {
      setIsOpen(false);
    };
  }, [storyId]);

  if (!storyId) return null;

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 300); // Wait for the closing animation to finish
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-all duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        <button onClick={handleClose} className="float-right text-xl">&times;</button>
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