import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { CohereClient } from 'cohere-ai';

const DATA_DIR = path.join(process.cwd(), 'data');
const DEFAULT_FILE = 'storymap.json';

// Initialize Cohere client
const cohereApiKey = process.env.COHERE_API_KEY;
const cohereClient = new CohereClient({
  token: cohereApiKey,
});

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
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


export async function POST(request: NextRequest) {
  try {
    console.log('POST request received for /api/storymaps');
    const body = await request.json();
    console.log('Request body:', body);

    if (body.action === 'generate_map') {
      console.log('Generating new map...');
      const newFilename = `generated_map_${Date.now()}.json`;
      
      // Generate story content using Cohere
      const storyPrompt = `Generate 2 historical stories about ${body.topic} in ${body.place} generally between ${body.startYear} and ${body.endYear}. Return the result as a JSON array with each story having this structure:
      {
        "id": number,
        "title": string,
        "description": string,
        "category": string,
        "address": string,
        "lat": number,
        "lng": number,
        "startDate": number,
        "endDate": number,
        "author": string,
        "imageUrls": string[]
      }
      Make sure the lat and lng are realistic coordinates for the given place, and that the startDate and endDate are within the specified year range.`;
      
      const response = await cohereClient.generate({
        model: 'command-nightly',
        prompt: storyPrompt,
        max_tokens: 1000,
        temperature: 0.7,
        k: 0,
        stop_sequences: [],
        return_likelihoods: 'NONE'
      });

      let generatedStories;
      try {
        generatedStories = JSON.parse(response.generations[0].text);
      } catch (error) {
        console.error('Error parsing generated stories:', error);
        console.log('Raw response:', response.generations[0].text);
        generatedStories = [];
      }

      const newStoryMap = {
        id: Date.now().toString(),
        topic: body.topic,
        place: body.place,
        startYear: body.startYear,
        endYear: body.endYear,
        stories: generatedStories,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveStoryMap(newStoryMap, newFilename);
      console.log(`Successfully generated new StoryMap: ${newFilename}`);
      return NextResponse.json({ filename: newFilename, storyMap: newStoryMap }, { status: 201 });
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