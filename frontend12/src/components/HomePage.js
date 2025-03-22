import React,{useEffect,useState} from 'react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDays, faCalendarWeek, faCalendarAlt,faCalendar,faCalendarDay,faCalendarCheck,faCalendarXmark,faCalendarPlus } from '@fortawesome/free-solid-svg-icons';
import {useKindeAuth} from "@kinde-oss/kinde-auth-react";
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import axios from 'axios';
import area from './images/area.jpg'
import stocks from './images/stonks.jpg'
import fundamentals from './images/fundamentals.jpg'
import info from './images/info.jpg'
import analysis from './images/analysis.jpg'
import vi1 from './images/vi1.mp4'
import vi7 from './images/vi7.mp4'
import price from './images/bullbear.jpg'





const HomePage = () => {
  const navigate = useNavigate();
  const { login, register,isAuthenticated,user,logout } = useKindeAuth();
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await axios.get('http://localhost:5000/latest-prices');
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
    } 
    else if(destination==='recent-news'){
      navigate('/individual-stock/recent-news')
    } 
     else if(destination==='info'){
      navigate('/individual-stock/info')
    } 
    else if(destination==='fundamentals'){
      navigate('/individual-stock/fundamentals')
    }
    else if (destination === 'holidays') {
      navigate('/holidays');
    } 
    else if(destination==='averages'){
      navigate('/individual-stock/moving-averages')
    }
    else if(destination==='chart'){
      navigate('/individual-stock/chart')
    }
    else if(destination==='movement'){
      navigate('/individual-stock/price-movements')
    }
    else if(destination==='analysis'){
      navigate('/individual-stock/stock-analysis')
    }
    else if (destination === 'watchlist') {
      navigate('/watchlist');
    }
    else if (destination === 'compare') {
      navigate('/compare');
    }
    else if (destination === 'prediction') {
      navigate('/prediction');
    }
    else if (destination === 'charts') {
      navigate('/charts');
    }
     else {
      navigate('/'); 
    }
  };
  useEffect(() => {
    // Function to add TradingView Hotlists widget script
    const addTradingViewHotlistsScript = () => {
      const existingScript = document.getElementById('tradingview-hotlists-widget-script');
      if (!existingScript) {
        const script = document.createElement('script');
        script.id = 'tradingview-hotlists-widget-script';
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-hotlists.js';
        script.async = true;
        script.innerHTML = JSON.stringify({
          colorTheme: 'dark',
          dateRange: '12M',
          exchange: 'BSE',
          showChart: true,
          locale: 'en',
          width: '100%',
          height: '90%',
          largeChartUrl: '',
          isTransparent: true,
          showSymbolLogo: true,
          showFloatingTooltip: true,
          plotLineColorGrowing: 'rgba(41, 98, 255, 1)',
          plotLineColorFalling: 'rgba(41, 98, 255, 1)',
          gridLineColor: 'rgba(42, 46, 57, 0)',
          scaleFontColor: 'rgba(209, 212, 220, 1)',
          belowLineFillColorGrowing: 'rgba(41, 98, 255, 0.12)',
          belowLineFillColorFalling: 'rgba(41, 98, 255, 0.12)',
          belowLineFillColorGrowingBottom: 'rgba(41, 98, 255, 0)',
          belowLineFillColorFallingBottom: 'rgba(41, 98, 255, 0)',
          symbolActiveColor: 'rgba(41, 98, 255, 0.12)',
        });
        document.getElementById('tradingview-hotlists-widget').appendChild(script);
      }
    };

    // Function to add TradingView Timeline widget script
    const addTradingViewTimelineScript = () => {
      const existingScript = document.getElementById('tradingview-timeline-widget-script');
      if (!existingScript) {
        const script = document.createElement('script');
        script.id = 'tradingview-timeline-widget-script';
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-timeline.js';
        script.async = true;
        script.innerHTML = JSON.stringify({
          feedMode: 'market',
          isTransparent: true,
          displayMode: 'regular',
          width: '100%',
          height: '90%',
          colorTheme: 'dark',
          locale: 'en',
          market: 'stock',
        });
        document.getElementById('tradingview-timeline-widget').appendChild(script);
      }
    };

    // Add both widgets
    addTradingViewHotlistsScript();
    addTradingViewTimelineScript();

    // Cleanup function to remove scripts on unmount
    return () => {
      const hotlistsScript = document.getElementById('tradingview-hotlists-widget-script');
      if (hotlistsScript) {
        // hotlistsScript.remove();
      }

      const timelineScript = document.getElementById('tradingview-timeline-widget-script');
      if (timelineScript) {
        // timelineScript.remove();
      }
    };
  }, []);


  
  // Data and options for the area chart
  const areaChartData = {
    labels: ['JAN', 'FEB', 'MAR', 'APR', 'MAY'],
    datasets: [
      {
        
        data: [30, 45, 70, 40, 90],
        fill: true,
        backgroundColor:'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
        tension: 0.4,
      },
    ],
  };

 

  // Options for the area chart
  const areaChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#fff', 
        },
      },
      y: {
        ticks: {
          color: '#fff', 
        },
      },
    },
  };


  

  // Data and options for the bar chart
  const barChartData = {
    labels: ['JAN', 'FEB', 'MAR', 'APR', 'MAY'],
    datasets: [
      {
       
        data: [12, 19, 3, 5, 2],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(255, 159, 64, 0.2)',
          'rgba(255, 205, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(201, 203, 207, 0.2)'
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(255, 159, 64)',
          'rgb(255, 205, 86)',
          'rgb(75, 192, 192)',
          'rgb(54, 162, 235)',
          'rgb(153, 102, 255)',
          'rgb(201, 203, 207)'
        ],
        borderWidth: 1,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    scales: {
      x: {
        ticks: {
          color: '#fff', 
        },
      },
      y: {
        ticks: {
          color: '#fff',
        },
      },
      
    },
    plugins: {
      legend: {
        display: false,
        position: 'top',
      },
    },
  };

  // Data for Stacked Bar/Line Chart
const stackedBarLineData = {
  labels: ['A', 'B', 'C', 'D', 'E'],
  datasets: [
    {
      type: 'bar',
     
      data: [70, 45, 90, 50, 69],
      backgroundColor: 'rgba(54, 162, 235, 0.6)',
    },
    {
      type: 'line',
   
      data: [120, 150, 180, 90, 70],
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 2,
      fill: false,
    },
  ],
};

// Options for Stacked Bar/Line Chart
const stackedBarLineOptions = {
  responsive: true,
  scales: {
    x: {
      stacked: true,
      ticks: {
        color: '#fff',
      },
    },
    y: {
      stacked: false,
      ticks: {
        color: '#fff',
      },
    },
  },
  plugins: {
    legend: {
      display: false,
      position: 'top',
    },
  },
};

const chartData = {
  labels: ['JAN', 'FEB', 'MAR', 'APR', 'MAY','JUN','JUL'],
  datasets: [
    {
      
      data: [30, 45, 50, 40, 59, 60, 70],
      borderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)', 
      fill: false, 
      tension: 0.4, 
    },
    {
     
      data: [20, 35, 45, 55, 50, 65, 80],
      borderColor: 'rgba(255, 99, 132, 1)', 
      backgroundColor: 'rgba(255, 99, 132, 0.2)', 
      fill: false, 
      tension: 0.4, 
    },
  ],
};
const chartoption={
  scales: {
    x: {
      ticks: {
        color: '#fff', 
      },
    },
    y: {
      ticks: {
        color: '#fff',
      },
    },
    
  },
  plugins: {
    legend: {
      display: false,
    },
}
}



  return (
    <div className="flex flex-col  w-full">
      {/* Navbar */}
      <nav className="bg-gray-900 p-3">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-white text-2xl font-bold">Stock Dashboard</h1>
          {!isAuthenticated &&(
             <div>
             <ul className="flex flex-grow justify-end flex-wrap items-center">
                 <li>
                   <button onClick={login} type="button" className="text-gray-200 px-4 font-semibold flex items-center underline">SignIn</button>
                 </li>
                 <li>
                     <button onClick={register}  className='btn btn-primary px-4 font-semibold flex items-center text-white no-underline' type="button">SignUp</button>
                 </li>
               </ul>
             </div>
          )}
          {isAuthenticated &&(
             <div className="text-white flex flex-grow justify-end flex-wrap items-center">
             {/* <p>id :{user.id}</p> */}
             {/* <p >Your name: {user?.given_name}</p> */}
             {/* <p>Your email: {user?.email}</p> */}
             
             {/* <img src={user?.picture} alt="user" /> */}
             {/* <pre className='text-white'>{JSON.stringify(user, null, 2)}</pre> */}
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
      <main className="flex-grow p-8 bg-gray-400  w-full">
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
                <h2 className="text-lg font-semibold ">{name}</h2>
                <p className={`text-lg ${getPriceColor(change)}`}>
                  {latest} <span className="text-sm">(Prev: {previous})</span>
                </p>
                <p className={`text-sm ${getPriceColor(change)}`}>
                  {change >= 0 ? <FaArrowUp /> : <FaArrowDown />} {Math.abs(change.toFixed(2))} ({change >= 0 ? 'Up' : 'Down'})
                </p>
              </div>
            </div>
          ))
        )}
      </div>
          </div>


        <div className="grid grid-cols-6 gap-6">
          {/* Individual Stock Data */}
          <div className="bg-gray-900  hover:scale-105 text-white p-8 rounded-lg shadow-lg h-70 col-span-3" onClick={() => handleNavigate('individual-stock')} >
            <h2 className="text-2xl font-bold mb-4">Individual Stock Data</h2>
            {/* <Bar data={barChartData} options={barChartOptions} /> */}
            <video
      width="100%"
      height="200px"
      loop
      autoPlay      
      muted        
      playsInline   
      preload="auto"       
      
      >
        <source src={vi1} type="video/mp4"  /> 
        Your browser does not support the video tag.
      </video>
          </div>  
          

          {/* Stock Comparison */}
          <div className="bg-gray-900  hover:scale-105 text-white p-8 rounded-lg shadow-lg h-70 col-span-3" onClick={() => handleNavigate('compare')}>
            <h2 className="text-2xl font-bold mb-4">Stock Comparison</h2>
            {/* <Bar data={stackedBarLineData} options={stackedBarLineOptions} /> */}
            
             <video
      width="100%"
      height="200px"
      loop
      autoPlay      
      muted        
      playsInline   
      preload="auto"       
      
      >
        <source src={vi7} type="video/mp4"  /> 
        Your browser does not support the video tag.
      </video>
          </div>

         

           {/* Watchlist */}
           <div className="bg-gray-900  hover:scale-105 text-white p-8 rounded-lg shadow-lg col-span-2 row-span-3" onClick={() => handleNavigate('watchlist')}>
            <h2 className="text-2xl font-bold mb-2 ">Watchlist</h2>
            <div id="tradingview-hotlists-widget" className="tradingview-widget-container" style={{ height:"500px"}}>
          </div>
          </div>
          

          {/* Holidays */}
          <div className="bg-gray-900  hover:scale-105 text-white p-8 rounded-lg shadow-lg h-70 flex flex-col items-center space-y-4 col-span-2" onClick={() => handleNavigate('holidays')}>
      <h2 className="text-2xl font-bold mb-4">Holidays</h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center justify-center">
          <FontAwesomeIcon icon={faCalendarDays} className="text-xl" />
        </div>
        <div className="flex items-center justify-center">
          <FontAwesomeIcon icon={faCalendarWeek} className="text-xl" />
        </div>
        <div className="flex items-center justify-center">
          <FontAwesomeIcon icon={faCalendarAlt} className="text-xl" />
        </div>
        <div className="flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
        </svg>
        </div>
        <div className="flex items-center justify-center">
          <FontAwesomeIcon icon={faCalendarPlus} className="text-xl" />
        </div>
        <div className="flex items-center justify-center">
          <FontAwesomeIcon icon={faCalendarCheck} className="text-xl" />
        </div>
        <div className="flex items-center justify-center">
          <FontAwesomeIcon icon={faCalendarXmark} className="text-xl" />
        </div>
        <div className="flex items-center justify-center">
          <FontAwesomeIcon icon={faCalendarDay} className="text-xl" />
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 2.994v2.25m10.5-2.25v2.25m-14.252 13.5V7.491a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v11.251m-18 0a2.25 2.25 0 0 0 2.25 2.25h13.5a2.25 2.25 0 0 0 2.25-2.25m-18 0v-7.5a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v7.5m-6.75-6h2.25m-9 2.25h4.5m.002-2.25h.005v.006H12v-.006Zm-.001 4.5h.006v.006h-.006v-.005Zm-2.25.001h.005v.006H9.75v-.006Zm-2.25 0h.005v.005h-.006v-.005Zm6.75-2.247h.005v.005h-.005v-.005Zm0 2.247h.006v.006h-.006v-.006Zm2.25-2.248h.006V15H16.5v-.005Z" />
          </svg>
         </div>
          </div>
             
           {/* News */}
           <div className="bg-gray-900  hover:scale-105 text-white p-8 rounded-lg shadow-lg  col-span-2 row-span-3"  onClick={() => handleNavigate('recent-news')}>
            <h2 className="text-2xl font-bold mb-2">News</h2>
            <div id="tradingview-timeline-widget" className="tradingview-widget-container"  style={{ height:"500px"}}></div>
            
          </div>

            {/* Interactive Charts - Area Chart */}
            <div className="bg-gray-900  hover:scale-105 text-white p-8 rounded-lg shadow-lg h-73 col-span-2" onClick={() => handleNavigate('charts')}>
            <h2 className="text-2xl font-bold mb-4">Interactive Area Chart</h2>
            <Line data={areaChartData} options={areaChartOptions} />
          </div>

          

           {/* Prediction */}
           <div className="bg-gray-900  hover:scale-105 text-white p-8 rounded-lg shadow-lg h-60 col-span-2" onClick={() => handleNavigate('prediction')}>
            <h2 className="text-2xl font-bold mb-4">Prediction</h2>
            <Line data={chartData} options={chartoption} />
          </div>

         
         

        

          {/* Doughnut Chart */}
          <div className="bg-gray-900  hover:scale-105 text-white p-4 rounded-lg shadow-lg h-60 col-span-2" onClick={() => handleNavigate('info')}>
            <h2 className="text-2xl font-bold mb-2">Stock Info</h2>
            {/* <Doughnut data={doughnutChartData} options={doughnutChartOptions}  /> */}
            <img src={info} className='rounded-[20px] ml-3' style={{height:"160px", width:"300px"}}></img>
          </div>

         
      

         

          {/* Fundamentals - Bar Chart */}
          <div className="bg-gray-900  hover:scale-105 text-white p-8 rounded-lg shadow-lg h-60 col-span-2" onClick={() => handleNavigate('fundamentals')}>
            <h2 className="text-2xl font-bold mb-2">Fundamentals</h2>
            <img src={fundamentals} className='rounded-[20px]' style={{height:"140px", width:"300px"}}></img>
          </div>

          {/* Analysis */}
          <div className="bg-gray-900  hover:scale-105 text-white p-8 rounded-lg shadow-lg h-60 col-span-2" onClick={() => handleNavigate('analysis')}>
          <h2 className="text-2xl font-bold mb-2">Stock Analysis</h2>  <div className="w-full flex justify-between space-x-4">
            <img src={analysis} className='rounded-[20px]' style={{height:"150px", width:"300px"}}></img>
    </div>
          </div>


          {/* Price Moements */}
          <div className="bg-gray-900  hover:scale-105 text-white p-8 rounded-lg shadow-lg h-60 col-span-2" onClick={() => handleNavigate('movement')}>
            <h2 className="text-2xl font-bold mb-2">Price Movements</h2>
            <img src={price} className='rounded-[20px]' style={{height:"150px", width:"300px"}}></img>
          </div>


          {/* Charts */}
          <div className="bg-gray-900  hover:scale-105 text-white p-10 rounded-lg shadow-lg h-60 col-span-2" onClick={() => handleNavigate('chart')}>
            <h2 className="text-2xl font-bold mb-2">Price Movement Chart</h2>
             <img src={area} className='rounded-[20px]' style={{height:"150px", width:"300px"}}></img>
      
          </div>


           {/* Moving Averages */}
           <div className="bg-gray-900  hover:scale-105 text-white p-8 rounded-lg shadow-lg h-60 col-span-2" onClick={() => handleNavigate('averages')}>
            <h2 className="text-2xl font-bold mb-2">Moving Averages</h2>
             <img src={stocks}  className='rounded-[20px]' style={{height:"150px", width:"300px"}}></img>
              
          </div>
      </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 p-4 text-center text-gray-300">
        <p>&copy; {new Date().getFullYear()} Stock Dashboard. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;
