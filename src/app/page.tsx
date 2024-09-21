'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import StoryList from './components/StoryList';
import TimeSlider from './components/TimeSlider';
import SidePanel from './components/SidePanel';
import StoryPopup from './components/StoryPopup';
import { StoryMap } from '../types';
import MapMaker from './components/MapMaker';

const Map = dynamic(() => import('./components/Map'), { ssr: false });

export const defaultCoordinates: [number, number] = [52.52, 13.405];
export const defaultZoom = 13; // Increased default zoom

function createDateFromYear(year: number | string | null): Date | null {
  if (year === null || year === "") return null;
  const yearNum = typeof year === 'string' ? parseInt(year, 10) : year;
  if (isNaN(yearNum)) return null;
  return new Date(yearNum, 0, 1);
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
  const [showMapMaker, setShowMapMaker] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [mapCenter, setMapCenter] = useState<[number, number]>(defaultCoordinates);
  const [mapZoom, setMapZoom] = useState(defaultZoom);
  const [currentFile, setCurrentFile] = useState('storymap.json');
  const toggleSidePanel = useCallback(() => setIsSidePanelOpen(prev => !prev), []); 
 
  const fetchStories = useCallback(async (filename: string) => {
    try {
      const response = await fetch(`/api/storymaps?file=${filename}`);
      const data = await response.json();
      
      const processedData = data.map((story: StoryMap) => ({
        ...story,
        startDate: createDateFromYear(story.startDate),
        midDate: createDateFromYear(story.midDate),
        endDate: createDateFromYear(story.endDate)
      }));

      setStories(processedData);
      setVisibleStories(processedData);

      // Update map view based on new stories
      if (processedData.length > 0) {
        const lats = processedData.map(s => Number(s.lat));
        const lngs = processedData.map(s => Number(s.lng));
        const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
        const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
        setMapCenter([centerLat, centerLng]);

        // Calculate appropriate zoom level
        const latDiff = Math.max(...lats) - Math.min(...lats);
        const lngDiff = Math.max(...lngs) - Math.min(...lngs);
        const maxDiff = Math.max(latDiff, lngDiff);
        const newZoom = Math.floor(15 - Math.log2(maxDiff));
        const finalZoom = Math.max(defaultZoom, Math.min(newZoom, 13));
        setMapZoom(finalZoom);

        console.log('Calculated zoom:', newZoom);
        console.log('Final zoom:', finalZoom);
      } else {
        // If no stories, reset to default view
        setMapCenter(defaultCoordinates);
        setMapZoom(defaultZoom);
        console.log('No stories, using default zoom:', defaultZoom);
      }

      // Update date range
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
  }, []);

  useEffect(() => {
    fetchStories(currentFile);
  }, [fetchStories, currentFile]);

  const handleStoryActivate = useCallback((storyId: string) => {
    setActiveStoryId(storyId);
    setIsSidePanelOpen(false);
  }, []);

  const handleViewFullStory = useCallback((storyId: string) => {
    setPopupStoryId(storyId);
  }, []);

  const closeSidePanel = useCallback(() => setIsSidePanelOpen(false), []);

  const handleMapUpdate = useCallback((filename: string) => {
    setCurrentFile(filename);
  }, []);

  const memoizedStories = useMemo(() => stories, [stories]);

  if (!currentDate || !minDate || !maxDate) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen relative">
      <SidePanel
        stories={memoizedStories}
        onStoryClick={handleStoryActivate}
        isOpen={isSidePanelOpen}
        onClose={closeSidePanel}
      />
      
      <div className={`flex flex-col md:flex-row w-full transition-all duration-300 ease-in-out ${isSidePanelOpen ? 'ml-64' : 'ml-0'}`}>
        <button
          onClick={toggleSidePanel}
          className="fixed top-4 left-4 z-50 bg-primary text-white px-4 py-2 rounded-full shadow-lg"
          aria-label={isSidePanelOpen ? "Close overview" : "Open overview"}
        >
          {isSidePanelOpen ? 'Close' : 'Overview'}
        </button>

        <button
          onClick={() => setShowMapMaker(prev => !prev)}
          className="fixed top-4 right-4 z-50 bg-primary text-white px-4 py-2 rounded-full shadow-lg"
        >
          {showMapMaker ? 'Close Map Maker' : 'Open Map Maker'}
        </button>

        {showMapMaker ? (
          <div className="w-full h-full">
           <MapMaker onUpdate={handleMapUpdate} />
          </div>
        ) : (
          <>
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
                center={mapCenter}
                zoom={mapZoom}
                onMarkerClick={handleStoryActivate}
                activeStoryId={activeStoryId}
                currentDate={currentDate}
                onViewFullStory={handleViewFullStory}
              />
              </div>
            </div>
          </>
        )}
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