import os
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
from flask import Flask, request, jsonify
import yfinance as yf
import pandas as pd
from flask_cors import CORS
import holidays
import requests
from stock_prediction_models import LSTM_ALGO
from datetime import datetime
from bs4 import BeautifulSoup
from pymongo import MongoClient  
from datetime import datetime, timedelta
from transformers import pipeline
import traceback
import numpy as np

app = Flask(__name__)
CORS(app)  # Enable CORS

client = MongoClient('localhost',27017)

db=client.stocks

watchlist=db.watchlist

# stock indices homepage
indian_tickers = {
    "Nifty 50": "^NSEI",
    "Nifty Bank": "^NSEBANK",
    "Sensex": "^BSESN",
    "Nifty IT": "^CNXIT",
    "Nifty FMCG": "^CNXFMCG",
    "Nifty Auto": "^CNXAUTO",
    # "Nifty Energy": "^CNXENERGY",
    # "Nifty Services Sector": "^CNXSERVICE",
    # "Nifty Metal": "^CNXMETAL",
    # "Nifty Realty": "^CNXREALTY",
    # "Nifty Infra": "^CNXINFRA",
    # "Nifty Media": "^CNXMEDIA",
    
    
}


def fetch_prices(ticker_symbol):
    ticker = yf.Ticker(ticker_symbol)
    end_date = datetime.now()
    # Start 5 days back to ensure we cover weekends or holidays
    start_date = end_date - timedelta(days=5)
    data = ticker.history(start=start_date, end=end_date)
    
    # Drop any days where data is missing (e.g., weekends, holidays)
    data = data.dropna(subset=['Close'])
    
    if len(data) >= 2:
        # Ensure we have at least two data points
        latest_close = data['Close'].iloc[-1]
        previous_close = data['Close'].iloc[-2]
        return latest_close, previous_close
    else:
        return None, None

@app.route('/latest-prices', methods=['GET'])
def latest_prices():
    prices = {}
    for name, symbol in indian_tickers.items():
        latest_price, previous_price = fetch_prices(symbol)
        if latest_price is not None and previous_price is not None:
            change = latest_price - previous_price
            percent_change = (change / previous_price) * 100
            prices[name] = {
                'latest': round(latest_price, 2),
                'previous': round(previous_price, 2),
                'change': round(change, 2),
                'percent_change': round(percent_change, 2),
            }
        else:
            prices[name] = {
                'latest': 'Data not available',
                'previous': 'Data not available',
                'change': 'Data not available',
                'percent_change': 'Data not available',
            }
    return jsonify(prices)




# for Individual-stock/price and stock comparision
@app.route('/stock-data', methods=['GET'])
def stock_data():
    ticker = request.args.get('ticker')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    if not ticker or not start_date or not end_date:
        return jsonify({'error': 'Missing parameters'}), 400

    data = yf.download(ticker, start=start_date, end=end_date)
    print(data)
    
    if data.empty:
        return jsonify({'error': 'No data found for ticker'}), 404
    
    data = data.reset_index()
    return data.to_json(orient='records')

# individual-stock/Fundamentals
@app.route('/fundamental-data', methods=['GET'])
def get_fundamental_data():
    ticker = request.args.get('ticker')
    if not ticker:
        return jsonify({"error": "Ticker parameter is required"}), 400

    try:
        ticker_info = yf.Ticker(ticker)
        balance_sheet,income_statement,cash_flow=get_fundamentals(ticker_info)
        data = {
            "b":{"balance_sheet": balance_sheet},
            "i":{"income_statement": income_statement},
            "c":{"cash_flow": cash_flow}
        }
        return jsonify(data)
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500

def df_to_dict(df):
    """ Convert DataFrame to dictionary, with timestamps as strings. """
    if isinstance(df, pd.DataFrame):
        # Convert index and columns to string if they are timestamps
        df.index = df.index.astype(str)
        df.columns = df.columns.astype(str)
        # Convert DataFrame to dictionary
        return df.to_dict()
    return {}

def get_fundamentals(ticker):
    balance_sheet = df_to_dict(ticker.balance_sheet.fillna("null")) 
    income_statement = df_to_dict(ticker.financials.fillna("null")) 
    cash_flow = df_to_dict(ticker.cashflow.fillna("null"))  
    return balance_sheet, income_statement, cash_flow  


