'use client';

import Image from 'next/image';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
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
  onStoryFocus: (storyId: string) => void;
  focusedStoryId: string | null;
}

const StoryList: React.FC<StoryListProps> = ({
  visibleStories,
  activeStoryId,
  minDate,
  maxDate,
  currentDate,
  setCurrentDate,
  onStoryClick,
  onStoryFocus,
  focusedStoryId
}) => {
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const storyRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const listRef = useRef<HTMLDivElement>(null);

  const handleViewDetails = (storyId: string) => {
    setSelectedStoryId(prevId => prevId === storyId ? null : storyId);
  };

  const handleStoryClick = (storyId: string) => {
    onStoryClick(storyId);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!listRef.current) return;

      const scrollPosition = listRef.current.scrollTop;
      const windowHeight = listRef.current.clientHeight;

      for (const storyId in storyRefs.current) {
        const element = storyRefs.current[storyId];
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top - listRef.current.getBoundingClientRect().top;
          if (elementTop >= 0 && elementTop <= windowHeight / 2) {
            onStoryFocus(storyId);
            break;
          }
        }
      }
    };

    const currentListRef = listRef.current;
    if (currentListRef) {
      currentListRef.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (currentListRef) {
        currentListRef.removeEventListener('scroll', handleScroll);
      }
    };
  }, [onStoryFocus]);

  useEffect(() => {
    if (focusedStoryId && storyRefs.current[focusedStoryId]) {
      storyRefs.current[focusedStoryId]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [focusedStoryId]);

  return (
    <div ref={listRef} className="w-full h-full overflow-y-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Berlin Historical Tour</h1>
      
      <h2 className="text-2xl font-bold mt-8 mb-4">Stories</h2>
      {visibleStories.map((story) => (
        <div 
          key={story.id}
          ref={el => storyRefs.current[story.id] = el}
          className={`story-item mb-4 p-4 bg-base-200 rounded-lg ${story.id === activeStoryId ? 'border-2 border-primary' : ''}`}
        >
          <div onClick={() => handleStoryClick(story.id)} className="cursor-pointer">
            <Link href={`/story/${story.id}`}>
              <h3 className="text-xl font-semibold mb-2">{story.title}</h3>
            </Link>
            {story.imageUrls && story.imageUrls.length > 0 && (
              <div className="relative w-full h-48 mb-2">
                <Image
                  src={story.imageUrls[0]}
                  alt={story.title}
                  layout="fill"
                  objectFit="cover"
                  className="rounded"
                />
              </div>
            )}
            <p className="mb-2">{story.description}</p>
            {story.mediaLink && <img src={story.mediaLink} alt={story.title} className="w-full h-auto mb-2" />}
            <p>Start: {story.startDate ? new Date(story.startDate).getFullYear() : 'N/A'}</p>
            <p>End: {story.endDate ? new Date(story.endDate).getFullYear() : 'N/A'}</p>
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