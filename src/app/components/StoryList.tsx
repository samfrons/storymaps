'use client';

import Image from 'next/image';
import React, { useState, useEffect, useRef } from 'react';
import { StoryMap } from '../types';
import StoryDetail from './StoryDetail';

if (typeof window !== 'undefined') {
  window.addEventListener('scroll', (e) => {
    console.log('Window scroll event', e.target);
  }, true);
}

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

  const handleViewDetails = (storyId: string) => {
    setSelectedStoryId(prevId => prevId === storyId ? null : storyId);
  };

  useEffect(() => {
    const handleScroll = (e: Event) => {
      console.log('Scroll event fired on', e.target);
      const scrollElement = e.target as Element;
      const scrollPosition = scrollElement.scrollTop;
      console.log('Scroll position:', scrollPosition);

      const scrollIndicator = document.getElementById('scrollIndicator');
      if (scrollIndicator) {
        scrollIndicator.textContent = scrollPosition.toString();
      }

      const windowHeight = scrollElement.clientHeight;

      let closestStory: { id: string; distance: number } | null = null;

      for (const storyId in storyRefs.current) {
        const element = storyRefs.current[storyId];
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top - scrollElement.getBoundingClientRect().top;
          const elementCenter = elementTop + rect.height / 2;
          const distanceFromCenter = Math.abs(windowHeight / 2 - elementCenter);

          console.log(`Story ${storyId}:`, {
            elementTop,
            elementCenter,
            distanceFromCenter
          });

          if (!closestStory || distanceFromCenter < closestStory.distance) {
            closestStory = { id: storyId, distance: distanceFromCenter };
          }
        }
      }

      if (closestStory) {
        console.log('Closest story:', closestStory.id);
        onStoryActivate(closestStory.id);
      }
    };

    const possibleScrollElements = [
      
      document.querySelector('#story-list-container'),
   
    ];

    possibleScrollElements.forEach(element => {
      if (element) {
        element.addEventListener('scroll', handleScroll, { passive: true });
        console.log('Scroll listener added to', element);
      }
    });

    return () => {
      possibleScrollElements.forEach(element => {
        if (element) {
          element.removeEventListener('scroll', handleScroll);
        }
      });
    };
  }, [onStoryActivate]);

  return (
    <div ref={listRef} id="story-list-container" className="story-list w-full h-full overflow-y-auto p-4">
      <div className="fixed top-0 right-0 bg-black text-white p-2">
        Scroll: <span id="scrollIndicator">0</span>
      </div>
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