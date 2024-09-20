export interface StoryMap {
  id: string;
  title: string;
  description: string | null;
  longDescription: string | null;
  lat: number;
  lng: number;
  startDate: number | string | null;
  midDate?: number | string | null;
  endDate: number | string | null;
  media: MediaItem[] | null;
  imageUrls: string[]; 
  zoom?: number;
}


export interface MarkerData {
  id: string;
  position: [number, number];
  popup: string;
  zoom?: number;
}

