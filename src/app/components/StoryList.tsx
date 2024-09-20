'use client';

import Image from 'next/image';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StoryMap } from '../types';
import StoryDetail from './StoryDetail';

interface StoryListProps {
  visibleStories: StoryMap[];
  activeStoryId: string | null;
  minDate: Date;
  maxDate: Date;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  onStoryActivate: (storyId: string) => void;
  onViewFullStory: (storyId: string) => void;
}

const StoryList: React.FC<StoryListProps> = ({
  visibleStories,
  activeStoryId,
  minDate,
  maxDate,
  currentDate,
  setCurrentDate,
  onStoryActivate,
  onViewFullStory
}) => {
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const storyRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const listRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleViewDetails = (storyId: string) => {
    setSelectedStoryId(prevId => prevId === storyId ? null : storyId);
  };

  const debouncedScroll = useCallback(() => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = setTimeout(() => {
      if (!listRef.current) return;

      const scrollPosition = listRef.current.scrollTop;
      const windowHeight = listRef.current.clientHeight;

      let closestStory: { id: string; distance: number } | null = null;

      for (const storyId in storyRefs.current) {
        const element = storyRefs.current[storyId];
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top - listRef.current.getBoundingClientRect().top;
          const elementCenter = elementTop + rect.height / 2;
          const distanceFromCenter = Math.abs(windowHeight / 2 - elementCenter);

          if (!closestStory || distanceFromCenter < closestStory.distance) {
            closestStory = { id: storyId, distance: distanceFromCenter };
          }
        }
      }

      if (closestStory && closestStory.id !== activeStoryId) {
        onStoryActivate(closestStory.id);
      }
    }, 100); // Adjust this delay as needed
  }, [onStoryActivate, activeStoryId]);

  useEffect(() => {
    const listElement = listRef.current;
    if (listElement) {
      listElement.addEventListener('scroll', debouncedScroll);
    }

    return () => {
      if (listElement) {
        listElement.removeEventListener('scroll', debouncedScroll);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [debouncedScroll]);

  useEffect(() => {
    if (activeStoryId && storyRefs.current[activeStoryId]) {
      storyRefs.current[activeStoryId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeStoryId]);

  return (
    <div ref={listRef} className="story-list w-full h-full overflow-y-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Berlin Historical Tour</h1>
      
      <h2 className="text-2xl font-bold mt-8 mb-4">Stories</h2>
      {visibleStories.map((story) => (
        <div 
          key={story.id}
          ref={el => storyRefs.current[story.id] = el}
          className={`story-item mb-4 p-4 bg-base-200 rounded-lg ${story.id === activeStoryId ? 'border-2 border-primary' : ''}`}
        >
          <div onClick={() => onStoryActivate(story.id)} className="cursor-pointer">
            <h3 className="text-xl font-semibold mb-2">{story.title}</h3>
            {story.imageUrls && story.imageUrls.length > 0 && (
              <div className="relative w-full h-48 mb-2">
                <Image
                  src={story.imageUrls[0]}
                  alt={story.title}
                  layout="fill"
                  objectFit="cover"
                  className="rounded"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            )}
            <p>Start: {story.startDate ? new Date(story.startDate).getFullYear() : 'N/A'}</p>
            <p>End: {story.endDate ? new Date(story.endDate).getFullYear() : 'N/A'}</p>
          </div>
          <button
            className="btn btn-secondary btn-sm mt-2 mr-2"
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails(story.id);
            }}
          >
            {selectedStoryId === story.id ? 'Hide Details' : 'View Details'}
          </button>
          <button
            className="btn btn-primary btn-sm mt-2"
            onClick={(e) => {
              e.stopPropagation();
              onViewFullStory(story.id);
            }}
          >
            View Full Story
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