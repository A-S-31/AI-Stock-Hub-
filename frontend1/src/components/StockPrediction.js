import React, { useState } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';

function StockPrediction() {
    const [ticker, setTicker] = useState('ADANIENT.NS');
    const [predictionData, setPredictionData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchStockData = async (ticker) => {
        try {
            const response = await axios.get(`http://localhost:5000/stock-data1`, { params: { ticker } });
            console.log(response.data);
            return response.data;
        } catch (error) {
            console.error("Error fetching stock data:", error);
            return null;
        }
    };

    const handlePredict = async () => {
        setLoading(true);
        setError('');
        try {
            const stockData = await fetchStockData(ticker);
            if (stockData) {
                const response = await axios.post(`http://localhost:5000/predict`, { stockData });
                console.log('Prediction Response:', response.data);
                setPredictionData(response.data);
            } else {
                setError('No stock data found for the given ticker.');
            }
        } catch (error) {
            console.error('Error during prediction:', error.response ? error.response.data : error.message);
            setError('Error during prediction. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const LSTM = predictionData?.LSTM || {};
    const original = predictionData?.original || {};
    const comparision = predictionData?.comparision || {};
    const actualData = comparision.Actual || [];
    const predictedData = comparision.Predicted || [];
    const volumeData = predictionData?.Volume?.df2 || [];
    const dates = (original.dates || []).map(dateString => {
        const dateObj = new Date(dateString);
        const day = dateObj.getDate();
        const month = dateObj.toLocaleString('en-GB', { month: 'short' });
        const year = dateObj.getFullYear().toString().slice(-2);
        return `${day},${month}'${year}`;
    });
    const p = LSTM.prediction;

    const traceActual = {
        x: dates,
        y: actualData,
        type: 'scatter',
        mode: 'lines',
        name: 'Actual',
    };

    const tracePredicted = {
        x: dates,
        y: predictedData,
        type: 'scatter',
        mode: 'lines',
        name: 'Predicted',
    };

    const indicators = {
        x: dates,
        y: volumeData.map(volume => volume * 0.0001), // Scale down the volume for height
        type: 'bar',
        name: 'Indicators',
        marker: {
            color: 'rgba(173, 216, 230, 0.6)', 
        },
        hoverinfo: 'y', 
        visible: 'legendonly',
    };

    return (
        <div style={{ flex: 1, padding: '30px', backgroundColor: 'rgb(14, 17, 23)', color: 'white', minHeight: "100vh" }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                        type="text"
                        value={ticker}
                        onChange={(e) => setTicker(e.target.value)}
                        placeholder="Enter ticker"
                        style={{
                            marginBottom: "10px",
                            width: "100%",
                            padding: "10px",
                            backgroundColor: 'rgb(28, 29, 36)',
                            color: 'white',
                            border: "1px solid rgb(14, 17, 23)",
                            borderRadius: '10px'
                        }}
                        aria-label="Stock Ticker"
                    />
                    <button
                        style={{
                            marginBottom: "10px",
                            padding: '10px',
                            backgroundColor: 'green',
                            border: 'none',
                            color: 'white',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            flexShrink: 0,
                            width: "20%",
                        }}
                        onClick={handlePredict}
                        aria-label="Predict"
                        disabled={loading}
                    >
                        {loading ? 'Loading...' : 'Predict'}
                    </button>
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </div>

            <div style={{ flex: 1, padding: '20px', backgroundColor: 'rgb(14, 17, 23)', color: 'white', justifyContent: "center", minHeight: "100vh", alignItems: "center", width: "95%" }}>
                {predictionData ? (
                    <div>
                        <strong> Predictions for :</strong>{" "}
                        <span style={{ color: "green" }}> {ticker}</span>

                        <Plot
                            data={[traceActual, tracePredicted, indicators]}
                            layout={{
                                title: 'Actual vs Predicted Stock Prices',
                                yaxis: { title: 'Price' },
                                paper_bgcolor: 'rgb(14, 17, 23)',
                                plot_bgcolor: 'rgb(14, 17, 23)',
                                font: { color: 'white' },
                                width: 900,
                                height: 500,
                            }}
                        />
                        <br></br>
                        <br></br>
                        <br></br>
                        <strong> Predictions for next day :</strong>{" "}
                        <span style={{ color: "green" }}> {p}</span>
                    </div>
                ) : (
                    <div style={{ flex: 1, padding: "10px", backgroundColor: "rgb(14, 17, 23)", color: "white", minHeight: "100vh" }}></div>
                )}
            </div>
        </div>
    );
}

export default StockPrediction;