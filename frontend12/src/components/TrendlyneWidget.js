import React, { useEffect } from "react";

const TrendlyneWidgets = ({ ticker }) => {
  useEffect(() => {
    // Load Trendlyne widgets script
    const trendlyneScript = document.createElement("script");
    trendlyneScript.src = "https://cdn-static.trendlyne.com/static/js/webwidgets/tl-widgets.js";
    trendlyneScript.async = true;
    trendlyneScript.charset = "utf-8";
    document.body.appendChild(trendlyneScript);

    // Cleanup scripts when the component unmounts
   
  }, []);

  const stripTicker = (ticker) => {
    return ticker.split(".")[0]; // Splits by '.' and returns the first part
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-center">Analysis for <span style={{color:"green"}}> {ticker}</span> </h2>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-2">
        {/* SWOT Widget */}
        <div className=" rounded-lg shadow-md">
          <blockquote
            className="trendlyne-widgets"
            data-get-url={`https://trendlyne.com/web-widget/swot-widget/Poppins/${stripTicker(ticker)}/?posCol=00A25B&primaryCol=006AFF&negCol=EB3B00&neuCol=F7941E`}
            data-theme="light"
          ></blockquote>
        </div>


        {/* QVT Widget */}
        <div className=" rounded-lg shadow-md ">
          <blockquote
            className="trendlyne-widgets"
            data-get-url={`https://trendlyne.com/web-widget/qvt-widget/Poppins/${stripTicker(ticker)}/?posCol=00A25B&primaryCol=006AFF&negCol=EB3B00&neuCol=F7941E`}
            data-theme="light"
          ></blockquote>
        </div>

        {/* Technical Widget */}
        <div className=" rounded-lg shadow-md">
          <blockquote
            className="trendlyne-widgets"
            data-get-url={`https://trendlyne.com/web-widget/technical-widget/Poppins/${stripTicker(ticker)}/?posCol=00A25B&primaryCol=006AFF&negCol=EB3B00&neuCol=F7941E`}
            data-theme="light"
          ></blockquote>
        </div>

        

        {/* Checklist Widget */}
        <div className="rounded-lg shadow-md">
          <blockquote
            className="trendlyne-widgets"
            data-get-url={`https://trendlyne.com/web-widget/checklist-widget/Poppins/${stripTicker(ticker)}/?posCol=00A25B&primaryCol=006AFF&negCol=EB3B00&neuCol=F7941E`}
            data-theme="light"
          ></blockquote>
        </div>
      </div>
    </div>
  );
};

export default TrendlyneWidgets;
