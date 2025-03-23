import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { createChart } from 'lightweight-charts';
import { ResizableBox } from 'react-resizable';
import Draggable from 'react-draggable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGripVertical, faMinus, faWindowRestore } from '@fortawesome/free-solid-svg-icons';
import 'react-resizable/css/styles.css';

// Debounce function
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

function CandleSticks() {
  const [isMinimized, setIsMinimized] = useState(false);
  const [ticker, setTicker] = useState('ADANIENT.NS');
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState('2020-01-01');
  const [endDate, setEndDate] = useState('2024-01-01');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState('Candlestick');
  const chartContainerRef = useRef();
  const [position, setPosition] = useState({ x: 0, y: 10 });
  const draggableRef = useRef(null);

  const toggleMinimize = () => {
    if (isMinimized) {
      const parentRect = draggableRef.current.parentNode.getBoundingClientRect();
      const componentRect = draggableRef.current.getBoundingClientRect();

      const newX = Math.min(Math.max(position.x, 0), parentRect.width - componentRect.width);
      const newY = Math.min(Math.max(position.y, 0), parentRect.height - componentRect.height);

      setPosition({ x: newX, y: newY });
    }

    setIsMinimized(!isMinimized);
  };

  const handleDrag = (e, data) => {
    setPosition({ x: data.x, y: data.y });
  };

  useEffect(() => {
    if (data.length > 0) {
      const chartContainer = chartContainerRef.current;
      if (!chartContainer) return;

      const chart = createChart(chartContainer, {
        width: chartContainer.clientWidth,
        height: chartContainer.clientHeight,
        layout: {
          background: { color: 'black' },
          textColor: 'white',
        },
        grid: {
          vertLines: { color: 'rgba(42, 46, 57)' },
          horzLines: { color: 'rgba(42, 46, 57)' },
        },
        crosshair: {
          mode: 1,
        },
        priceScale: {
          borderColor: 'rgba(197, 203, 206, 0.8)',
        },
        timeScale: {
          borderColor: 'rgba(197, 203, 206, 0.8)',
        },
      });

      // Debounced resize handler
      const handleResize = debounce(() => {
        chart.resize(chartContainer.clientWidth, chartContainer.clientHeight);
      }, 100);

      const resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(chartContainer);

      // Process data
      const formattedData = data.map((item) => ({
        time: new Date(item.Date).toISOString().split('T')[0],
        open: item.Open,
        high: item.High,
        low: item.Low,
        close: item.Close,
      }));

      let series;
      switch (chartType) {
        case 'Candlestick':
          series = chart.addCandlestickSeries({
            upColor: '#4CAF50',
            downColor: '#FF5733',
            borderUpColor: '#4CAF50',
            borderDownColor: '#FF5733',
            wickUpColor: '#4CAF50',
            wickDownColor: '#FF5733',
          });
          break;
        case 'Line':
          series = chart.addLineSeries({ color: '#4CAF50' });
          break;
        case 'Histogram':
          series = chart.addHistogramSeries({ color: '#26a69a' });
          break;
        case 'Area':
          series = chart.addAreaSeries({
            topColor: 'rgba(38,198,218, 0.56)',
            bottomColor: 'rgba(38,198,218, 0.04)',
            lineColor: 'rgba(38,198,218, 1)',
          });
          break;
        case 'Bar':
          series = chart.addBarSeries({
            upColor: '#4CAF50',
            downColor: '#FF5733',
          });
          break;
        default:
          break;
      }

      if (series) {
        series.setData(
          chartType === 'Line' || chartType === 'Histogram' || chartType === 'Area'
            ? formattedData.map((item) => ({ time: item.time, value: item.close }))
            : formattedData
        );
      }

      return () => {
        resizeObserver.disconnect();
        chart.remove();
      };
    }
  }, [data, chartType]);

  const fetchStockData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:5000/stock-data`, {
        params: { ticker, start_date: startDate, end_date: endDate },
      });

      // Transform the data into a usable format
      const transformData = (data) => {
        return data.map((item) => {
          const transformedItem = {};
          Object.entries(item).forEach(([key, value]) => {
            const [field, ticker] = key.split(', '); // Split the key into field and ticker
            transformedItem[field.replace(/[()']/g, '')] = value; // Remove unwanted characters
          });
          return transformedItem;
        });
      };

      const transformedData = transformData(response.data);
      console.log('Transformed Data:', transformedData);
      setData(transformedData);
    } catch (error) {
      setError('Error fetching data. Please try again.');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ flex: 1, padding: '10px', backgroundColor: 'rgb(14, 17, 23)', color: 'white', minHeight: '100vh' }}>
      <Draggable handle=".handle" bounds="parent" position={position} onStop={handleDrag} nodeRef={draggableRef}>
        <div
          style={{
            position: 'fixed',
            left: '15px',
            bottom: '10px',
            zIndex: 10,
            color: 'white',
          }}
          ref={draggableRef}
        >
          {!isMinimized ? (
            <ResizableBox
              width={200}
              height={300}
              minConstraints={[150, 200]}
              maxConstraints={[500, 600]}
              resizeHandles={['s', 'e', 'n', 'w', 'ne', 'se', 'sw']}
              style={{
                backgroundColor: 'rgb(38, 39, 48)',
                borderRadius: '10px',
                padding: '10px',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div
                  className="handle"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    color: 'white',
                    paddingBottom: '10px',
                  }}
                >
                  <FontAwesomeIcon icon={faGripVertical} style={{ cursor: 'move' }} />
                  <button
                    onClick={toggleMinimize}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer',
                    }}
                  >
                    <FontAwesomeIcon icon={faMinus} />
                  </button>
                </div>
                <p style={{ color: 'white' }}>Select Parameters</p>
                <input
                  type="text"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value)}
                  placeholder="Enter ticker"
                  style={{
                    marginBottom: '10px',
                    width: '100%',
                    padding: '5px',
                    backgroundColor: 'rgb(14, 17, 23)',
                    color: 'white',
                    border: '1px solid rgb(14, 17, 23)',
                    borderRadius: '10px',
                  }}
                />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{
                    marginBottom: '10px',
                    width: '100%',
                    padding: '5px',
                    backgroundColor: 'rgb(14, 17, 23)',
                    color: 'white',
                    border: '1px solid rgb(14, 17, 23)',
                    borderRadius: '10px',
                  }}
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{
                    marginBottom: '10px',
                    width: '100%',
                    padding: '5px',
                    backgroundColor: 'rgb(14, 17, 23)',
                    color: 'white',
                    border: '1px solid rgb(14, 17, 23)',
                    borderRadius: '10px',
                  }}
                />
                <button
                  onClick={fetchStockData}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#4CAF50',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: '10px',
                    marginBottom: '10px',
                  }}
                >
                  Fetch Data
                </button>
              </div>
            </ResizableBox>
          ) : (
            <div
              className="handle"
              style={{
                backgroundColor: 'rgb(38, 39, 48)',
                borderRadius: '5px',
                padding: '5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'move',
                width: '40px',
                height: '40px',
              }}
            >
              <button
                onClick={toggleMinimize}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                <FontAwesomeIcon icon={faWindowRestore} />
              </button>
            </div>
          )}
        </div>
      </Draggable>

      <div
        style={{
          flex: 1,
          padding: '20px',
          backgroundColor: 'rgb(14, 17, 23)',
          color: 'white',
          justifyContent: 'center',
          minHeight: '100vh',
          alignItems: 'center',
          width: '95%',
        }}
      >
        {loading ? (
          <div>Loading data...</div>
        ) : error ? (
          <div style={{ color: 'red' }}>{error}</div>
        ) : (
          <>
            <h2>
              {chartType} Chart for <span style={{ color: 'green' }}> {ticker}</span>
            </h2>
            <div style={{ width: '100%', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                {['Candlestick', 'Line', 'Histogram', 'Area', 'Bar'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setChartType(type)}
                    style={{
                      flex: 1,
                      padding: '1px',
                      textAlign: 'center',
                      margin: '10px',
                      cursor: 'pointer',
                      backgroundColor: chartType === type ? '#FF5733' : '#4CAF50',
                      color: '#fff',
                      borderRadius: '5px',
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <div
                ref={chartContainerRef}
                style={{
                  width: '100%',
                  height: '450px',
                }}
              ></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CandleSticks;