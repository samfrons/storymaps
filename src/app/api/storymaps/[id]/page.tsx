'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { StoryMap } from '../../../types';
import StoryDetail from '../../../components/StoryPage';

export default function StoryPage() {
  const [story, setStory] = useState<StoryMap | null>(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const response = await fetch(`/api/storymaps/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch story');
        }
        const data = await response.json();
        setStory(data);
      } catch (error) {
        console.error('Error fetching story:', error);
      }
    };

    if (id) {
      fetchStory();
    }
  }, [id]);

  if (!story) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{story.title}</h1>
      <StoryDetail story={story} />
    </div>
  );
}