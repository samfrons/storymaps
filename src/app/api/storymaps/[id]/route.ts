// src/app/api/storymaps/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'storymaps.json');

async function getStoryMap(id: string) {
  const data = await fs.readFile(DATA_FILE_PATH, 'utf8');
  const storyMaps = JSON.parse(data);
  return storyMaps.find((story: any) => story.id === id);
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const story = await getStoryMap(params.id);
    if (story) {
      return NextResponse.json(story);
    } else {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error in GET /api/storymaps/[id]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}