'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { StoryMap } from '../types';
import StoryDetail from './StoryDetail';

const StoryPage: React.FC = () => {
  const [story, setStory] = useState<StoryMap | null>(null);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const id = params?.id as string;

  useEffect(() => {
    const fetchStory = async () => {
      try {
        console.log(`Fetching story with id: ${id}`);
        const response = await fetch(`/api/storymaps/${id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch story: ${response.statusText}`);
        }
        const data = await response.json();
        console.log('Fetched story data:', data);
        setStory(data);
      } catch (error) {
        console.error('Error fetching story:', error);
        setError('Failed to load story. Please try again later.');
      }
    };

    if (id) {
      fetchStory();
    }
  }, [id]);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!story) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{story.title}</h1>
      <StoryDetail story={story} />
    </div>
  );
};

export default StoryPage;