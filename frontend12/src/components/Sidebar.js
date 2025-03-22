import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faChevronRight } from '@fortawesome/free-solid-svg-icons';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const handleNavigationChange = (path) => {
    navigate(path);
  };

  const stockPaths = [
    '/individual-stock',
    '/individual-stock/price-movements',
    '/individual-stock/chart',
    '/individual-stock/moving-averages',
    '/individual-stock/recent-news',
    '/individual-stock/fundamentals',
    '/individual-stock/stock-analysis',
    '/individual-stock/info'
  ];

  return (
    <div
      style={{
        width: sidebarOpen ? '230px' : '0',
        transition: 'width 0.3s',
        padding: sidebarOpen ? '10px' : '0',
        backgroundColor: 'rgb(38, 39, 48)',
        color: 'white',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        zIndex: 1,
      }}
    >
      {sidebarOpen && (
        <>
          <button
            onClick={() => setSidebarOpen(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '20px',
              cursor: 'pointer',
              position: 'absolute',
              top: '10px',
              right: '10px',
            }}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
          <div style={{ padding: '10px' }}>
            <h3>Navigation</h3>
            <label>
              <input
                type="radio"
                name="navigation"
                checked={currentPath === '/compare'}
                onChange={() => handleNavigationChange('/compare')}
                style={{ marginBottom: '10px' }}
              />{' '}
              Stock Comparison
            </label>
            <br />
            <label>
              <input
                type="radio"
                name="navigation"
                checked={stockPaths.includes(currentPath)} 
                onChange={() => handleNavigationChange('/individual-stock')}
                style={{ marginBottom: '10px' }}
              />{' '}
              Individual Stock Data
            </label>
            <br />
            <label>
              <input
                type="radio"
                name="navigation"
                checked={currentPath === '/holidays'}
                onChange={() => handleNavigationChange('/holidays')}
                style={{ marginBottom: '10px' }}
              />{' '}
              Holidays
            </label>
            <br />
            <label>
              <input
                type="radio"
                name="navigation"
                checked={currentPath === '/watchlist'}
                onChange={() => handleNavigationChange('/watchlist')}
                style={{ marginBottom: '10px' }}
              />{' '}
              Watchlist
            </label>
            <br />
            <label>
              <input
                type="radio"
                name="navigation"
                checked={currentPath === '/charts'}
                onChange={() => handleNavigationChange('/charts')}
                style={{ marginBottom: '10px' }}
              />{' '}
              Interactive Charts
            </label>
            <br />
            <label>
              <input
                type="radio"
                name="navigation"
                checked={currentPath === '/prediction'}
                onChange={() => handleNavigationChange('/prediction')}
                style={{ marginBottom: '10px' }}
              />{' '}
              Prediction
            </label>
            <br />
            <label>
              <input
                type="radio"
                name="navigation"
                checked={currentPath === '/portfolio-form'}
                onChange={() => handleNavigationChange('/portfolio-form')}
                style={{ marginBottom: '10px' }}
              />{' '}
              Tax Calculation
            </label>
            <br />
            <label>
              <input
                type="radio"
                name="navigation"
                checked={currentPath === '/'}
                onChange={() => handleNavigationChange('/')}
                style={{ marginBottom: '10px' }}
              />{' '}
              Home
            </label>
            <br />
          </div>
        </>
      )}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            fontSize: '30px',
            cursor: 'pointer',
            position: 'absolute',
            top: '10px',
            left: '10px',
          }}
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      )}
    </div>
  );
};

export default Sidebar;
