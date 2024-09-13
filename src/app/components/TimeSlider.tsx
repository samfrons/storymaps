// File: app/components/TimeSlider.tsx

'use client';

import React, { useState } from 'react';


interface TimeSliderProps {
  minDate: Date;
  maxDate: Date;
  currentDate: Date;
  onChange: (date: Date) => void;
}

const TimeSlider: React.FC<TimeSliderProps> = ({ minDate, maxDate, currentDate, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(parseInt(e.target.value));
    onChange(newDate);
  };

  return (
    <div className="w-full p-4 bg-base-200 rounded-lg">
      <input
        type="range"
        min={minDate.getTime()}
        max={maxDate.getTime()}
        value={currentDate.getTime()}
        onChange={handleChange}
        className="w-full"
      />
      <div className="text-center mt-2">{currentDate.toDateString()}</div>
    </div>
  );
};

export default TimeSlider;