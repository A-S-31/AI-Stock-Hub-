import React, { useState, useEffect } from 'react';

const Holidays = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [year, setYear] = useState('2024'); // Default year

  const fetchHolidays = async (year) => {
    const API_URL = process.env.REACT_APP_BACKEND_URL;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:5000/holidays?country=IN&year=${year}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const holidays = await response.json();
      setHolidays(holidays);
    } catch (error) {
      setError('Error fetching holidays. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch holidays for default year initially
    fetchHolidays(year);
  }, [year]);

  const handleYearChange = (e) => {
    setYear(e.target.value);
  };

  return (
    <div style={{ flex: 1, padding: '30px', backgroundColor: 'rgb(14, 17, 23)', color: 'white', minHeight: '100vh' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Holidays for</h2>
          <input
            type="number"
            value={year}
            onChange={handleYearChange}
            style={{
              padding: '10px',
              backgroundColor: 'rgb(38, 39, 48)',
              color: 'white',
              border: '1px solid rgb(14, 17, 23)',
              borderRadius: '10px',
              width: '100px',
              fontSize: '1rem',
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {loading && (
          <div style={{ fontSize: '1.2rem', color: 'cyan', textAlign: 'center', width: '100%' }}>Loading...</div>
        )}
        {error && (
          <div style={{ fontSize: '1.2rem', color: 'red', textAlign: 'center', width: '100%' }}>{error}</div>
        )}
        {!loading && !error && holidays.length === 0 && (
          <div style={{ fontSize: '1.2rem', color: 'gray', textAlign: 'center', width: '100%' }}>No holidays found.</div>
        )}
        {!loading && !error && holidays.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', width: '100%' }}>
            {holidays.map((holiday, index) => (
              <div
                key={`${holiday.date}-${index}`}
                style={{
                  backgroundColor: 'rgb(38, 39, 48)',
                  padding: '20px',
                  borderRadius: '10px',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                  textAlign: 'center',
                }}
              >
                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '10px', color: 'white' }}>
                  {holiday.name}
                </h3>
                <p style={{ fontSize: '1rem', color: 'cyan' }}>
                  {new Date(holiday.date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Holidays;