# individual-stock/stock-info
@app.route('/stock-info', methods=['GET'])
def get_stock_info():
    ticker_i = request.args.get('ticker')
    if not ticker_i:
        return jsonify({"error": "Ticker is required"}), 400
    
    try:
        ticker = yf.Ticker(ticker_i)
        info = ticker.info
        
        if not info:
            return jsonify({"error": "No info found for ticker"}), 404
        
        return jsonify(info)
    except Exception as e:
        print(f"Error: {e}")  # Log the error to console
        return jsonify({"error": str(e)}), 500
    


sentiment_pipeline = pipeline("text-classification", model="ProsusAI/finbert")
# NEWS
@app.route('/stock-news1', methods=['GET'])
def stock_news():
    ticker_symbol = request.args.get('ticker')
    if ticker_symbol:
        news_data = get_news(ticker_symbol)
        
        # Perform sentiment analysis on each news item
        for item in news_data:
            try:
                sentiment_result = sentiment_pipeline(item["news"])[0]  # Get first result
                item["sentiment"] = (sentiment_result["label"])
                print(f"News: {item['news']}")
                print(f"Sentiment Result: {sentiment_result}")
                print(f"Mapped Sentiment: {item['sentiment']}")
                print("-" * 50)
            except Exception as e:
                print(f"Error analyzing sentiment: {e}")
                item["sentiment"] = "Neutral"  # Default sentiment
        
        return jsonify(news_data)
    else:
        return jsonify({"error": "Ticker symbol is required"}),400

def get_news(ticker):
    if ticker.endswith('.NS'):
        ticker = ticker[:-3]
    url = f"https://www.google.com/finance/quote/{ticker}:NSE?hl=en"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    class1 = 'z4rs2b'

    # Find all news items with the specified class
    news_items = soup.findAll(class_=class1)
    
    news_data = []
    
    for item in news_items:
        link = item.find('a', href=True)
        source = item.find(class_="sfyJob")
        time = item.find(class_="Adak")
        new = item.find(class_="Yfwt5")
        
        if link and source and time and new:
            news_link = link['href']
            news_data.append({
                "source": source.text,
                "time": time.text,
                "news": new.text.strip(),
                "link": news_link
            })
    
    return news_data


# holidays
@app.route('/holidays', methods=['GET'])
def get_holidays():
    country = request.args.get('country', 'IN')  
    year = request.args.get('year')

    if not year:
        return jsonify({'error': 'Year parameter is required'}), 400

    try:
        year = int(year)
    except ValueError:
        return jsonify({'error': 'Invalid year format'}), 400

    try:
        # Fetch holidays for the specified country and year
        holiday_data = holidays.CountryHoliday(country, years=year)
        holidays_list = [{'date': date.strftime('%Y-%m-%d'), 'name': name} for date, name in holiday_data.items()]
        return jsonify(holidays_list)
    except KeyError:
        return jsonify({'error': 'Country not supported'}), 400


