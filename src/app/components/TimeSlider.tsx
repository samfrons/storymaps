'use client';

import React, { useEffect, useState } from 'react';

interface TimeSliderProps {
  minDate: Date | null;
  maxDate: Date | null;
  currentDate: Date;
  onChange: (date: Date) => void;
}

const TimeSlider: React.FC<TimeSliderProps> = ({ minDate, maxDate, currentDate, onChange }) => {
  const [sliderValue, setSliderValue] = useState<number | null>(null);

  useEffect(() => {
    if (currentDate && !isNaN(currentDate.getTime())) {
      setSliderValue(currentDate.getTime());
    }
  }, [currentDate]);

  if (!minDate || !maxDate || !sliderValue) {
    return <div>Loading...</div>;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    setSliderValue(newValue);
    onChange(new Date(newValue));
  };

  const formatYear = (date: Date) => {
    return date.getFullYear().toString();
  };

  return (
    <div className="w-full p-4 bg-base-200 rounded-lg">
      <input
        type="range"
        min={minDate.getTime()}
        max={maxDate.getTime()}
        value={sliderValue}
        onChange={handleChange}
        className="w-full"
      />
      <div className="flex justify-between mt-2 text-sm">
        <span>{formatYear(minDate)}</span>
        <span>{formatYear(new Date(sliderValue))}</span>
        <span>{formatYear(maxDate)}</span>
      </div>
    </div>
  );
};

export default TimeSlider;