import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from keras.models import Sequential
from keras.layers import LSTM, Dropout, Dense
import math
from sklearn.metrics import mean_squared_error

def LSTM_ALGO(df):
    # Split data into training set and test set
    train_data = df.iloc[0:int(0.8 * len(df)), :]
    test_data = df.iloc[int(0.8 * len(df)):, :]
    
    # TO PREDICT STOCK PRICES OF NEXT N DAYS, STORE PREVIOUS N DAYS IN MEMORY WHILE TRAINING
    # HERE N=7
    training_set = df.iloc[:, 4:5].values  # Selecting 'Close' column as numpy array
    
    # Volume data
    df2 = df['Volume']
    print(df2)
    
    # Feature Scaling
    sc = MinMaxScaler(feature_range=(0, 1))
    training_set_scaled = sc.fit_transform(training_set)
    
    # Creating data structure with 7 timesteps and 1 output
    X_train = []  # memory with 7 days from day i
    y_train = []  # day i
    for i in range(7, len(training_set_scaled)):
        X_train.append(training_set_scaled[i-7:i, 0])
        y_train.append(training_set_scaled[i, 0])
        
    # Convert list to numpy arrays
    X_train = np.array(X_train)
    y_train = np.array(y_train)
    
    X_forecast = np.array(X_train[-1, 1:])
    X_forecast = np.append(X_forecast, y_train[-1])
    
    # Reshaping: Adding 3rd dimension
    X_train = np.reshape(X_train, (X_train.shape[0], X_train.shape[1], 1))
    X_forecast = np.reshape(X_forecast, (1, X_forecast.shape[0], 1))
    
    # Building the LSTM model
    model = Sequential()
    model.add(LSTM(units=50, return_sequences=True, input_shape=(X_train.shape[1], 1)))
    model.add(Dropout(0.1))
    model.add(LSTM(units=50, return_sequences=True))
    model.add(Dropout(0.1))
    model.add(LSTM(units=50, return_sequences=True))
    model.add(Dropout(0.1))
    model.add(LSTM(units=50))
    model.add(Dropout(0.1))
    model.add(Dense(units=1))
    
    # Compile the model
    model.compile(optimizer='adam', loss='mean_squared_error')
    
    # Train the model
    model.fit(X_train, y_train, epochs=25, batch_size=32)
    
    # Testing
    real_stock_price = test_data.iloc[:, 4:5].values
    
    # To predict, we need stock prices of 7 days before the test set
    dataset_total = pd.concat((train_data['Close'], test_data['Close']), axis=0)
    testing_set = dataset_total[len(dataset_total) - len(test_data) - 7:].values
    testing_set = testing_set.reshape(-1, 1)
    
    # Feature scaling
    testing_set = sc.transform(testing_set)
    
    # Create data structure for testing
    X_test = []
    for i in range(7, len(testing_set)):
        X_test.append(testing_set[i-7:i, 0])
    
    # Convert list to numpy arrays
    X_test = np.array(X_test)
    
    # Reshaping: Adding 3rd dimension
    X_test = np.reshape(X_test, (X_test.shape[0], X_test.shape[1], 1))
    
    # Testing Prediction
    predicted_stock_price = model.predict(X_test)
    
    # Getting original prices back from scaled values
    predicted_stock_price = sc.inverse_transform(predicted_stock_price)
    
    # Calculating the error
    error_lstm = math.sqrt(mean_squared_error(real_stock_price, predicted_stock_price))
    
    # Forecasting Prediction
    forecasted_stock_price = model.predict(X_forecast)
    forecasted_stock_price = sc.inverse_transform(forecasted_stock_price)
    
    lstm_pred = forecasted_stock_price[0, 0]
    
    # Creating DataFrame with Actual vs. Predicted values
    df2_test = df2[len(df2) - len(test_data):].values  # Adjust 'Volume' column for test data
    
    # Creating DataFrame with Actual vs. Predicted values
    df1 = pd.DataFrame({
        "Actual Data": np.array(real_stock_price).flatten(),
        "Predicted": np.array(predicted_stock_price).flatten(),
        
    })
    
    print("Training set shape:", X_train.shape)
    print("Test set shape:", X_test.shape)
    print("Actual stock price shape:", real_stock_price.shape)
    print("Predicted stock price shape:", predicted_stock_price.shape)
    print("Forecasted stock price:", lstm_pred)
    print("Error (RMSE):", error_lstm)
    
    # Calculate MAPE and Model Accuracy
    mape = np.mean(np.abs((real_stock_price - predicted_stock_price) / real_stock_price)) * 100
    accuracy = 100 - mape
    print(f"MAPE: {mape:.2f}%")
    print(f"Model Accuracy: {accuracy:.2f}%")
    
    # Returning values
    return lstm_pred, error_lstm, df1, df2_test
