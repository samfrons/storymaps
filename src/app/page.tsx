import dynamic from 'next/dynamic'

const Map = dynamic(() => import('./components/Map'), { ssr: false })

interface Chapter {
  title: string;
  description: string;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  startDate?: string;
  endDate?: string;
  media: {
    type: string;
    url: string;
  }[] | [];
}

interface StoryMap {
  id: string;
  title: string;
  author: string;
  description: string;
  chapters: Chapter[];
}

async function getStoryMaps() {
  try {
    console.log('Fetching StoryMaps...');
    const res = await fetch('http://localhost:3001/api/storymaps', { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`Failed to fetch story maps: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    console.log('Fetched StoryMaps:', data);
    return data as StoryMap[];
  } catch (error) {
    console.error('Error fetching StoryMaps:', error);
    return [];
  }
}

export default async function Home() {
  const storyMaps = await getStoryMaps();
  console.log('StoryMaps in Home component:', storyMaps);

  const markers = storyMaps.flatMap((storyMap) =>
    storyMap.chapters.map((chapter) => ({
      id: `${storyMap.id}-${chapter.title}`,
      position: [chapter.location.lat, chapter.location.lng] as [number, number],
      popup: `${storyMap.title}: ${chapter.title}`
    }))
  );
  console.log('Generated markers:', markers);

  return (
    <main className="p-4">
      <h1 className="text-3xl font-bold mb-4">StoryMap Cluster</h1>
      <div className="h-[600px]">
        <Map markers={markers} />
      </div>
    </main>
  )
}