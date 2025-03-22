import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

const Watchlist = () => {
  const [nseData, setNseData] = useState([]);
  const [tickerInput, setTickerInput] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [watchlists, setWatchlists] = useState([]); // Array to store multiple watchlists
  const [activeWatchlist, setActiveWatchlist] = useState(null); // Active watchlist for display
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newWatchlistName, setNewWatchlistName] = useState('');
  const { user,isAuthenticated } = useKindeAuth();



  useEffect(() => {
    const loadTickers = async () => {
      try {
        const response = await fetch('/CodeList2.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const nseSymbols = data['NSE - Yahoo Code '] ? data['NSE - Yahoo Code '].map(row => ({
          nseSymbol: row['NSE Symbol'],
          companyName: row['Security Name'],
        })) : [];
        setNseData(nseSymbols);
      } catch (error) {
        console.error('Error loading JSON file:', error);
      }
    };

    loadTickers();
  }, []);



  useEffect(() => {
    if (tickerInput) {
      const filtered = nseData.filter(item =>
        item.nseSymbol.toLowerCase().includes(tickerInput.toLowerCase()) ||
        item.companyName.toLowerCase().includes(tickerInput.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions([]);
    }
  }, [tickerInput, nseData]);

  const handleInputChange = (e) => {
    setTickerInput(e.target.value);
  };


  useEffect(() => {
    const API_URL = process.env.REACT_APP_BACKEND_URL;
    if (isAuthenticated && user && user.id) {
      const fetchWatchlist = async () => {
        try {
          // Step 1: Fetch the existing watchlist
          const response = await axios.get(`http://localhost:5000/get-watchlist`, {
            params: { userId: user.id }
          });
  
          const watchlistsData = response.data;
  
          if (Array.isArray(watchlistsData)) {
            // Step 2: Fetch updated stock prices for each stock in the watchlist
            const updatedWatchlists = await Promise.all(
              watchlistsData.map(async (list) => {
                const updatedItems = await Promise.all(
                  list.items.map(async (item) => {
                    // Fetch updated stock price
                    const stockData = await fetchStockData(item.Stock, item.stockName,item.Watchlist);
                    return {
                      ...item,
                      companyName: item.stockName,
                      currentPrice: stockData.currentPrice, 
                      nseSymbol: item.Stock
                    };
                  })
                );
                
                return {
                  name: list.name,
                  items: updatedItems
                };
              })
            );
  
            // Step 3: Update the state with the updated watchlists
            setWatchlists(updatedWatchlists);
          } else {
            throw new Error('Unexpected data format');
          }
        } catch (err) {
          setError('Failed to fetch watchlist');
          console.error(err);
        }
      };
  
      fetchWatchlist();
    }
  }, [isAuthenticated, user]);
  
  




  const handleSuggestionClick = async (suggestion) => {
    console.log('Suggestion clicked:', suggestion);
    setTickerInput('');
    setFilteredSuggestions([]);
    const stockData = await fetchStockData(suggestion.nseSymbol,suggestion.companyName,activeWatchlist);

    setWatchlists(prevWatchlists => {
      const updatedWatchlists = [...prevWatchlists];
      const index = updatedWatchlists.findIndex(list => list.name === activeWatchlist);
      
      if (index !== -1) {
        console.log('Current watchlist items:', updatedWatchlists[index].items);
        const itemExists = updatedWatchlists[index].items.some(item => item.nseSymbol === suggestion.nseSymbol);

        if (!itemExists) {
          console.log('Adding item to watchlist:', suggestion);
          updatedWatchlists[index].items.push({ ...suggestion, currentPrice: stockData.currentPrice });
        } else {
          console.log('Item already exists in watchlist:', suggestion);
        }
      }

      console.log('Updated watchlists:', updatedWatchlists);
      return updatedWatchlists;
    });
  };

  const fetchStockData = async (nseSymbol, companyName, activeWatchlist) => {
    const API_URL = process.env.REACT_APP_BACKEND_URL;
    console.log("API URL:", API_URL); // Log the API URL
    setLoading(true);
    setError(null);
    
    try {
        const params = { ticker: nseSymbol, stockName: companyName, watchlist_name: activeWatchlist };

        // Add userId to params only if authenticated
        if (isAuthenticated && user && user.id) {
            params.userId = user.id;
        }

        const response = await axios.get(`http://localhost:5000/current-price`, { params });
        const stockData = response.data;
        console.log(stockData);
        const currentPrice = stockData.current_price || 'N/A';
        return { currentPrice };
    } catch (error) {
        console.error('Error fetching stock data:', error);
        return { currentPrice: 'N/A' };
    } finally {
        setLoading(false);
    }
};


  const handleCreateWatchlist = () => {
    if (newWatchlistName) {
      setWatchlists(prevWatchlists => [
        ...prevWatchlists,
        { name: newWatchlistName, items: [], isOpen: false }
      ]);
      setNewWatchlistName('');
    }
  };

  const handleToggleWatchlist = (name) => {
    setWatchlists(prevWatchlists =>
      prevWatchlists.map(list =>
        list.name === name ? { ...list, isOpen: !list.isOpen } : list
      )
    );
    setActiveWatchlist(name);
  };

  const handleRemoveWatchlist = async (name) => {
    const API_URL = process.env.REACT_APP_BACKEND_URL  ;
    try {
      const response = await axios.delete(`http://localhost:5000/remove-watchlist`, {
        params: { watchlist_name: name },
      });
  
      // Log the server response for debugging
      console.log('Server response:', response.data);
  
      // Remove the watchlist from state
      setWatchlists(prevWatchlists => prevWatchlists.filter(list => list.name !== name));
      if (activeWatchlist === name) {
        setActiveWatchlist(null);
      }
    } catch (error) {
      // Log the error response for debugging
      console.error('Error removing watchlist:', error.response ? error.response.data : error.message);
      setError('Failed to remove watchlist');
    }
  };


  // Function to handle removal of a stock from the watchlist and database
  const handleRemoveStock = async (watchlistName, stockSymbol) => {
    const API_URL = process.env.REACT_APP_BACKEND_URL  ;
    try {
      const params = { watchlist_name: watchlistName, stock_symbol: stockSymbol };

        // Add userId to params only if authenticated
        if (isAuthenticated && user && user.id) {
            params.userId = user.id;
        }
      // Send a request to remove the stock from the database

      const response = await axios.delete(`http://localhost:5000/remove-stock`, {params},
      );

      console.log('Server response:', response.data);

      // Update the state by removing the stock from the corresponding watchlist
      setWatchlists(prevWatchlists =>
        prevWatchlists.map(list =>
          list.name === watchlistName
            ? { ...list, items: list.items.filter(item => item.nseSymbol !== stockSymbol) }
            : list
        )
      );
    } catch (error) {
      console.error('Error removing stock:', error.response ? error.response.data : error.message);
      setError('Failed to remove stock');
    }
  };
  


  return (
    <div style={{ flex: 1, padding: '30px', backgroundColor: 'rgb(14, 17, 23)', color: 'white', minHeight: '100vh' }}>
      <h2>Watchlist</h2>
      

      {/* Input Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
       
          
        {/* Watchlist Creation Section */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={newWatchlistName}
            onChange={(e) => setNewWatchlistName(e.target.value)}
            placeholder="New watchlist name"
            style={{
              padding: '10px',
              backgroundColor: 'rgb(28, 29, 36)',
              color: 'white',
              border: '1px solid rgb(28, 29, 36)',
              borderRadius: '5px',
              flex: 1,
            }}  
          />
          <button
            onClick={handleCreateWatchlist}
            style={{
              padding: '10px',
              backgroundColor: 'green',
              border: 'none',
              color: 'white',
              borderRadius: '5px',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            Create Watchlist
          </button>
        </div>
        <input
          type="text"
          value={tickerInput}
          onChange={handleInputChange}
          placeholder="Enter stock ticker or company name"
          style={{
            padding: '10px',
            backgroundColor: 'rgb(28, 29, 36)',
            color: 'white',
            border: '1px solid rgb(28, 29, 36)',
            borderRadius: '5px',
            width: '100%',
            
          }}
          disabled={watchlists.length === 0}
        />
        {filteredSuggestions.length > 0 && (
          <div style={{
            maxHeight: '150px',
            overflowY: 'auto',
            backgroundColor: 'rgb(28, 29, 36)',
            borderRadius: '5px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
            width: '100%',
          }}>
            {filteredSuggestions.map((item, index) => (
              <div
                key={index}
                onClick={() => handleSuggestionClick(item)}
                style={{
                  padding: '10px',
                  cursor: 'pointer',
                  borderBottom: '1px solid rgb(38, 39, 48)',
                  color: 'white',
                }}
              >
                <div><strong>{item.nseSymbol}</strong> ({item.companyName})</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Watchlists Display */}
      {watchlists.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
          {watchlists.map((list, index) => (
            <div key={index} style={{ flex: '1 1 calc(50% - 20px)', borderRadius: '5px', padding: '10px' }}>
              <div
                style={{ 
                  cursor: 'pointer',
                  padding: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: 'rgb(38, 39, 48)',
                  borderRadius: '5px',
                }}
                onClick={() => handleToggleWatchlist(list.name)}
              >
                <h3 style={{ margin: 0 }}>{list.name}</h3>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent click event from propagating to the list toggle
                    handleRemoveWatchlist(list.name);
                  }}
                  style={{
                    padding: '5px',
                    backgroundColor: 'red',
                    border: 'none',
                    color: 'white',
                    borderRadius: '5px',
                    cursor: 'pointer',
                  }}
                >
                  Remove
                </button>
              </div>
              {list.isOpen && (
                <div style={{ marginTop: '10px' }}>
                   <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                    <thead>
                      <tr>
                        <th style={{ border: '1px solid white',textAlign: 'left', padding: '10px', backgroundColor: 'rgb(14, 17, 23)' }}>Symbol</th>
                        <th style={{ border: '1px solid white',textAlign: 'left', padding: '10px', backgroundColor: 'rgb(14, 17, 23)' }}>Name</th>
                        <th style={{ border: '1px solid white',textAlign: 'left', padding: '10px', backgroundColor: 'rgb(14, 17, 23)' }}>Current Price</th>
                        <th style={{ border: '1px solid white', textAlign: 'left', padding: '5px', backgroundColor: 'rgb(14, 17, 23)' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.items.map((item, itemIndex) => (
                        <tr key={itemIndex}>
                          <td style={{ border: '1px solid white',padding: '10px',backgroundColor: 'rgb(14, 17, 23)'  }}>{item.nseSymbol}</td>
                          <td style={{ border: '1px solid white',padding: '10px',backgroundColor: 'rgb(14, 17, 23)'  }}>{item.companyName}</td>
                          <td style={{border: '1px solid white', padding: '10px',backgroundColor: 'rgb(14, 17, 23)'  }}>{item.currentPrice}</td>
                          <td style={{ border: '1px solid white', textAlign: 'center', padding: '5px', backgroundColor: 'rgb(14, 17, 23)' }}>
                          <FontAwesomeIcon
  icon={faTimes}
  className="text-xl text-red-600 cursor-pointer"
  onClick={() => handleRemoveStock(list.name, item.nseSymbol)}
/>
                      </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default Watchlist;
  