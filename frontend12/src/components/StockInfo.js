import React, { useState, useEffect } from 'react';
import axios from 'axios';
import _ from 'lodash';

function StockInfo({ ticker }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            const API_URL = process.env.REACT_APP_BACKEND_URL  ;
            setLoading(true);
            setError('');
            try {
                const response = await axios.get(`http://localhost:5000/stock-info`, { params: { ticker } });
                setData(response.data);
            } catch (error) {
                console.error('Error fetching stock data:', error.response ? error.response.data : error.message);
                setError('Error fetching stock data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [ticker]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', margin: '0 auto', maxWidth: '1000px' }}>
            {data ? (
                <div>
                    <h2>Stock Information for <span style={{color:"cyan"}}><b>{data.longName}</b></span></h2>
                    <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px' }}>
                        {Object.keys(data).filter(key => key !== 'companyOfficers').map((key) => (
                            <div key={key} style={{ marginBottom: '10px' }}>
                                <b>{_.capitalize(key)}:</b>
                                <span style={{ marginLeft: '10px', color: 'cyan' }}>
                                    {Array.isArray(data[key]) ? 
                                        data[key].map((item, index) => <div key={index}>{JSON.stringify(item)}</div>) :
                                        key === 'website' ? (
                                            <a href={data[key]} target="_blank" rel="noopener noreferrer" style={{ color: 'cyan', textDecoration: 'underline' }}>
                                                {data[key]}
                                            </a>
                                        ) : (
                                            data[key] !== null ? data[key].toString() : 'N/A'
                                        )
                                    }
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Company Officers Table */}
                    {data.companyOfficers && data.companyOfficers.length > 0 && (
                        <div style={{ marginTop: '20px' }}>
                            <h3>Company Officers</h3>
                            <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
                                <thead>
                                    <tr>
                                        <th style={{ borderBottom: '2px solid #ddd', padding: '10px', textAlign: 'left' }}>Name</th>
                                        <th style={{ borderBottom: '2px solid #ddd', padding: '10px', textAlign: 'left' }}>Title</th>
                                        <th style={{ borderBottom: '2px solid #ddd', padding: '10px', textAlign: 'left' }}>Age</th>
                                        <th style={{ borderBottom: '2px solid #ddd', padding: '10px', textAlign: 'left' }}>Year Born</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.companyOfficers.map((officer, index) => (
                                        <tr key={index}>
                                            <td style={{ borderBottom: '1px solid #ddd', padding: '10px' }}>{officer.name}</td>
                                            <td style={{ borderBottom: '1px solid #ddd', padding: '10px' }}>{officer.title}</td>
                                            <td style={{ borderBottom: '1px solid #ddd', padding: '10px' }}>{officer.age || 'N/A'}</td>
                                            <td style={{ borderBottom: '1px solid #ddd', padding: '10px' }}>{officer.yearBorn || 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ) : (
                <div>No data available</div>
            )}
        </div>
    );
}

export default StockInfo;
