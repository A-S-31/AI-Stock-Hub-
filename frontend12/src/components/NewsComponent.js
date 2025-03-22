import React, { useState, useEffect } from "react";
import axios from "axios";

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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="flex justify-center w-full h-[500px] mb-5">
    {news.length > 0 ? (
      <div className="w-full md:w-4/5 lg:w-3/4 xl:w-2/3 overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-3 border border-gray-300 text-left">News</th>
              <th className="p-3 border border-gray-300 text-center">Sentiment</th>
            </tr>
          </thead>
          <tbody>
            {news.map((item, index) => (
              <tr key={index} className="border border-gray-300 hover:bg-gray-100 transition-colors duration-200">
                <td className="p-3 border border-gray-300">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-500 underline hover:text-cyan-600"
                  >
                    {item.news}
                  </a>
                  <div className="text-xs text-gray-600 mt-1">
                    {item.source} • {item.time}
                  </div>
                </td>
                <td className="p-3 border border-gray-300 text-center">
                  {item.sentiment}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <div className="text-gray-500">No news available</div>
  )}
  </div>
  
  );
};

export default NewsComponent;
