// File: app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import StoryList from './components/StoryList';
import TimeSlider from './components/TimeSlider';
import { StoryMap } from '../types';

const Map = dynamic(() => import('./components/Map'), { ssr: false });

export const berlinCoordinates: [number, number] = [52.52, 13.405];
export const defaultZoom = 12;

export default function Home() {
  const [stories, setStories] = useState<StoryMap[]>([]);
  const [visibleStories, setVisibleStories] = useState<StoryMap[]>([]);
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<Date>(new Date('1930-01-01'));
  const [minDate, setMinDate] = useState<Date | null>(null);
  const [maxDate, setMaxDate] = useState<Date | null>(null);

  useEffect(() => {
    // Fetch stories data
    const fetchStories = async () => {
      try {
        const response = await fetch('/api/storymaps');
        const data = await response.json();
        setStories(data);

        // Set min and max dates
        const dates = data.flatMap(story => [
          story.startDate ? new Date(story.startDate) : null,
          story.midDate ? new Date(story.midDate) : null,
          story.endDate ? new Date(story.endDate) : null
        ]).filter(Boolean) as Date[];

        if (dates.length > 0) {
          setMinDate(new Date(Math.min(...dates)));
          setMaxDate(new Date(Math.max(...dates)));
          setCurrentDate(new Date(Math.min(...dates))); // Set current date to min date initially
        }
      } catch (error) {
        console.error('Error fetching stories:', error);
      }


    };

    fetchStories();
  }, []);

/* filter removal
  useEffect(() => {
   
    const filteredStories = stories.filter(story => 
      (!story.startDate || new Date(story.startDate) <= currentDate) &&
      (!story.endDate || new Date(story.endDate) >= currentDate)
    );
    setVisibleStories(filteredStories);
  }, [stories, currentDate]); */


   useEffect(() => {
    setVisibleStories(stories);
  }, [stories]);

  const handleStoryClick = (storyId: string) => {
    setActiveStoryId(storyId);
    setActiveMarkerId(storyId);
  };

  const handleMarkerClick = (id: string) => {
    setActiveMarkerId(id);
    setActiveStoryId(id);
  };

  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);



  return (
    <div className="flex flex-col md:flex-row h-screen">
      <div className="w-full md:w-1/3 h-1/2 md:h-screen order-2 md:order-1 overflow-auto">
         <TimeSlider
          minDate={minDate}
          maxDate={maxDate}
          currentDate={currentDate}
          onChange={setCurrentDate}
        />
        <StoryList
          visibleStories={visibleStories}
          activeStoryId={activeStoryId}
          onStoryClick={handleStoryClick}
        />
      
      </div>
      <div className="w-full md:w-2/3 h-1/2 md:h-screen order-1 md:order-2">
        <Map
          stories={visibleStories}
          center={berlinCoordinates}
          zoom={defaultZoom}
          onMarkerClick={handleStoryClick}
          activeMarkerId={activeStoryId}
          currentYear={currentDate.getFullYear()}
        />
      </div>
    </div>
  );
}