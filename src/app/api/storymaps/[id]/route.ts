import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'db2.json');

async function getStoryMap(id: string) {
  try {
    const data = await fs.readFile(DATA_FILE_PATH, 'utf8');
    const storyMaps = JSON.parse(data);
    // Convert id to number if the IDs in your JSON are numbers
    const numericId = parseInt(id, 10);
    return storyMaps.find((story: any) => story.id === numericId || story.id === id);
  } catch (error) {
    console.error('Error reading db2.json:', error);
    throw error;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const story = await getStoryMap(params.id);
    if (story) {
      return NextResponse.json(story);
    } else {
      console.log(`Story with id ${params.id} not found`);
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error in GET /api/storymaps/[id]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}