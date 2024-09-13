export interface StoryMap {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  lat: number;
  lng: number;
  startDate: string;
  endDate: string;
  mediaLink: string;
}


export interface MarkerData {
  id: string;
  position: [number, number];
  popup: string;
}