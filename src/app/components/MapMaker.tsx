import React, { useState } from 'react';
import axios from 'axios';

interface MapMakerProps {
  onUpdate: () => void;
}

const MapMaker: React.FC<MapMakerProps> = ({ onUpdate }) => {
  const [location, setLocation] = useState('');
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await axios.post('/api/storymaps', {
        action: 'generate_map',
        location,
        startYear: parseInt(startYear),
        endYear: parseInt(endYear),
        category
      });

      setMessage('Story map created successfully!');
      onUpdate();
    } catch (error) {
      setMessage('Error creating story map. Please try again.');
      console.error('Error in handleSubmit:', error);
    }

    setLoading(false);
  };

  const loadSampleData = async () => {
    setLoading(true);
    setMessage('');

    try {
      await axios.post('/api/storymaps', { action: 'load_sample' });
      setMessage('Sample data loaded successfully!');
      onUpdate();
    } catch (error) {
      setMessage('Error loading sample data. Please try again.');
      console.error('Error in loadSampleData:', error);
    }

    setLoading(false);
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-bold mb-4">Create a Historical Story Map</h2>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location"
          required
          className="w-full p-2 border rounded"
        />
        <div className="flex space-x-2">
          <input
            type="number"
            value={startYear}
            onChange={(e) => setStartYear(e.target.value)}
            placeholder="Start Year"
            required
            className="w-1/2 p-2 border rounded"
          />
          <input
            type="number"
            value={endYear}
            onChange={(e) => setEndYear(e.target.value)}
            placeholder="End Year"
            required
            className="w-1/2 p-2 border rounded"
          />
        </div>
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category"
          required
          className="w-full p-2 border rounded"
        />
        <div className="flex space-x-2">
          <button type="submit" disabled={loading} className="bg-blue-500 text-white p-2 rounded">
            Create Story Map
          </button>
          <button onClick={loadSampleData} disabled={loading} className="bg-green-500 text-white p-2 rounded">
            Load Sample Data
          </button>
        </div>
      </form>
      {loading && <p className="mt-2">Loading...</p>}
      {message && <p className="mt-2">{message}</p>}
    </div>
  );
};

export default MapMaker;