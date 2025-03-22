import React, { useState, useEffect } from 'react';


const Holidays = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [year, setYear] = useState('2024');  // Default year


  const fetchHolidays = async (year) => {
    const API_URL = process.env.REACT_APP_BACKEND_URL  ;
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
    <div style={{flex:1, padding: '30px', backgroundColor: 'rgb(14, 17, 23)', color: 'white' ,minHeight:"100vh"}}>
      <div style={{ display: 'flex',flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
       <div style={{ display: 'flex', gap: '10px' }}>
      
        <h2>Holidays for</h2>
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
            width: '100px'
          }}
        />
      </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {!loading && !error && holidays.length === 0 && <div>No holidays found.</div>}
      {!loading && !error && holidays.length > 0 && (
        <ul>
          {holidays.map((holiday, index) => (
            <li key={`${holiday.date}-${index}`} style={{ marginBottom: '10px' }}>
              <strong>{holiday.name}</strong>: <span style={{color:"cyan"}}>{new Date(holiday.date).toLocaleDateString()}</span>
            </li>
          ))}
        </ul>
      )}
      </div>  
    </div>
  );
};

export default Holidays;
