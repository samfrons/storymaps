

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'storymaps.json');

async function getStoryMaps() {
  const data = await fs.readFile(DATA_FILE_PATH, 'utf8');
  return JSON.parse(data);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const storyMaps = await getStoryMaps();
  const storyMap = storyMaps.find((sm: any) => sm.id === id);
  
  if (storyMap) {
    return NextResponse.json(storyMap);
  } else {
    return NextResponse.json({ error: 'StoryMap not found' }, { status: 404 });
  }
}
