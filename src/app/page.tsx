'use client';
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic'
import StoryList from './components/StoryList';
import { useStoryMapLogic, berlinCoordinates, defaultZoom } from '../hooks/useStoryMapLogic';


const Map = dynamic(() => import('./components/Map'), { ssr: false })

export default function Home() {
  const {
    storyMaps,
    visibleStories,
    activeStoryId,
    currentDate,
    minDate,
    maxDate,
    setCurrentDate,
    handleMarkerClick,
    testMarkers
  } = useStoryMapLogic();


  return (
    <main className="p-4">
    <div className="flex flex-col md:flex-row h-screen">
      <h1 className="text-3xl font-bold mb-4">StoryMap Cluster</h1>
      <div className="w-full md:w-1/3 h-1/2 md:h-screen order-2 md:order-1">
        <StoryList
          visibleStories={visibleStories}
          activeStoryId={activeStoryId}
          minDate={minDate}
          maxDate={maxDate}
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
        />
      </div>
      <div className="w-full md:w-2/3 h-1/2 md:h-screen order-1 md:order-2">
        <Map storyMaps={storyMaps} />
      </div>
      </div>
    </main>
  )
}