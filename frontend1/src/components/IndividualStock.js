import React, { useState,useRef,useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "chart.js/auto";
import Plot from "react-plotly.js";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import NewsComponent from "./NewsComponent";
import FundamentalData from "./FundamentalData";
import TrendlyneWidgets from "./TrendlyneWidget";
import StockInfo from "./StockInfo";
import { ResizableBox } from 'react-resizable';
import Draggable from 'react-draggable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {  faGripVertical,faMinus,faWindowRestore } from '@fortawesome/free-solid-svg-icons';
import 'react-resizable/css/styles.css';




// Function to calculate moving average
const calculateMovingAverage = (data, windowSize) => {
  console.log("Input Data for Moving Average:", data);
  console.log("Window Size:", windowSize);

  if (!data || data.length < windowSize) {
    console.warn("Insufficient data for moving average calculation");
    return Array(data.length).fill(null);
  }

  const movingAverages = [];
  for (let i = windowSize - 1; i < data.length; i++) {
    const windowData = data.slice(i - windowSize + 1, i + 1);
    const sum = windowData.reduce((acc, item) => acc + item, 0);
    const average = sum / windowSize;
    movingAverages.push(average);
  }

  console.log(`Calculated ${windowSize}-Day Moving Average:`, movingAverages);
  return Array(windowSize - 1).fill(null).concat(movingAverages);
};





const IndividualStockData = () => {
  const [isMinimized, setIsMinimized] = useState(false)
  const [tabIndex, setTabIndex] = useState(0);
  const [ticker, setTicker] = useState("ADANIENT.NS");
  const [startDate, setStartDate] = useState("2014-01-01");
  const [endDate, setEndDate] = useState("2024-01-01");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 10 });

  const toggleMinimize = () => {
    // Check and adjust position within bounds when restoring
    if (isMinimized) {
      const parentRect = draggableRef.current.parentNode.getBoundingClientRect();
      const componentRect = draggableRef.current.getBoundingClientRect();

      // Ensure it stays within the parent's visible area upon restoration
      const newX = Math.min(Math.max(position.x, 0), parentRect.width - componentRect.width);
      const newY = Math.min(Math.max(position.y, 0), parentRect.height - componentRect.height);

      setPosition({ x: newX, y: newY });
    }

    setIsMinimized(!isMinimized);
  };

  const handleDrag = (e, data) => {
    // Update position during drag to ensure it's within bounds
    setPosition({ x: data.x, y: data.y });
  };

  const draggableRef = useRef(null);


   
  const navigate = useNavigate();
  const location = useLocation();

  // Sync the tab index with the current URL path
  useEffect(() => {
    if (location.pathname === "/individual-stock/price-movements") {setTabIndex(0); fetchStockData("priceMovements");}
    if (location.pathname === "/individual-stock/chart") {setTabIndex(1); fetchStockData("Chart");}
    if (location.pathname === "/individual-stock/moving-averages") {setTabIndex(2); fetchStockData("movingAverages");}
    if (location.pathname === "/individual-stock/recent-news") setTabIndex(3);
    if (location.pathname === "/individual-stock/fundamentals") setTabIndex(4);
    if (location.pathname === "/individual-stock/stock-analysis") setTabIndex(5);
    if (location.pathname === "/individual-stock/info") setTabIndex(6);
  }, [location.pathname]);

  // Handle tab change and update the URL path
  const handleTabChange = (event, newIndex) => {
    setTabIndex(newIndex);
    if (newIndex === 0) navigate("/individual-stock/price-movements"); 
    if (newIndex === 1) navigate("/individual-stock/chart"); 
    if (newIndex === 2) navigate("/individual-stock/moving-averages"); 
    if (newIndex === 3) navigate("/individual-stock/recent-news");
    if (newIndex === 4) navigate("/individual-stock/fundamentals");
    if (newIndex === 5) navigate("/individual-stock/stock-analysis");
    if (newIndex === 6) navigate("/individual-stock/info");
  };


  
  const fetchStockData = async (fetchForTab) => {
    const API_URL = process.env.REACT_APP_BACKEND_URL;
    setLoading(true);
    setError(null);
  
    try {
      const response = await axios.get(`http://localhost:5000/stock-data`, {
        params: { ticker, start_date: startDate, end_date: endDate },
      });
  
      const stockData = response.data;
      const closePrices =stockData?.map((item) => extractValue(item, 'Close'))
  
      // Calculate moving averages
      const ma100 = calculateMovingAverage(closePrices, 100);
      const ma200 = calculateMovingAverage(closePrices, 200);
  
      console.log("Fetched Stock Data:", stockData);
      console.log("100-Day Moving Average:", ma100);
      console.log("200-Day Moving Average:", ma200);
  
      setData({ stockData, ma100, ma200, fetchForTab });
    } catch (error) {
      setError("Error fetching data. Please try again.");
      console.error("Error fetching stock data:", error);
    } finally {
      setLoading(false);
    }
  };
  

  const extractDate = (item) => {
    const timestamp = Object.entries(item).find(([key]) => key.includes('Date'))?.[1];
    
    if (!timestamp) return null;
  
    const parsedDate = new Date(timestamp);
  
    // Check for invalid dates
    if (isNaN(parsedDate.getTime())) {
      console.warn('Invalid date encountered:', timestamp);
      return null;
    }
  
    return parsedDate.toLocaleDateString("en-GB");
  };
  
  
  
  const extractValue = (item, label) => {
    return Object.entries(item).find(([key]) => key.includes(label))?.[1] ?? null;
  };
  
  const plotData = [
    {
      type: "scatter",
      mode: "lines",
      x: data.stockData?.map(extractDate), // Dates for Close Price
      y: data.stockData?.map((item) => extractValue(item, 'Close')), // Close Price
      name: "Close Price",
      line: { color: "blue" },
    },
    {
      type: "scatter",
      mode: "lines",
      x: data.stockData?.slice(99).map(extractDate), // Dates for 100-Day MA (start from 100th index)
      y: data.ma100?.slice(99), // 100-Day Moving Average (start from 100th index)
      name: "100-Day Moving Average",
      line: { color: "orange" },
    },
    {
      type: "scatter",
      mode: "lines",
      x: data.stockData?.slice(199).map(extractDate), // Dates for 200-Day MA (start from 200th index)
      y: data.ma200?.slice(199), // 200-Day Moving Average (start from 200th index)
      name: "200-Day Moving Average",
      line: { color: "purple" },
    },
  ];
  const plotData2 = [
    {
      type: "scatter",
      mode: "lines",
      x: data.stockData?.map(extractDate),
      y: data.stockData?.map((item) => extractValue(item, 'Open')),
      name: "Open",
      line: { color: "cyan" },
    },
    {
      type: "scatter",
      mode: "lines",
      x: data.stockData?.map(extractDate),
      y: data.stockData?.map((item) => extractValue(item, 'High')),
      name: "High",
      line: { color: "blue" },
    },
    {
      type: "scatter",
      mode: "lines",
      x: data.stockData?.map(extractDate),
      y: data.stockData?.map((item) => extractValue(item, 'Low')),
      name: "Low",
      line: { color: "pink" },
    },
    {
      type: "scatter",
      mode: "lines",
      x: data.stockData?.map(extractDate),
      y: data.stockData?.map((item) => extractValue(item, 'Close')),
      name: "Close",
      line: { color: "red" },
    },
    {
      type: "scatter",
      mode: "lines",
      x: data.stockData?.map(extractDate),
      y: data.stockData?.map((item) => extractValue(item, 'Adj Close')),
      name: "Adj Close",
      line: { color: "green" },
    },
    {
      type: "scatter",
      mode: "lines",
      x: data.stockData?.map(extractDate),
      y: data.stockData?.map((item) => extractValue(item, 'Volume')),
      name: "Volume",
      line: { color: "rgb(40, 176, 158)" },
    },
  ];
  


  const StyledTabs = styled(Tabs)({
    '& .MuiTab-root': {
      color: 'white',
      minWidth: '0px', 
      // '&.Mui-selected': {
      //   color: 'red', // Selected tab text color
      // },
    },
    // '& .MuiTabs-flexContainer': {
    //   flexWrap: 'wrap', // Allow tabs to wrap onto the next line
    // },
    
  });

  return (
    <div style={{ flex: 1, padding: '10px', backgroundColor: 'rgb(14, 17, 23)', color: 'white',minHeight:"100vh"}}>
     <Draggable   handle=".handle"
      bounds="parent"
      position={position}
      onStop={handleDrag}
      nodeRef={draggableRef}>

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
        {!isMinimized ? ( // Show the resizable box only when not minimized
          <ResizableBox
            width={200}
            height={300}
            minConstraints={[150, 200]}
            maxConstraints={[500, 600]}
            resizeHandles={['s', 'e', 'n', 'w', 'ne', 'se', 'sw']}
            style={{
              backgroundColor: 'rgb(38, 39, 48)',
              borderRadius: '10px',
              padding: '10px'
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
                  paddingBottom: '10px'
                }}
              >
                <FontAwesomeIcon icon={faGripVertical} style={{ cursor: 'move' }} />
                <button
                  onClick={toggleMinimize}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  <FontAwesomeIcon icon={faMinus} />
                </button>
              </div>
              <p style={{ color: 'white' }}>Select Parameter from below</p>
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
                  borderRadius: '10px'
                }}
              />
              {(tabIndex === 0 || tabIndex === 1 || tabIndex === 2) && (
                <>
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
                      borderRadius: '10px'
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
                      borderRadius: '10px'
                    }}
                  />
                </>
              )}
              <button
                onClick={() => fetchStockData(tabIndex === 1 ? 'Chart' : (tabIndex === 2 ? 'movingAverages' : 'priceMovements'))}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#4CAF50',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Fetch Data
              </button>
            </div>
          </ResizableBox>
        ) : ( // Show a draggable minimize button when minimized
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
              height: '40px'
            }}
          >
            <button
              onClick={toggleMinimize}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              <FontAwesomeIcon icon={faWindowRestore} />
            </button>
          </div>
        )}
      </div>
    </Draggable>
      <div style={{ flex: 1, padding: "10px", backgroundColor: "rgb(14, 17, 23)", color: "white",minHeight:"100vh",justifyContent:"center",alignItems:"center" }}>
        <center>
          <h1>Stock Dashboard</h1>
        </center>
        {loading ? (
          <div>Loading data...</div>
        ) : error ? (
          <div style={{ color: "red" }}>{error}</div>
        ) : (
          <>
        <StyledTabs
          value={tabIndex}
          onChange={handleTabChange}
          aria-label="Stock Data Tabs"
          
        >
          <Tab label="Price Movements" />
          <Tab label="Chart" />
          <Tab label="Moving Averages" />
          <Tab label="Recent News" />
          <Tab label="Fundamentals" />
          <Tab label="Stock Analysis" />
          <Tab label="Info" />
         
        </StyledTabs>
        <Box sx={{ padding: 3 }}>
        {tabIndex === 0 && data.fetchForTab === "priceMovements" && (
  <div style={{ width: "100%", height: "400px", overflowY: "auto", marginBottom: "20px", overflowX: "hidden" }}>
    <table style={{ 
      width: '100%', 
      borderCollapse: 'separate', 
      borderSpacing: '0', 
      color: 'white', 
      borderRadius: '10px', 
      overflow: 'hidden',
      backgroundColor: '#1E293B', // Dark blue background for the table
    }}>
      <thead>
        <tr style={{ backgroundColor: '#0F172A' }}> {/* Darker blue header */}
          <th style={{ padding: '12px', borderRight: '1px solid #334155', borderBottom: '2px solid #334155', fontWeight: '600', textAlign: 'left' }}>Date</th>
          <th style={{ padding: '12px', borderRight: '1px solid #334155', borderBottom: '2px solid #334155', fontWeight: '600', textAlign: 'left' }}>Open</th>
          <th style={{ padding: '12px', borderRight: '1px solid #334155', borderBottom: '2px solid #334155', fontWeight: '600', textAlign: 'left' }}>High</th>
          <th style={{ padding: '12px', borderRight: '1px solid #334155', borderBottom: '2px solid #334155', fontWeight: '600', textAlign: 'left' }}>Low</th>
          <th style={{ padding: '12px', borderRight: '1px solid #334155', borderBottom: '2px solid #334155', fontWeight: '600', textAlign: 'left' }}>Close</th>
          <th style={{ padding: '12px', borderBottom: '2px solid #334155', fontWeight: '600', textAlign: 'left' }}>Volume</th> {/* No right border for the last column */}
        </tr>
      </thead>
      <tbody>
        {data.stockData && data.stockData.map((item, index) => (
          <tr key={index} style={{ 
            backgroundColor: index % 2 === 0 ? '#1E293B' : '#2D3748', 
            transition: 'background-color 0.3s ease',
          }}>
            {/* Extract and format Date */}
            <td style={{ padding: '12px', borderRight: '1px solid #334155', borderBottom: '1px solid #334155', textAlign: 'left' }}>
              {new Date(Object.entries(item).find(([key]) => key.includes('Date'))[1]).toLocaleDateString("en-GB")}
            </td>

            {/* Extract other values dynamically */}
            {['Open', 'High', 'Low', 'Close'].map((label) => {
              const value = Object.entries(item).find(([key]) => key.includes(label))?.[1] ?? 'N/A';
              return (
                <td key={label} style={{ padding: '12px', borderRight: '1px solid #334155', borderBottom: '1px solid #334155', textAlign: 'left' }}>
                  {value}
                </td>
              );
            })}
            {/* Volume Column */}
            <td style={{ padding: '12px', borderBottom: '1px solid #334155', textAlign: 'left' }}>
              {Object.entries(item).find(([key]) => key.includes('Volume'))?.[1] ?? 'N/A'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}
          {tabIndex === 1 && data.fetchForTab === "Chart" && (
            <div style={{display:"flex", width: "100%", height: "500px", marginBottom: "20px",justifyContent:"center",alignItems:"center"}}>
              <Plot
                data={plotData2}
                layout={{
                  title: `${ticker} Chart`,
                  paper_bgcolor: "rgb(14, 17, 23)",
                  plot_bgcolor: "rgb(14, 17, 23)",
                  font: { color: "white" },width:900,
                  height:500
                }}
              />
            </div>
          )}
          {tabIndex === 2 && data.fetchForTab === "movingAverages" && (
            <div style={{display:"flex", width: "100%", height: "500px", marginBottom: "20px",justifyContent:"center",alignItems:"center" }}>
              <Plot
                data={plotData}
                layout={{
                  title: `${ticker} Moving Averages`,
                  paper_bgcolor: "rgb(14, 17, 23)",
                  plot_bgcolor: "rgb(14, 17, 23)",
                  font: { color: "white" },width:900,
                  height:500
                }}
              />
            </div>
          )}
          {tabIndex === 3 && (
            
            <NewsComponent ticker={ticker} />
          )}
          {tabIndex === 4 && (
            
            <FundamentalData ticker={ticker} />
          )}
          {tabIndex===5 &&(
            <TrendlyneWidgets ticker={ticker}/>
          )}
          {tabIndex===6 &&(
            <StockInfo ticker={ticker}/>
          )}
        </Box>
        </>
        )}
      </div>
    </div>       
  );
};


export default IndividualStockData;
