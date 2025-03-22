import React, { useState, useEffect } from 'react';
import axios from 'axios';

function FundamentalData({ ticker }) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const API_URL = process.env.REACT_APP_BACKEND_URL  ;
      setLoading(true);
      setError('');
      try {
        const response = await axios.get(`http://localhost:5000/fundamental-data`, { params: { ticker } });
        console.log('Data fetched:', response.data); // Log the response data
        setData(response.data);
      } catch (error) {
        console.error('Error fetching fundamental data:', error); // Log errors
        setError('Error fetching fundamental data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ticker]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  // Extract data for rendering
  const balanceSheet = data?.b?.balance_sheet || {};
  const incomeStatement = data?.i?.income_statement || {};
  const cashFlow = data?.c?.cash_flow || {};

  // Helper function to render object data in table format with switched headers
  const renderSwitchedTable = (dataObject) => {
    const periods = Object.keys(dataObject);
    const fields = periods.length ? Object.keys(dataObject[periods[0]]) : [];

    return (
      <div style={{ width: "100%", height: "400px", overflowY: "auto", marginBottom: "20px" }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
        <thead>
  <tr>
    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Field</th>
    {/* Skip the first element of periods */}
    {periods.slice(1).map((period) => (
      <th key={period} style={{ border: '1px solid #ddd', padding: '8px' }}>{period}</th>
    ))}
  </tr>
</thead>
<tbody>
  {fields.map((field) => (
    <tr key={field}>
      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{field}</td>
      {/* Skip the first element of periods */}
      {periods.slice(1).map((period) => (
        <td style={{ border: '1px solid #ddd', padding: '8px' }} key={period}>
          {dataObject[period][field]}
        </td>
      ))}
    </tr>
  ))}
</tbody>

        </table>
      </div>
    );
  };

  return (
    <div>
      <h5>Fundamental Data for <span style={{color:"green"}}> {ticker}</span> </h5>
      
      <h2>Balance Sheet</h2>
      {renderSwitchedTable(balanceSheet)}

      <h2>Income Statement</h2>
      {renderSwitchedTable(incomeStatement)}

      <h2>Cash Flow</h2>
      {renderSwitchedTable(cashFlow)}
    </div>
  );
}

export default FundamentalData;
