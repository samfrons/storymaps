import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const DEFAULT_FILE = 'storymap.json';

async function getStoryMap(filename = DEFAULT_FILE) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    throw error;
  }
}

async function saveStoryMap(storyMap: any, filename = DEFAULT_FILE) {
  const filePath = path.join(DATA_DIR, filename);
  await fs.writeFile(filePath, JSON.stringify(storyMap, null, 2));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('file') || DEFAULT_FILE;
    console.log(`GET request received for /api/storymaps with file: ${filename}`);
    const storyMap = await getStoryMap(filename);
    console.log('Successfully retrieved StoryMap');
    return NextResponse.json(storyMap);
  } catch (error) {
    console.error('Error in GET /api/storymaps:', error);
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return NextResponse.json({ error: 'Data file not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST request received for /api/storymaps');
    const body = await request.json();
    console.log('Request body:', body);

    if (body.action === 'load_sample') {
      const sampleData = await getStoryMap('sample_storymap.json');
      await saveStoryMap(sampleData);
      console.log('Successfully loaded sample StoryMap');
      return NextResponse.json(sampleData, { status: 200 });
    } else if (body.action === 'generate_map') {
      console.log('Generating new map...');
      const newFilename = `generated_map_${Date.now()}.json`;
      const newStoryMap = {
        id: Date.now().toString(),
        location: body.location,
        startYear: body.startYear,
        endYear: body.endYear,
        category: body.category,
        stories: [], // This would be filled with AI-generated stories
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await saveStoryMap(newStoryMap, newFilename);
      console.log(`Successfully generated new StoryMap: ${newFilename}`);
      return NextResponse.json({ filename: newFilename }, { status: 201 });
    } else {
      console.log('Invalid action received');
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in POST /api/storymaps:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace available'
    }, { status: 500 });
  }
}