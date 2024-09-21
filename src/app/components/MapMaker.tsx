import React, { useState } from 'react';
import axios from 'axios';

const MapMaker: React.FC = () => {
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
      const response = await axios.post('/api/storymaps', {
        location,
        startYear: parseInt(startYear),
        endYear: parseInt(endYear),
        category
      });

      setMessage('Story map created successfully!');
      // You might want to do something with the response data here
    } catch (error) {
      setMessage('Error creating story map. Please try again.');
    }

    setLoading(false);
  };

  const loadSampleData = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post('/api/storymaps', { action: 'load_sample' });
      setMessage('Sample data loaded successfully!');
      // Optionally, you can update the form fields with the sample data
      const sampleData = response.data;
      setLocation(sampleData.location);
      setStartYear(sampleData.startYear.toString());
      setEndYear(sampleData.endYear.toString());
      setCategory(sampleData.category);
    } catch (error) {
      setMessage('Error loading sample data. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div>
      <h2>Create a Historical Story Map</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location"
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
        <input
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category"
          required
        />
        <button type="submit" disabled={loading}>
          Create Story Map
        </button>
      </form>
      <button onClick={loadSampleData} disabled={loading}>
        Load Sample Data
      </button>
      {loading && <p>Loading...</p>}
      {message && <p>{message}</p>}
    </div>
  );
};

export default MapMaker;