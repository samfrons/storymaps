export interface StoryMap {
  id: string;
  title: string;
  description: string | null;
  longDescription: string | null;
  lat: number;
  lng: number;
  startDate: string | null;
  midDate: string | null;
  endDate: string | null;
  media: MediaItem[] | null;
  imageUrls: string[]; 
}




export interface MarkerData {
  id: string;
  position: [number, number];
  popup: string;
}