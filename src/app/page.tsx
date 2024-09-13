import dynamic from 'next/dynamic'

const Map = dynamic(() => import('./components/Map'), { ssr: false })

interface StoryMap {
  id: string;
  title: string;
  author: string;
  description: string;
  address: string;
  lat: number;
  lng: number;
  startDate: string | null;
  midDate: string | null;
  endDate: string | null;
  category: string;
  media: any[];
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

  return (
    <main className="p-4">
      <h1 className="text-3xl font-bold mb-4">StoryMap Cluster</h1>
      <div className="h-[600px]">
        <Map storyMaps={storyMaps} />
      </div>
    </main>
  )
}