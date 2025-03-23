import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

function FundamentalData({ ticker }) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await axios.get(`http://localhost:5000/fundamental-data`, { params: { ticker } });
        console.log('Data fetched:', response.data);
        setData(response.data);
      } catch (error) {
        console.error('Error fetching fundamental data:', error);
        setError('Error fetching fundamental data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ticker]);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const renderSwitchedTable = (dataObject) => {
    const periods = Object.keys(dataObject);
    const fields = periods.length ? Object.keys(dataObject[periods[0]]) : [];

    return (
      <div className="overflow-y-auto" style={{ height: '400px', marginBottom: '20px', color: 'white' }}>
        <table className="w-full border-collapse border border-gray-700">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="border border-gray-700 p-3 text-left">Field</th>
              {periods.slice(1).map((period) => (
                <th key={period} className="border border-gray-700 p-3 text-left">{period}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fields.map((field, index) => (
              <tr key={field} className={index % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800'}>
                <td className="border border-gray-700 p-3">{field}</td>
                {periods.slice(1).map((period) => (
                  <td key={period} className="border border-gray-700 p-3">{dataObject[period][field]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const sections = [
    { title: 'Balance Sheet', data: data?.b?.balance_sheet },
    { title: 'Income Statement', data: data?.i?.income_statement },
    { title: 'Cash Flow', data: data?.c?.cash_flow },
  ];

  return (
    <div className="p-6 bg-gray-950 text-white">
      <h5 className="text-xl font-bold mb-6">Fundamental Data for <span className="text-green-500">{ticker}</span></h5>
      {sections.map((section, index) => (
        <div key={index} className="mb-4">
          <button
            onClick={() => toggleSection(section.title)}
            className="flex items-center justify-between w-full bg-gray-800 text-white p-4 rounded-lg shadow-md hover:bg-gray-700 transition-all duration-300"
          >
            <span className="font-semibold">{section.title}</span>
            {expandedSections[section.title] ? <FaChevronUp /> : <FaChevronDown />}
          </button>
          {expandedSections[section.title] && section.data && renderSwitchedTable(section.data)}
        </div>
      ))}
    </div>
  );
}

export default FundamentalData;