import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'storymap.json');
const SAMPLE_FILE_PATH = path.join(process.cwd(), 'data', 'sample_storymap.json');

async function getStoryMap() {
  try {
    const data = await fs.readFile(DATA_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading storymap.json:', error);
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      console.error('File not found. Please ensure storymap.json exists in the data directory.');
    }
    throw error;
  }
}

async function saveStoryMap(storyMap: any) {
  await fs.writeFile(DATA_FILE_PATH, JSON.stringify(storyMap, null, 2));
}

export async function GET(request: NextRequest) {
  try {
    console.log('GET request received for /api/storymaps');
    const storyMap = await getStoryMap();
    console.log('Successfully retrieved StoryMap');
    return NextResponse.json(storyMap);
  } catch (error) {
    console.error('Error in GET /api/storymaps:', error);
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return NextResponse.json({ error: 'Data file not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST request received for /api/storymaps');
    const body = await request.json();

    if (body.action === 'load_sample') {
      // Load the sample data
      const sampleData = await fs.readFile(SAMPLE_FILE_PATH, 'utf8');
      const sampleStoryMap = JSON.parse(sampleData);

      // Save the sample data to the main storymap.json file
      await saveStoryMap(sampleStoryMap);

      console.log('Successfully loaded sample StoryMap');
      return NextResponse.json(sampleStoryMap, { status: 200 });
    } else {
      // Existing story map generation logic
      const { location, startYear, endYear, category } = body;

      if (!location || !startYear || !endYear) {
        return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
      }

      // 1. Get coordinates for the location
      const geocodingResponse = await axios.get(
        `https://api.openstreetmap.org/nominatim/search?format=json&q=${encodeURIComponent(location)}`
      );
      const [locationData] = geocodingResponse.data;
      
      if (!locationData) {
        return NextResponse.json({ error: 'Location not found' }, { status: 404 });
      }

      const { lat, lon: lng } = locationData;

      // 2. Generate historical events
      const stories = await generateHistoricalEvents(location, startYear, endYear, category, lat, lng);

      // 3. Create new story map
      const newStoryMap = {
        id: Date.now().toString(),
        location,
        startYear,
        endYear,
        category,
        lat,
        lng,
        stories,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 4. Save the new story map, replacing any existing content
      await saveStoryMap(newStoryMap);

      console.log('Successfully generated and saved new StoryMap');
      return NextResponse.json(newStoryMap, { status: 201 });
    }
  } catch (error) {
    console.error('Error in POST /api/storymaps:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

async function generateHistoricalEvents(location: string, startYear: number, endYear: number, category: string, lat: number, lng: number) {
  // This is a placeholder function. In a real application, you would implement
  // logic here to generate historical events, possibly using an AI service.
  return [
    {
      id: Date.now().toString(),
      title: `Event in ${location} 1`,
      description: `A historical event that occurred in ${location}`,
      startDate: startYear,
      endDate: endYear,
      category,
      lat,
      lng,
    },
    {
      id: (Date.now() + 1).toString(),
      title: `Event in ${location} 2`,
      description: `Another historical event that occurred in ${location}`,
      startDate: startYear + 10,
      endDate: endYear - 10,
      category,
      lat: lat + 0.01,
      lng: lng + 0.01,
    },
  ];
}