# Watchlist
@app.route('/get-watchlist', methods=['GET'])
def get_watchlist():
    user_id = request.args.get('userId')
    print(user_id)

    if not user_id:
        return jsonify({'error': 'User ID parameter is required'}), 400

    try:
        # Find all watchlists for the user
        watchlist_items = watchlist.find({"UserId": user_id})
        watchlist_data = list(watchlist_items)
        
        # Group watchlist items by their names
        grouped_watchlists = {}
        for item in watchlist_data:
            item['_id'] = str(item['_id'])  # Convert ObjectId to string
            list_name = item.get('Watchlist')
            if list_name not in grouped_watchlists:
                grouped_watchlists[list_name] = {'name': list_name, 'items': []}
            grouped_watchlists[list_name]['items'].append(item)
        
        # Convert grouped data to list
        response_data = list(grouped_watchlists.values())
        
        return jsonify(response_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/remove-watchlist', methods=['DELETE'])
def remove_watchlist():
    watchlist_name = request.args.get('watchlist_name')

    if not watchlist_name:
        return jsonify({'error': 'Watchlist name parameter is required'}), 400

    try:
        watchlist.delete_many({"Watchlist":watchlist_name})

        

        return jsonify({'message': 'Watchlist removed successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/remove-stock', methods=['DELETE'])
def remove_stock():
    watchlist_name = request.args.get('watchlist_name')
    stock_symbol = request.args.get('stock_symbol')
    user_id = request.args.get('user_id')  # This can be optional now

    # Validate input parameters
    if not watchlist_name or not stock_symbol:
        return jsonify({'error': 'Watchlist name and stock symbol are required'}), 400

    try:
        # Build the query to find the document. UserId is optional.
        query = {
            "Watchlist": watchlist_name,
            "Stock": stock_symbol
        }
        
        # If user_id is provided, include it in the query
        if user_id:
            query["UserId"] = user_id

        # Find the document matching the watchlist name and stock symbol
        watchlist_item = watchlist.find_one(query)

        # Debug: Print the fetched item to verify the correct one is found
        print("Fetched Watchlist Item:", watchlist_item)

        # If the item is not found, return an error
        if not watchlist_item:
            print(f"Stock symbol '{stock_symbol}' not found in the watchlist '{watchlist_name}'.")
            return jsonify({'error': 'Stock not found in the specified watchlist'}), 404

        # Remove the document from the collection
        result = watchlist.delete_one(query)

        # Check if the delete operation was successful
        if result.deleted_count == 0:
            return jsonify({'error': 'Failed to remove stock'}), 500

        print(f"Deleted count after removal: {result.deleted_count}")
        return jsonify({'message': 'Stock removed successfully'}), 200

    except Exception as e:
        print(f"Error removing stock: {e}")
        return jsonify({'error': str(e)}), 500


# Watchlist insert in database and current price scraping
@app.route('/current-price', methods=['GET'])
def current_price():
    ticker = request.args.get('ticker')
    watchlist_name = request.args.get('watchlist_name')
    userId = request.args.get('userId')
    stockName = request.args.get('stockName')

    # Validate ticker and userId
    if not ticker:
        return jsonify({'error': 'Ticker parameter is required'}), 400
    if not watchlist_name:
        return jsonify({'error': 'Watchlist name is required'}), 400
   

    try:
        # Fetch the current price using your scrap function
        price, percentage = scrap(ticker)



        # Log the information being queried for debugging
        print(f"Checking for stock in watchlist: {watchlist_name}, ticker: {ticker}, userId: {userId}")

        # Step 1: Check if the stock already exists in the user's watchlist
        existing_stock = watchlist.find_one({
            'UserId': userId,
            'Watchlist': watchlist_name,
            'Stock': ticker
        })

        if existing_stock:
            # Step 2: Update the stock's price if it already exists
            print(f"Stock found: {ticker}, updating price: {price}")
            watchlist.update_one(
                {'_id': existing_stock['_id']},
                {'$set': {'Price': price}}
            )
        else:
            # Step 3: Insert new stock if it doesn't exist
            print(f"Stock not found, inserting new stock: {ticker} in watchlist: {watchlist_name}")
            watchlist.insert_one({
                'Watchlist': watchlist_name,
                'stockName': stockName,
                'Stock': ticker,
                'Price': price,
                "UserId": userId
            })

        return jsonify({'ticker': ticker, 'current_price': price})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500




def scrap(ticker):
    url = f'https://www.google.com/finance/quote/{ticker}:NSE'
    response = requests.get(url)
    if response.status_code != 200:
        raise Exception('Failed to fetch data from Google Finance')
    
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Extract current price
    class1 = 'YMlKec fxKbKc'
    price_element = soup.find(class_=class1)
    if price_element:
        price = price_element.text.strip()[1:].replace(",", "")
        try:
            price = float(price)
        except ValueError:
            raise Exception('Failed to parse price')
    else:
        raise Exception('Price element not found')
    
    # Extract percentage change
    class2 = "JwB6zf"
    percentage_element = soup.find(class_=class2)
    if percentage_element:
        percentage = percentage_element.text
 # Remove the '%' sign
    else:
        raise Exception('Percentage element not found')
    
    return price, percentage



# Predictions
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        if 'stockData' not in data:
            return jsonify({"error": "Missing 'stockData' in request"}), 400

        # Validate data
        stock_data = pd.DataFrame(data['stockData'])
        if not all(col in stock_data.columns for col in ['Date', 'Close']):
            return jsonify({"error": "Required columns 'Date' and 'Close' are missing or misnamed"}), 400

        # Ensure Date is in datetime format
        stock_data['Date'] = pd.to_datetime(stock_data['Date'], errors='coerce')
        if stock_data['Date'].isnull().any():
            return jsonify({"error": "Invalid Date values in data"}), 400

        # Run LSTM Model
        try:
            lstm_prediction, lstm_error, df1, df2 = LSTM_ALGO(stock_data)
            lstm_prediction = float(lstm_prediction)
            lstm_error = str(lstm_error) if lstm_error else None
        except Exception as e:
            print("LSTM error:", traceback.format_exc())
            return jsonify({"error": str(e)}), 500

        # Convert data for JSON response
        actual_data = df1.get("Actual Data", []).tolist()
        predicted_data = df1.get("Predicted", []).tolist()
        
        # Handle df2 as a NumPy array
        if isinstance(df2, np.ndarray):
            volume_data = df2.flatten().tolist()  # Flatten the NumPy array and convert to list
        else:
            volume_data = df2.values.flatten().tolist()  # Fallback for Pandas DataFrame

        response = {
            "LSTM": {"prediction": lstm_prediction, "error": lstm_error},
            "original": {
                "dates": stock_data['Date'].dt.strftime('%Y-%m-%d').tolist(),
                "prices": stock_data['Close'].tolist()
            },
            "comparision": {
                "Actual": actual_data,
                "Predicted": predicted_data
            },
            "Volume": {
                "df2": volume_data
            }
        }

        return jsonify(response)

    except Exception as e:
        print("Error during prediction:", traceback.format_exc())
        return jsonify({"error": str(e)}), 500
        
# Prediction data
@app.route('/stock-data1', methods=['GET'])
def get_stock_data():
    ticker = request.args.get('ticker')
    if not ticker:
        return jsonify({"error": "Ticker is required"}), 400

    try:
        end = datetime.now()
        start = datetime(end.year - 2, end.month, end.day)
        data = yf.download(ticker, start=start, end=end)

        if data.empty:
            return jsonify({"error": "No data found for ticker"}), 404

        # Flatten multi-index columns (if any)
        if isinstance(data.columns, pd.MultiIndex):
            data.columns = ['_'.join([str(c) for c in col]) for col in data.columns]

        # Reset index to include 'Date' as a column
        data.reset_index(inplace=True)

        # Rename columns to remove the ticker suffix (e.g., "Close_ADANIENT.NS" -> "Close")
        data.columns = [col.replace(f"_{ticker}", "") for col in data.columns]

        # Format 'Date' column as strings
        data['Date'] = data['Date'].dt.strftime('%Y-%m-%d')

        # Convert to list of dictionaries
        data_dict = data.to_dict(orient='records')
        print("Processed data:", data_dict)  # Log the processed data

        return jsonify(data_dict)

    except Exception as e:
        print("Error:", e)
        return jsonify({"error": str(e)}), 500


# model locally (Download a GGUF model file from Hugging Face)
#llm = Llama(model_path="llama-2-7b.gguf")  # Adjust based on your model

# Sample Tax Rules (India-based)
# Tax rules
TAX_RULES = {
    "short_term": 0.20,  # 20% tax for short-term gains
    "long_term": 0.125,  # 12.5% tax for long-term gains
}

# Function to categorize gains as short-term or long-term
def categorize_tax(transaction):
    """
    Categorize a transaction as short-term or long-term based on the holding period.
    """
    buy_date = pd.to_datetime(transaction["buy_date"])
    sell_date = pd.to_datetime(transaction["sell_date"])
    holding_period = (sell_date - buy_date).days
    return "short_term" if holding_period <= 365 else "long_term"

# Function to calculate tax liability
def calculate_tax(portfolio):
    """
    Calculate the total tax liability and a breakdown of taxes for each transaction.
    """
    total_tax = 0
    tax_breakdown = []
    
    for transaction in portfolio:
        try:
            # Validate transaction data
            if not all(key in transaction for key in ["symbol", "buy_price", "sell_price", "quantity", "buy_date", "sell_date"]):
                raise ValueError("Invalid transaction data")
            
            # Categorize the transaction
            category = categorize_tax(transaction)
            
            # Calculate gain
            gain = (transaction["sell_price"] - transaction["buy_price"]) * transaction["quantity"]
            
            # Calculate tax amount
            if category == "short_term" and gain <= 125000:
                tax_amount = 0  # Exempt short-term gains below ₹125,000
            else:
                tax_amount = gain * TAX_RULES[category] if gain > 0 else 0
            
            # Update total tax and tax breakdown
            total_tax += tax_amount
            tax_breakdown.append({
                "symbol": transaction["symbol"], 
                "gain": gain, 
                "tax_category": category, 
                "tax_amount": tax_amount
            })
        except Exception as e:
            logging.error(f"Error processing transaction: {transaction}. Error: {e}")
            continue
    
    return total_tax, tax_breakdown

@app.route("/calculate-tax", methods=["POST"])
def tax_calculation():
    """
    API endpoint to calculate tax liability for a portfolio of transactions.
    """
    data = request.get_json()
    portfolio = data.get("portfolio", [])
    
    if not portfolio:
        return jsonify({"error": "No portfolio data provided"}), 400

    try:
        total_tax, tax_details = calculate_tax(portfolio)
        return jsonify({
            "total_tax": total_tax, 
            "tax_details": tax_details
        })
    except Exception as e:
        
        return jsonify({"error": "An error occurred while calculating tax"}), 500
    

if __name__ == '__main__':
    app.run(debug=True)
