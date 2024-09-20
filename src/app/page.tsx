'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import StoryList from './components/StoryList';
import TimeSlider from './components/TimeSlider';
import SidePanel from './components/SidePanel';
import StoryPopup from './components/StoryPopup';
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
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [minDate, setMinDate] = useState<Date | null>(null);
  const [maxDate, setMaxDate] = useState<Date | null>(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [popupStoryId, setPopupStoryId] = useState<string | null>(null);

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

  const handleStoryActivate = (storyId: string) => {
    setActiveStoryId(storyId);
    setIsSidePanelOpen(false);
  };

  const handleViewFullStory = (storyId: string) => {
    setPopupStoryId(storyId);
  };

  if (!currentDate || !minDate || !maxDate) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen relative">
      <SidePanel
        stories={stories}
        onStoryClick={handleStoryActivate}
        isOpen={isSidePanelOpen}
        onClose={() => setIsSidePanelOpen(false)}
      />
      
      <div className={`flex flex-col md:flex-row w-full transition-all duration-300 ease-in-out ${isSidePanelOpen ? 'ml-64' : 'ml-0'}`}>
        <button
          onClick={toggleSidePanel}
          className="fixed top-4 left-4 z-50 bg-primary text-white px-4 py-2 rounded-full shadow-lg"
        >
          {isSidePanelOpen ? 'Close' : 'Overview'}
        </button>

        <div className="w-full md:w-1/3 h-1/2 md:h-screen order-2 md:order-1 overflow-auto">
          <StoryList
            visibleStories={visibleStories}
            activeStoryId={activeStoryId}
            minDate={minDate}
            maxDate={maxDate}
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            onStoryActivate={handleStoryActivate}
            onViewFullStory={handleViewFullStory}
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
              onMarkerClick={handleStoryActivate}
              activeStoryId={activeStoryId}
              currentDate={currentDate}
              onViewFullStory={handleViewFullStory}
               onStoryActivate={handleStoryActivate}
            />
          </div>
        </div>
      </div>
      {popupStoryId && (
        <StoryPopup
          storyId={popupStoryId}
          onClose={() => setPopupStoryId(null)}
          story={stories.find(s => s.id === popupStoryId)}
        />
      )}
    </div>
  );
}