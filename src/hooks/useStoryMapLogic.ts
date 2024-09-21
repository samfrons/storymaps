'use client';

import { useState, useEffect, useCallback } from 'react';
import { StoryMap } from '../types';

export const useStoryMapLogic = () => {
  const [storyMaps, setStoryMaps] = useState<StoryMap[]>([]);
  const [visibleStories, setVisibleStories] = useState<StoryMap[]>([]);
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);
  const [focusedStoryId, setFocusedStoryId] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<Date>(new Date('1930-01-01'));
  const [minDate, setMinDate] = useState<Date>(new Date('1930-01-01'));
  const [maxDate, setMaxDate] = useState<Date>(new Date('1945-12-31'));

  useEffect(() => {
    const fetchStoryMaps = async () => {
      try {
        const response = await fetch('/api/storymaps');
        if (!response.ok) {
          throw new Error('Failed to fetch story maps');
        }
        const data = await response.json();
        setStoryMaps(data);
        
        const dates = data.flatMap(story => [new Date(story.startDate), new Date(story.endDate)]);
        setMinDate(new Date(Math.min(...dates)));
        setMaxDate(new Date(Math.max(...dates)));
      } catch (error) {
        console.error('Error fetching story maps:', error);
      }
    };

    fetchStoryMaps();
  }, []);

  useEffect(() => {
    const filteredStories = storyMaps.filter(story => 
      new Date(story.startDate) <= currentDate && new Date(story.endDate) >= currentDate
    );
    setVisibleStories(filteredStories);
  }, [storyMaps, currentDate]);

  const handleMarkerClick = useCallback((storyId: string) => {
    setActiveStoryId(storyId);
    setFocusedStoryId(storyId);
  }, []);

  const handleStoryFocus = useCallback((storyId: string) => {
    setFocusedStoryId(storyId);
  }, []);

  return {
    storyMaps,
    visibleStories,
    activeStoryId,
    focusedStoryId,
    currentDate,
    minDate,
    maxDate,
    setCurrentDate,
    handleMarkerClick,
    handleStoryFocus,
    setActiveStoryId,
  };
};

export const defaultCoordinates: [number, number] = [32.52, 13.405];
export const defaultZoom = 8;