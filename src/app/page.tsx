'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import StoryList from './components/StoryList';
import TimeSlider from './components/TimeSlider';
import SidePanel from './components/SidePanel';
import { StoryMap } from '../types';


const Map = dynamic(() => import('./components/Map'), { ssr: false });

export const berlinCoordinates: [number, number] = [52.52, 13.405];
export const defaultZoom = 12;

function createDateFromYear(year: number | string | null): Date | null {
  if (year === null || year === "") return null;
  const yearNum = typeof year === 'string' ? parseInt(year, 10) : year;
  if (isNaN(yearNum)) return null;
  return new Date(yearNum, 0, 1); // January 1st of the given year
}

export default function Home() {
  const [stories, setStories] = useState<StoryMap[]>([]);
  const [visibleStories, setVisibleStories] = useState<StoryMap[]>([]);
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);
  const [focusedStoryId, setFocusedStoryId] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [minDate, setMinDate] = useState<Date | null>(null);
  const [maxDate, setMaxDate] = useState<Date | null>(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const mapRef = useRef<any>(null);

  const toggleSidePanel = () => setIsSidePanelOpen(prev => !prev);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await fetch('/api/storymaps');
        const data = await response.json();
        
        const processedData = data.map((story: StoryMap) => ({
          ...story,
          startDate: createDateFromYear(story.startDate),
          midDate: createDateFromYear(story.midDate),
          endDate: createDateFromYear(story.endDate)
        }));

        setStories(processedData);

        const allDates = processedData.flatMap(story => 
          [story.startDate, story.midDate, story.endDate].filter(Boolean)
        ) as Date[];

        if (allDates.length > 0) {
          const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
          const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
          setMinDate(minDate);
          setMaxDate(maxDate);
          setCurrentDate(minDate);
        }
      } catch (error) {
        console.error('Error fetching stories:', error);
      }
    };

    fetchStories();
  }, []);

  useEffect(() => {
    setVisibleStories(stories);
  }, [stories]);

  const handleStoryClick = (storyId: string) => {
    setActiveStoryId(storyId);
    setFocusedStoryId(storyId);
    setIsSidePanelOpen(false);
    const story = stories.find(s => s.id === storyId);
    if (story && mapRef.current) {
      mapRef.current.flyTo([story.latitude, story.longitude], defaultZoom);
    }
  };

  const handleMarkerClick = (id: string) => {
    setActiveStoryId(id);
    setFocusedStoryId(id);
  };

  const handleStoryFocus = (storyId: string) => {
    setFocusedStoryId(storyId);
    const story = stories.find(s => s.id === storyId);
    if (story && mapRef.current) {
      mapRef.current.flyTo([story.latitude, story.longitude], defaultZoom);
    }
  };

  if (!currentDate || !minDate || !maxDate) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen relative">
      <button
        onClick={toggleSidePanel}
        className="fixed top-4 left-4 z-50 bg-primary text-white px-4 py-2 rounded-full shadow-lg"
      >
        {isSidePanelOpen ? 'Close' : 'Overview'}
      </button>

      <SidePanel
        stories={stories}
        onStoryClick={handleStoryClick}
        isOpen={isSidePanelOpen}
        onClose={() => setIsSidePanelOpen(false)}
      />

      <div className="w-full md:w-1/3 h-1/2 md:h-screen order-2 md:order-1 overflow-auto">
        <StoryList
          visibleStories={visibleStories}
          activeStoryId={activeStoryId}
          onStoryClick={handleStoryClick}
          onStoryFocus={handleStoryFocus}
          minDate={minDate}
          maxDate={maxDate}
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
        />
      </div>
      <div className="w-full md:w-2/3 h-1/2 md:h-screen order-1 md:order-2 flex flex-col">
        <div className="h-16">
          <TimeSlider
            minDate={minDate}
            maxDate={maxDate}
            currentDate={currentDate}
            onChange={setCurrentDate}
          />
        </div>
        <div className="flex-1">
          <Map
            stories={visibleStories}
            center={berlinCoordinates}
            zoom={defaultZoom}
            onMarkerClick={handleMarkerClick}
            activeMarkerId={activeStoryId}
            currentDate={currentDate}
            focusedStoryId={focusedStoryId}
            ref={mapRef}
          />
        </div>
      </div>
    </div>
  );
}