import { useMemo } from 'react';
import { StoryMap } from '../types';

export const useMarkerStates = (stories: StoryMap[], currentDate: Date, focusedStoryId: string | null) => {
  return useMemo(() => {
    return stories.map(story => {
      const startDate = new Date(story.startDate);
      const endDate = new Date(story.endDate);
      const midDate = story.midDate ? new Date(story.midDate) : null;

      let state = 'future';
      
      if (currentDate >= startDate) {
        state = 'active';
        
        if (midDate && currentDate >= midDate) {
          state = 'overtaken';
        }
        
        if (currentDate >= endDate) {
          state = 'closed';
        }
      }

      // Set the state to 'active' if this story is focused
      if (story.id === focusedStoryId) {
        state = 'active';
      }

      return { id: story.id, state };
    });
  }, [stories, currentDate, focusedStoryId]);
};