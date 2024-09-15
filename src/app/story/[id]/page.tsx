'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { StoryMap } from '../../../types';
import StoryDetail from '../../components/StoryDetail';

export default function StoryPage() {
  const [story, setStory] = useState<StoryMap | null>(null);
  const { id } = useParams();

  useEffect(() => {
    async function fetchStory() {
      const response = await fetch(`/api/storymaps/${id}`);
      if (response.ok) {
        const data = await response.json();
        setStory(data);
      }
    }
    fetchStory();
  }, [id]);

  if (!story) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
    <Link href="/" className="text-blue-500 hover:underline mb-4 inline-block">
  &larr; Back to Map
</Link>
      <h1 className="text-2xl font-bold mb-4">{story.title}</h1>
      <StoryDetail story={story} />
    </div>
  );
}