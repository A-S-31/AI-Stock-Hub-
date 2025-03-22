// import React, { useState } from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import StockComparison from './components/StockComparison';
// import Holidays from './components/Holidays';
// import IndividualStock from './components/IndividualStock';
// import Sidebar from './components/Sidebar';
// import CandleSticks from './components/CandleSticks';

// import Watchlist from './components/Watchlist';
// import StockPrediction from './components/StockPrediction';
// import HomePage from './components/HomePage';




// function App() {
//   const [sidebarOpen, setSidebarOpen] = useState(true);

//   return (
//     <Router>
//       <div style={{ display: 'flex' }}>
//         {/* <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} /> */}
//         <div style={{ flex: 1 }}>
//           <Routes>
//             <Route path="/" element={<HomePage />} />
//             {/* <Route path="/holidays" element={<Holidays />} />
//             <Route path="/individual-stock" element={<IndividualStock />} />
//             <Route path="/charts" element={<CandleSticks />} />
//             <Route path="/watchlist" element={<Watchlist />} />
//             <Route path="/prediction" element={<StockPrediction />} /> */}

//           </Routes>
//         </div>
//       </div>
//     </Router>
//   );
// }

// export default App;


import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import StockComparison from './components/StockComparison';
import Holidays from './components/Holidays';
import IndividualStock from './components/IndividualStock';
import Sidebar from './components/Sidebar';
import CandleSticks from './components/CandleSticks';
import Watchlist from './components/Watchlist';
import StockPrediction from './components/StockPrediction';
import HomePage2 from './components/HomePage2';
import { KindeProvider } from "@kinde-oss/kinde-auth-react";
import ScrollToTop from './components/ScrollToTop';
import PortfolioForm from './components/PortfolioForm';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Router>
          <ScrollToTop />
      <div style={{ display: 'flex' }}>
        <SidebarWrapper sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div style={{ flex: 1, display: 'flex' }}>
        <KindeProvider
		clientId="c7f50e7129f3434eb61ad33206f4ccc1"
		domain="https://stockmarketanalysis.kinde.com"
		redirectUri="http://localhost:3000"
		logoutUri="http://localhost:3000"
	>
            <Routes>
              <Route path="/" element={<HomePage2 />} />
              <Route path="/holidays" element={<Holidays />} />
              <Route path="/compare" element={<StockComparison />} />
              <Route path="/individual-stock" element={<IndividualStock />} />
              <Route path="/individual-stock/price-movements" element={<IndividualStock />} />
              <Route path="/individual-stock/chart" element={<IndividualStock />} />
              <Route path="/individual-stock/moving-averages" element={<IndividualStock />} />
              <Route path="/individual-stock/recent-news" element={<IndividualStock />} />
              <Route path="/individual-stock/fundamentals" element={<IndividualStock />} />
              <Route path="/individual-stock/stock-analysis" element={<IndividualStock />} />
              <Route path="/individual-stock/info" element={<IndividualStock />}/> 
              <Route path="/charts" element={<CandleSticks />} />
              <Route path="/watchlist" element={<Watchlist />} />
              <Route path="/prediction" element={<StockPrediction />} />
              <Route path="/portfolio-form" element={<PortfolioForm />} />
              
            </Routes>
            </KindeProvider>
        </div>
      </div>
    </Router>
  );
}

function SidebarWrapper({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();
  const showSidebar = !["/"].includes(location.pathname); // Hide sidebar on the home page
  return showSidebar ? (
    <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
  ) : null;
}

export default App;
