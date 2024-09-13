// File: client/src/app/api/storymaps/[id]/route.ts


import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'storymaps.json');

async function getStoryMaps() {
  const data = await fs.readFile(DATA_FILE_PATH, 'utf8');
  return JSON.parse(data);
}

async function saveStoryMaps(storyMaps: any[]) {
  await fs.writeFile(DATA_FILE_PATH, JSON.stringify(storyMaps, null, 2), 'utf8');
}

async function checkFilePermissions() {
  try {
    await fs.access(DATA_FILE_PATH, fs.constants.R_OK | fs.constants.W_OK);
    console.log('File permissions are correct');
  } catch (error) {
    console.error('File permission error:', error);
    throw new Error('Cannot read or write to the data file. Please check file permissions.');
  }
}

// Then, in your API route handlers:
export async function GET() {
  try {
    await checkFilePermissions();
    // Rest of your GET logic
  } catch (error) {
    console.error('Error in GET /api/storymaps:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}


export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const updatedStoryMap = await request.json();
  const storyMaps = await getStoryMaps();
  const index = storyMaps.findIndex((sm: any) => sm.id === id);
  
  if (index !== -1) {
    storyMaps[index] = { ...storyMaps[index], ...updatedStoryMap, id };
    await saveStoryMaps(storyMaps);
    return NextResponse.json(storyMaps[index]);
  } else {
    return NextResponse.json({ error: 'StoryMap not found' }, { status: 404 });
  }
}


export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  console.log('Attempting to delete StoryMap with id:', id);

  try {
    const storyMaps = await getStoryMaps();
    console.log('Current number of StoryMaps:', storyMaps.length);

    const filteredStoryMaps = storyMaps.filter((sm: any) => sm.id !== id);
    console.log('Number of StoryMaps after filtering:', filteredStoryMaps.length);
    
    if (filteredStoryMaps.length < storyMaps.length) {
      await saveStoryMaps(filteredStoryMaps);
      console.log('StoryMap deleted successfully');
      return NextResponse.json({ message: 'StoryMap deleted' });
    } else {
      console.log('StoryMap not found for deletion');
      return NextResponse.json({ error: 'StoryMap not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error in DELETE /api/storymaps/[id]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}