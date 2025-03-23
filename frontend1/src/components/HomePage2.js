import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { FaArrowUp, FaArrowDown, FaComments, FaTimes } from 'react-icons/fa'; // Added FaTimes for close icon
import axios from 'axios';
import {
  FaChartLine, FaListUl, FaCalendarAlt, FaNewspaper, FaChartArea, FaLightbulb, FaInfoCircle, FaClipboardList, FaSearch, FaChartBar, FaClipboard,
} from 'react-icons/fa';
import { TbChartHistogram } from "react-icons/tb";
import { LuCandlestickChart } from "react-icons/lu";

const HomePage = () => {
  const navigate = useNavigate();
  const { login, register, isAuthenticated, user, logout } = useKindeAuth();
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false); // State to manage chatbot visibility

  useEffect(() => {
    const fetchPrices = async () => {
      const API_URL = process.env.REACT_APP_BACKEND_URL;
      try {
        const response = await axios.get(`http://localhost:5000/latest-prices`);
        setPrices(response.data);
      } catch (err) {
        setError('Error fetching data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrices();
  }, []);

  const getPriceColor = (change) => {
    return change >= 0 ? 'text-green-500' : 'text-red-500';
  };

  const handleNavigate = (destination) => {
    if (destination === 'individual-stock') {
      navigate('/individual-stock');
    } else if (destination === 'recent-news') {
      navigate('/individual-stock/recent-news');
    } else if (destination === 'info') {
      navigate('/individual-stock/info');
    } else if (destination === 'fundamentals') {
      navigate('/individual-stock/fundamentals');
    } else if (destination === 'holidays') {
      navigate('/holidays');
    } else if (destination === 'averages') {
      navigate('/individual-stock/moving-averages');
    } else if (destination === 'chart') {
      navigate('/individual-stock/chart');
    } else if (destination === 'movement') {
      navigate('/individual-stock/price-movements');
    } else if (destination === 'analysis') {
      navigate('/individual-stock/stock-analysis');
    } else if (destination === 'watchlist') {
      navigate('/watchlist');
    } else if (destination === 'compare') {
      navigate('/compare');
    } else if (destination === 'prediction') {
      navigate('/prediction');
    } else if (destination === 'charts') {
      navigate('/charts');
    } else if (destination === 'portfolio') {
      navigate('/portfolio-form');
    } else {
      navigate('/');
    }
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen); // Toggle chatbot visibility
  };

  return (
    <div className="flex flex-col w-full">
      {/* Navbar */}
      <nav className="bg-gray-900 p-3">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-white text-2xl font-bold">Stock Dashboard</h1>
          {!isAuthenticated && (
            <div>
              <ul className="flex flex-grow justify-end flex-wrap items-center">
                <li>
                  <button onClick={login} type="button" className="text-gray-200 px-4 font-semibold flex items-center underline">SignIn</button>
                </li>
                <li>
                  <button onClick={register} className='btn btn-primary px-4 font-semibold flex items-center text-white no-underline' type="button">SignUp</button>
                </li>
              </ul>
            </div>
          )}
          {isAuthenticated && (
            <div className="text-white flex flex-grow justify-end flex-wrap items-center">
              <button
                onClick={() => logout()}
                type="button"
                className="btn btn-danger px-4 font-semibold flex items-center text-white no-underline"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow p-8 bg-gray-400 w-full">
        <div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {loading ? (
              <div className="bg-gray-900 text-white p-4 rounded-lg shadow-lg">Loading...</div>
            ) : error ? (
              <div className="bg-gray-900 text-white p-4 rounded-lg shadow-lg">{error}</div>
            ) : (
              Object.entries(prices).map(([name, { latest, previous, change }]) => (
                <div key={name} className="bg-gray-900 text-white p-4 rounded-lg shadow-lg flex items-center hover:scale-105">
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold">{name}</h2>
                    <p className={`text-lg ${getPriceColor(change)}`}>
                      {latest} <span className="text-sm">(Prev: {previous})</span>
                    </p>
                    <p className={`text-sm ${getPriceColor(change)}`}>
                      {change >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                      {isNaN(change) ? 'N/A' : Math.abs(parseFloat(change)).toFixed(2)}
                      ({change >= 0 ? 'Up' : 'Down'})
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-8">
          {/* Individual Stock Data */}
          <div className="bg-gray-900 hover:scale-105 text-white p-6 rounded-lg shadow-lg h-40 flex flex-col justify-center items-center" onClick={() => handleNavigate('individual-stock')}>
            <FaChartLine className="text-4xl mb-2" />
            <h2 className="text-2xl font-bold">Individual Stock Data</h2>
          </div>

          {/* Stock Comparison */}
          <div className="bg-gray-900 hover:scale-105 text-white p-6 rounded-lg shadow-lg h-40 flex flex-col justify-center items-center" onClick={() => handleNavigate('compare')}>
            <FaChartBar className="text-4xl mb-2" />
            <h2 className="text-2xl font-bold">Stock Comparison</h2>
          </div>

          {/* Watchlist */}
          <div className="bg-gray-900 hover:scale-105 text-white p-6 rounded-lg shadow-lg h-40 flex flex-col justify-center items-center" onClick={() => handleNavigate('watchlist')}>
            <FaListUl className="text-4xl mb-2" />
            <h2 className="text-2xl font-bold">Watchlist</h2>
          </div>

          {/* Holidays */}
          <div className="bg-gray-900 hover:scale-105 text-white p-6 rounded-lg shadow-lg h-40 flex flex-col justify-center items-center" onClick={() => handleNavigate('holidays')}>
            <FaCalendarAlt className="text-4xl mb-2" />
            <h2 className="text-2xl font-bold">Holidays</h2>
          </div>

          {/* News */}
          <div className="bg-gray-900 hover:scale-105 text-white p-6 rounded-lg shadow-lg h-40 flex flex-col justify-center items-center" onClick={() => handleNavigate('recent-news')}>
            <FaNewspaper className="text-4xl mb-2" />
            <h2 className="text-2xl font-bold">News</h2>
          </div>

          {/* Interactive Charts */}
          <div className="bg-gray-900 hover:scale-105 text-white p-6 rounded-lg shadow-lg h-40 flex flex-col justify-center items-center" onClick={() => handleNavigate('charts')}>
          <FaInfoCircle className="text-4xl mb-2" />  
            <h2 className="text-2xl font-bold">Interactive Area Chart</h2>
          </div>

          {/* Prediction */}
          <div className="bg-gray-900 hover:scale-105 text-white p-6 rounded-lg shadow-lg h-40 flex flex-col justify-center items-center" onClick={() => handleNavigate('prediction')}>
            <FaLightbulb className="text-4xl mb-2" />
            <h2 className="text-2xl font-bold">Prediction</h2>
          </div>

          {/* Stock Info */}
          <div className="bg-gray-900 hover:scale-105 text-white p-6 rounded-lg shadow-lg h-40 flex flex-col justify-center items-center" onClick={() => handleNavigate('info')}>
            <FaInfoCircle className="text-4xl mb-2" />
            <h2 className="text-2xl font-bold">Stock Info</h2>
          </div>

          {/* Fundamentals */}
          <div className="bg-gray-900 hover:scale-105 text-white p-6 rounded-lg shadow-lg h-40 flex flex-col justify-center items-center" onClick={() => handleNavigate('fundamentals')}>
            <FaClipboardList className="text-4xl mb-2" />
            <h2 className="text-2xl font-bold">Fundamentals</h2>
          </div>

          {/* Stock Analysis */}
          <div className="bg-gray-900 hover:scale-105 text-white p-6 rounded-lg shadow-lg h-40 flex flex-col justify-center items-center" onClick={() => handleNavigate('analysis')}>
            <FaClipboard className="text-4xl mb-2" />
            <h2 className="text-2xl font-bold">Stock Analysis</h2>
          </div>

          {/* Price Movement Chart */}
          <div className="bg-gray-900 hover:scale-105 text-white p-6 rounded-lg shadow-lg h-40 flex flex-col justify-center items-center" onClick={() => handleNavigate('chart')}>
            <FaChartArea className="text-4xl mb-2" />
            <h2 className="text-2xl font-bold">Price Movement Chart</h2>
          </div>

          {/* Moving Averages */}
          <div className="bg-gray-900 hover:scale-105 text-white p-6 rounded-lg shadow-lg h-40 flex flex-col justify-center items-center" onClick={() => handleNavigate('averages')}>
            <TbChartHistogram className="text-4xl mb-2" />
            <h2 className="text-2xl font-bold">Moving Averages</h2>
          </div>

          {/* Tax Calculation */}
          <div className="bg-gray-900 hover:scale-105 text-white p-6 rounded-lg shadow-lg h-40 flex flex-col justify-center items-center" onClick={() => handleNavigate('portfolio')}>
            <TbChartHistogram className="text-4xl mb-2" />
            <h2 className="text-2xl font-bold">Tax Calculation</h2>
          </div>
        </div>
      </main>

      {/* Chatbot Icon */}
      <div
        className="fixed bottom-8 right-8 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 cursor-pointer z-50"
        onClick={toggleChat}
      >
        <FaComments className="text-2xl" />
      </div>

      {/* Chatbot Dialog Box */}
      {isChatOpen && (
        <div className="fixed bottom-20 right-8 w-96 h-[500px] bg-white shadow-lg rounded-lg z-50 flex flex-col">
          {/* Chatbot Header */}
          <div className="bg-blue-500 text-white p-4 rounded-t-lg flex justify-between items-center">
            <h2 className="text-lg font-bold">Money Bot</h2>
            <button onClick={toggleChat} className="text-white hover:text-gray-200">
              <FaTimes className="text-xl" />
            </button>
          </div>

          {/* Chatbot Iframe */}
          <iframe
            src="https://cdn.botpress.cloud/webchat/v2.2/shareable.html?configUrl=https://files.bpcontent.cloud/2025/03/22/11/20250322110436-HEJP1ADW.json"
            className="flex-grow rounded-b-lg"
            style={{ border: 'none' }}
          ></iframe>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 p-4 text-center text-gray-300">
        <p>&copy; {new Date().getFullYear()} Stock Dashboard. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;