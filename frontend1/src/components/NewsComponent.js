import React, { useState, useEffect } from "react";
import axios from "axios";
import { ClipLoader } from "react-spinners"; // For a loading spinner

const NewsComponent = ({ ticker }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      const API_URL = process.env.REACT_APP_BACKEND_URL;
      setLoading(true);
      try {
        console.log("Fetching news for ticker:", ticker);
        const response = await axios.get("http://localhost:5000/stock-news1", {
          params: { ticker },
        });
        console.log("News response:", response.data);
        setNews(response.data);
      } catch (error) {
        console.error("Error fetching news:", error);
        setError("Error fetching news. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [ticker]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <ClipLoader size={50} color="#4A90E2" /> {/* Loading spinner */}
      </div>
    );
  }
  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="p-6 bg-gray-950 text-white">
      <h2 className="text-3xl font-bold mb-8 text-center">
        News for <span className="text-green-500">{ticker}</span>
      </h2>
      {news.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-gray-900 rounded-lg shadow-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-800">
                <th className="p-4 text-left text-sm font-medium text-white uppercase tracking-wider">
                  News
                </th>
                <th className="p-4 text-center text-sm font-medium text-white uppercase tracking-wider">
                  Sentiment
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {news.map((item, index) => (
                <tr key={index} className="hover:bg-gray-800 transition-colors duration-200">
                  <td className="p-4">
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:text-cyan-500 underline"
                    >
                      {item.news}
                    </a>
                    <div className="text-xs text-gray-400 mt-1">
                      {item.source} • {item.time}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                  <span
  className={`px-2 py-1 rounded-full text-sm font-semibold ${
    item.sentiment === "positive"
      ? "bg-green-500 text-white" // Green for Positive
      : item.sentiment === "negative"
      ? "bg-red-500 text-white" // Red for Negative
      : "bg-yellow-500 text-black" // Yellow for Neutral
  }`}
>
  {item.sentiment}
</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-gray-500 text-center">No news available</div>
      )}
    </div>
  );
};

export default NewsComponent;