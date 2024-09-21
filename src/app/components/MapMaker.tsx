import React, { useState } from 'react';
import axios from 'axios';

interface MapMakerProps {
  onUpdate: (filename: string) => void;
}

export default function MapMaker({ onUpdate }: MapMakerProps) {
  const [topic, setTopic] = useState('');
  const [place, setPlace] = useState('');
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('/api/storymaps', {
        action: 'generate_map',
        topic,
        place,
        startYear: parseInt(startYear),
        endYear: parseInt(endYear)
      });

      if (response.status === 201) {
        setSuccess('Story map created successfully!');
        onUpdate(response.data.filename);
        setTopic('');
        setPlace('');
        setStartYear('');
        setEndYear('');
      } else {
        throw new Error('Failed to create story map');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Topic"
        required
      />
      <input
        type="text"
        value={place}
        onChange={(e) => setPlace(e.target.value)}
        placeholder="Place"
        required
      />
      <input
        type="number"
        value={startYear}
        onChange={(e) => setStartYear(e.target.value)}
        placeholder="Start Year"
        required
      />
      <input
        type="number"
        value={endYear}
        onChange={(e) => setEndYear(e.target.value)}
        placeholder="End Year"
        required
      />
      <button type="submit">Generate Story Map</button>
      {error && <p style={{color: 'red'}}>{error}</p>}
      {success && <p style={{color: 'green'}}>{success}</p>}
    </form>
  );
}