import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'storymaps.json');

async function getStoryMaps() {
  try {
    const data = await fs.readFile(DATA_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading storymaps.json:', error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('GET request received for /api/storymaps');
    const storyMaps = await getStoryMaps();
    console.log('StoryMaps data:', storyMaps);
    return NextResponse.json(storyMaps);
  } catch (error) {
    console.error('Error in GET /api/storymaps:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}