import axios from "axios";
import React, { useState } from "react";

const PortfolioForm = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [taxResult, setTaxResult] = useState(null);
  const [symbol, setSymbol] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [buyDate, setBuyDate] = useState("");
  const [sellDate, setSellDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addStock = () => {
    if (!symbol || !buyPrice || !sellPrice || !quantity || !buyDate || !sellDate) return;
    const newStock = { 
      symbol, 
      buy_price: parseFloat(buyPrice), 
      sell_price: parseFloat(sellPrice), 
      quantity: parseInt(quantity), 
      buy_date: buyDate, 
      sell_date: sellDate 
    };
    setPortfolio([...portfolio, newStock]);
    setSymbol(""); 
    setBuyPrice(""); 
    setSellPrice(""); 
    setQuantity(""); 
    setBuyDate(""); 
    setSellDate("");
  };

  const submitPortfolio = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post("http://localhost:5000/calculate-tax", { portfolio });
      setTaxResult(response.data);
    } catch (error) {
      console.error("Error calculating tax", error);
      setError("Error calculating tax. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ flex: 1, padding: "20px", backgroundColor: "rgb(14, 17, 23)", color: "gray", minHeight: "100vh" }}>Loading...</div>;
  if (error) return <div style={{ flex: 1, padding: "20px", backgroundColor: "rgb(14, 17, 23)", color: "gray", minHeight: "100vh" }}>{error}</div>;

  return (
    <div style={{ flex: 1, padding: "20px", backgroundColor: "rgb(14, 17, 23)", color: "gray", minHeight: "100vh" }}>
      <h2 className="text-xl font-bold mb-4">Enter Portfolio Details</h2>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <input type="text" value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="Stock Symbol" className="border p-2 rounded-md" />
        <input type="number" value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)} placeholder="Buy Price" className="border p-2 rounded-md" />
        <input type="number" value={sellPrice} onChange={(e) => setSellPrice(e.target.value)} placeholder="Sell Price" className="border p-2 rounded-md" />
        <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Quantity" className="border p-2 rounded-md" />
        <input type="date" value={buyDate} onChange={(e) => setBuyDate(e.target.value)} className="border p-2 rounded-md" />
        <input type="date" value={sellDate} onChange={(e) => setSellDate(e.target.value)} className="border p-2 rounded-md" />
      </div>

      <button onClick={addStock} className="bg-blue-500 text-white p-2 rounded-md mb-4">Add Stock</button>

      <h3 className="font-bold mb-2">Portfolio:</h3>
      <ul className="mb-4">
        {portfolio.map((stock, index) => (
          <li key={index} className="border p-2 rounded-md">{stock.symbol} | Buy: ₹{stock.buy_price} | Sell: ₹{stock.sell_price} | Qty: {stock.quantity}</li>
        ))}
      </ul>

      <button onClick={submitPortfolio} className="bg-green-500 text-white p-2 rounded-md mb-4">Calculate Tax</button>

      {taxResult && (
        <div className="mt-4 p-4 border rounded-md">
          <h3 className="font-bold">Tax Calculation:</h3>
          <p>Total Tax: ₹{taxResult.total_tax.toFixed(2)}</p>
          <h4 className="font-bold mt-2">Tax Breakdown:</h4>
          <ul>
            {taxResult.tax_details.map((detail, index) => (
              <li key={index}>{detail.symbol}: ₹{detail.tax_amount.toFixed(2)} ({detail.tax_category})</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PortfolioForm;