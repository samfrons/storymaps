// hooks/useMarkerStates.ts

import { useMemo } from 'react';
import { StoryMap } from '../types';

export const useMarkerStates = (stories: StoryMap[], currentYear: number) => {
  return useMemo(() => {
    return stories.map(story => {
      const startYear = story.startDate ? new Date(story.startDate).getFullYear() : null;
      const midYear = story.midDate ? new Date(story.midDate).getFullYear() : null;
      const endYear = story.endDate ? new Date(story.endDate).getFullYear() : null;

      let state = 'normal';
      
      if (startYear && currentYear >= startYear) {
        state = 'active';
        
        if (midYear && currentYear >= midYear) {
          state = 'overtaken';
        }
        
        if (endYear && currentYear >= endYear) {
          state = 'closed';
        }
      } 


      /* else if (startYear && currentYear < startYear) {
        state = 'future';
      } */

      return { id: story.id, state };
    });
  }, [stories, currentYear]);
};