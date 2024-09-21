import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

const DATA_DIR = path.join(process.cwd(), 'data');
const DEFAULT_FILE = 'storymap.json';

// Initialize Google AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

async function ensureDataDirectoryExists() {
  try {
    await fs.access(DATA_DIR);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(DATA_DIR, { recursive: true });
    } else {
      throw error;
    }
  }
}

async function getStoryMap(filename = DEFAULT_FILE) {
  await ensureDataDirectoryExists();
  try {
    const filePath = path.join(DATA_DIR, filename);
    
    try {
      await fs.access(filePath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        const defaultStoryMap = {
          id: 'default',
          topic: 'Default Topic',
          place: 'Default Place',
          startYear: 2000,
          endYear: 2023,
          stories: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await saveStoryMap(defaultStoryMap, filename);
        return defaultStoryMap;
      }
      throw error;
    }

    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading or creating ${filename}:`, error);
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
     // const newFilename = `generated_map_${Date.now()}.json`; 
      await saveStoryMap(newStoryMap, DEFAULT_FILE);
      
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
      Make sure the lat and lng are realistic coordinates for the given place, and that the startDate and endDate are within the specified year range. The description should not be more than 20 words.`;
      
      const result = await model.generateContent(storyPrompt);
      const response = await result.response;
      const responseText = response.text();

      let generatedStories;
      try {
        generatedStories = JSON.parse(responseText || '[]');
      } catch (error) {
        console.error('Error parsing generated stories:', error);
        console.log('Raw response:', responseText);
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
    //  console.log(`Successfully generated new StoryMap: ${newFilename}`);
    //  return NextResponse.json({ filename: newFilename, storyMap: newStoryMap }, { status: 201 });
      console.log(`Successfully updated StoryMap: ${DEFAULT_FILE}`);
      return NextResponse.json({ filename: DEFAULT_FILE, storyMap: newStoryMap }, { status: 200 });


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