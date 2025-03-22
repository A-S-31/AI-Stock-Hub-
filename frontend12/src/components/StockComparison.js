import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { ResizableBox } from "react-resizable";
import Draggable from "react-draggable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGripVertical, faMinus, faWindowRestore } from "@fortawesome/free-solid-svg-icons";
import "react-resizable/css/styles.css";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const StockComparison = () => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [ticker1, setTicker1] = useState("SBIN.NS");
  const [ticker2, setTicker2] = useState("HDFCBANK.NS");
  const [ticker3, setTicker3] = useState("ICICIBANK.NS");
  const [startDate, setStartDate] = useState("2024-01-01");
  const [endDate, setEndDate] = useState("2024-09-02");
  const [data, setData] = useState({});
  const [annualReturns, setAnnualReturns] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 10 });
  const draggableRef = useRef(null);

  useEffect(() => {
    if (Object.keys(data).length > 0) {
      calculateAnnualReturns();
    }
  }, [data]);

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

  const extractAndFormatDate = (item) => {
    const dateStr = Object.entries(item).find(([key]) => key.includes("Date"))[1];
    return new Date(parseInt(dateStr)); // Convert timestamp to Date object
  };

  const fetchStockData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response1 = await axios.get(`http://localhost:5000/stock-data`, {
        params: { ticker: ticker1, start_date: startDate, end_date: endDate },
      });
      const response2 = await axios.get(`http://localhost:5000/stock-data`, {
        params: { ticker: ticker2, start_date: startDate, end_date: endDate },
      });
      const response3 = await axios.get(`http://localhost:5000/stock-data`, {
        params: { ticker: ticker3, start_date: startDate, end_date: endDate },
      });

      // Transform the data into a usable format
      const transformData = (data) => {
        return data.map((item) => {
          const transformedItem = {};
          Object.entries(item).forEach(([key, value]) => {
            const [field, ticker] = key.split(", "); // Split the key into field and ticker
            transformedItem[field.replace(/[()']/g, "")] = value; // Remove unwanted characters
          });
          return transformedItem;
        });
      };

      setData({
        [ticker1]: transformData(response1.data),
        [ticker2]: transformData(response2.data),
        [ticker3]: transformData(response3.data),
      });

      console.log("Transformed Data:", {
        [ticker1]: transformData(response1.data),
        [ticker2]: transformData(response2.data),
        [ticker3]: transformData(response3.data),
      });
    } catch (error) {
      console.error("Error fetching stock data:", error);
      setError("Error fetching stock data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const calculateAnnualReturns = () => {
    const tickers = [ticker1, ticker2, ticker3];
    const returns = {};

    tickers.forEach((ticker) => {
      const stockData = data[ticker];
      if (stockData && stockData.length > 0) {
        const startPrice = stockData[0].Close;
        const endPrice = stockData[stockData.length - 1].Close;
        const numYears =
          new Date(endDate).getFullYear() -
          new Date(startDate).getFullYear() +
          1;

        const annualReturn =
          ((endPrice / startPrice) ** (1 / numYears) - 1) * 100;
        returns[ticker] = annualReturn.toFixed(2);
      }
    });

    setAnnualReturns(returns);
  };

  const generateChartData = (type) => {
    if (!data[ticker1] || data[ticker1].length === 0) {
      console.log("No data available for chart generation.");
      return { labels: [], datasets: [] };
    }

    const labels = data[ticker1]?.map((item) => extractAndFormatDate(item)) || [];
    const datasets = [
      {
        label: `${ticker1} ${type}`,
        data: data[ticker1]?.map((item) => item[type]) || [],
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
      },
      {
        label: `${ticker2} ${type}`,
        data: data[ticker2]?.map((item) => item[type]) || [],
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
      },
      {
        label: `${ticker3} ${type}`,
        data: data[ticker3]?.map((item) => item[type]) || [],
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
      },
    ];

    console.log("Chart Data:", { labels, datasets });

    return {
      labels,
      datasets,
    };
  };

  const calculateTotalTraded = (tickerData) => {
    return tickerData.map((item) => item.Open * item.Volume);
  };

  const generateTotalTradedData = () => {
    if (!data[ticker1] || data[ticker1].length === 0) {
      return { labels: [], datasets: [] };
    }

    const labels = data[ticker1]?.map((item) => extractAndFormatDate(item)) || [];
    const datasets = [
      {
        label: `${ticker1} Total Traded`,
        data: calculateTotalTraded(data[ticker1] || []),
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
      },
      {
        label: `${ticker2} Total Traded`,
        data: calculateTotalTraded(data[ticker2] || []),
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
      },
      {
        label: `${ticker3} Total Traded`,
        data: calculateTotalTraded(data[ticker3] || []),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
      },
    ];

    return {
      labels,
      datasets,
    };
  };

  const formatDate = (date) => {
    if (isNaN(date)) return "";

    const options = { day: "numeric", month: "short", year: "numeric" };
    return new Intl.DateTimeFormat("en-GB", options).format(date);
  };

  return (
    <div style={{ flex: 1, padding: "20px", backgroundColor: "rgb(14, 17, 23)", color: "white", minHeight: "100vh" }}>
      <Draggable
        handle=".handle"
        bounds="parent"
        position={position}
        onStop={handleDrag}
        nodeRef={draggableRef}
      >
        <div
          style={{
            position: "fixed",
            left: "15px",
            bottom: "10px",
            zIndex: 10,
          }}
          ref={draggableRef}
        >
          {!isMinimized ? (
            <ResizableBox
              width={200}
              height={383}
              minConstraints={[200, 350]}
              maxConstraints={[500, 600]}
              resizeHandles={["s", "e", "n", "w", "ne", "se", "sw"]}
              style={{
                backgroundColor: "rgb(38, 39, 48)",
                borderRadius: "10px",
                padding: "10px",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <div
                  className="handle"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    color: "white",
                    paddingBottom: "10px",
                  }}
                >
                  <FontAwesomeIcon icon={faGripVertical} style={{ cursor: "move" }} />
                  <button
                    onClick={toggleMinimize}
                    style={{
                      background: "none",
                      border: "none",
                      color: "white",
                      cursor: "pointer",
                    }}
                  >
                    <FontAwesomeIcon icon={faMinus} />
                  </button>
                </div>
                <h3 style={{ color: "white" }}>Options</h3>
                <input
                  type="text"
                  value={ticker1}
                  onChange={(e) => setTicker1(e.target.value)}
                  placeholder="Enter first ticker"
                  style={{
                    marginBottom: "10px",
                    width: "100%",
                    padding: "5px",
                    backgroundColor: "rgb(14, 17, 23)",
                    color: "white",
                    border: "1px solid rgb(14, 17, 23)",
                    borderRadius: "10px",
                  }}
                />
                <input
                  type="text"
                  value={ticker2}
                  onChange={(e) => setTicker2(e.target.value)}
                  placeholder="Enter second ticker"
                  style={{
                    marginBottom: "10px",
                    width: "100%",
                    padding: "5px",
                    backgroundColor: "rgb(14, 17, 23)",
                    color: "white",
                    border: "1px solid rgb(14, 17, 23)",
                    borderRadius: "10px",
                  }}
                />
                <input
                  type="text"
                  value={ticker3}
                  onChange={(e) => setTicker3(e.target.value)}
                  placeholder="Enter third ticker"
                  style={{
                    marginBottom: "10px",
                    width: "100%",
                    padding: "5px",
                    backgroundColor: "rgb(14, 17, 23)",
                    color: "white",
                    border: "1px solid rgb(14, 17, 23)",
                    borderRadius: "10px",
                  }}
                />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{
                    marginBottom: "10px",
                    width: "100%",
                    padding: "5px",
                    backgroundColor: "rgb(14, 17, 23)",
                    color: "white",
                    border: "1px solid rgb(14, 17, 23)",
                    borderRadius: "10px",
                  }}
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{
                    marginBottom: "10px",
                    width: "100%",
                    padding: "5px",
                    backgroundColor: "rgb(14, 17, 23)",
                    color: "white",
                    border: "1px solid rgb(14, 17, 23)",
                    borderRadius: "10px",
                  }}
                />
                <button
                  onClick={fetchStockData}
                  style={{
                    width: "100%",
                    padding: "10px",
                    backgroundColor: "#4CAF50",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
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
                backgroundColor: "rgb(38, 39, 48)",
                borderRadius: "5px",
                padding: "5px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "move",
                width: "40px",
                height: "40px",
              }}
            >
              <button
                onClick={toggleMinimize}
                style={{
                  background: "none",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
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
          padding: "20px",
          backgroundColor: "rgb(14, 17, 23)",
          color: "white",
          minHeight: "100vh",
          width: "95%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <center>
          <h1>Stock Comparison</h1>
        </center>
        {loading ? (
          <div>Loading data...</div>
        ) : error ? (
          <div style={{ color: "red" }}>{error}</div>
        ) : (
          <>
            <br />
            <div style={{ width: "100%", marginBottom: "20px" }}>
              {Object.keys(annualReturns).map((ticker) => (
                <div key={ticker}>
                  <strong>{ticker} Annual Return:</strong>{" "}
                  <span
                    style={{
                      color: annualReturns[ticker] > 0 ? "green" : "red",
                    }}
                  >
                    {annualReturns[ticker]}%
                  </span>
                </div>
              ))}
            </div>
            <br />
            <div style={{ width: "100%", height: "500px", marginBottom: "20px", color: "white" }}>
              <h2>Close Price Comparison</h2>
              <Line
                data={generateChartData("Close")}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      ticks: {
                        color: "white",
                        callback: function (value, index, values) {
                          const date = generateChartData("Close").labels[index];
                          return formatDate(date);
                        },
                      },
                      grid: {
                        color: "rgba(255, 255, 255, 0.1)",
                      },
                    },
                    y: {
                      ticks: {
                        color: "white",
                      },
                      grid: {
                        color: "rgba(255, 255, 255, 0.1)",
                      },
                    },
                  },
                }}
              />
            </div>
            <br />
            <div style={{ width: "100%", height: "500px", marginBottom: "20px" }}>
              <h2>Volume Comparison</h2>
              <Line
                data={generateChartData("Volume")}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      ticks: {
                        color: "white",
                        callback: function (value, index, values) {
                          const date = generateChartData("Volume").labels[index];
                          return formatDate(date);
                        },
                      },
                      grid: {
                        color: "rgba(255, 255, 255, 0.1)",
                      },
                    },
                    y: {
                      ticks: {
                        color: "white",
                      },
                      grid: {
                        color: "rgba(255, 255, 255, 0.1)",
                      },
                    },
                  },
                }}
              />
            </div>
            <br />
            <div style={{ width: "100%", height: "500px", marginBottom: "20px" }}>
              <h2>Total Traded Comparison</h2>
              <Line
                data={generateTotalTradedData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      ticks: {
                        color: "white",
                        callback: function (value, index, values) {
                          const date = generateTotalTradedData().labels[index];
                          return formatDate(date);
                        },
                      },
                      grid: {
                        color: "rgba(255, 255, 255, 0.1)",
                      },
                    },
                    y: {
                      ticks: {
                        color: "white",
                      },
                      grid: {
                        color: "rgba(255, 255, 255, 0.1)",
                      },
                    },
                  },
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StockComparison;