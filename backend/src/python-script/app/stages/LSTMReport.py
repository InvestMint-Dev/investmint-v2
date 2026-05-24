from .createReport import createReport
import numpy as np
import pandas as pd
from datetime import timedelta
from sklearn.preprocessing import MinMaxScaler
from keras.models import Sequential
from keras.layers import LSTM, Dense

def LSTM_report(results_volatility, user):
    
    def split_sequence(sequence, n_steps):
        x, y = [], []
        for i in range(len(sequence) - n_steps):
            seq_x = sequence[i:i + n_steps]  
            seq_y = sequence[i + n_steps][0]
            x.append(seq_x)
            y.append(seq_y)
        
        return np.array(x), np.array(y)
    
    def make_predictions(model, last_window, days=365):
        future_predictions = []
        input_sequence = last_window.copy()[0]

        for _ in range(days):
            prediction = model.predict(np.array([input_sequence]), verbose=0)[0][0]
            future_predictions.append(prediction)

            last_input = scaler_date.inverse_transform(np.array([input_sequence[-1][1:]]))[0]

            day, year = round(last_input[3]), round(last_input[-1])
            date = pd.to_datetime(f"{int(year)}-{int(day)}", format="%Y-%j")
            next_date = date + pd.Timedelta(days=1)
            nextDay, nextMonth, nextYear, nextQuarter, nextWeek = next_date.dayofyear, next_date.month, next_date.year, next_date.quarter, next_date.dayofweek
            
            df = {'week': [nextWeek], 'month': [nextMonth], 'quarter': [nextQuarter], 'day': [nextDay], 'year': [nextYear]}
            df = pd.DataFrame(df)
            newDates = scaler_date.transform(df[['week', 'month', 'quarter', 'day', 'year']])[0]

            new_input = np.array([prediction, newDates[0], newDates[1], newDates[2], newDates[3], newDates[-1]])
            input_sequence = np.vstack((input_sequence[1:], new_input))

        return np.array([future_predictions])
   
    try:
        
        WINDOW_LENGTH = 30
        FEATURE_NUM = 6

        df = results_volatility.set_index('created_at')

        df['week'] = df.index.dayofweek
        df['month'] = df.index.month
        df['quarter'] = df.index.quarter
        df['day'] = df.index.dayofyear
        df['year'] = df.index.year

        #Scale volatility and date features
        scaler_volatility = MinMaxScaler(feature_range=(0, 1))
        df["volatility"] = scaler_volatility.fit_transform(df["volatility"].values.reshape(-1, 1))
        scaler_date = MinMaxScaler(feature_range=(0, 1))
        df[['week', 'month', 'quarter', 'day', 'year']] = scaler_date.fit_transform(df[['week', 'month', 'quarter', 'day', 'year']])

        #Array of volatility and date features
        data = df[['volatility', 'week', 'month', 'quarter', 'day', 'year']].values  # (N, 5)

        x, y = split_sequence(data, WINDOW_LENGTH) # reshape into (666, 60, 5)

        # Split data
        train_size = int(0.8 * len(data)) # 80% for training
        X_train, X_validation = x[:train_size], x[train_size:]
        Y_train, Y_validation = y[:train_size], y[train_size:]

        # create model
        model = Sequential([
            LSTM(64, return_sequences=True, input_shape=(WINDOW_LENGTH, FEATURE_NUM)),
            LSTM(64, return_sequences=False),
            Dense(32, activation="relu"),
            Dense(1)
        ])

        model.compile(optimizer='adam', loss='mean_squared_error')

        # Train the model
        history = model.fit(X_train, Y_train, epochs=400, batch_size=16, validation_data=(X_validation, Y_validation))
        predictions = make_predictions(model, np.array([X_validation[-1]]))[0].reshape(-1, 1)
        report = scaler_volatility.inverse_transform(predictions).flatten()

        start_date = df.index.max() + timedelta(days=1)
        start_date = start_date.strftime('%Y-%m-%d')
        end_date = df.index.max() + timedelta(days=365)
        end_date = end_date.strftime('%Y-%m-%d')

        createReport(user, "LSTM", start_date, end_date, {"TOTAL":report.tolist()})
    except Exception as e:
        print(f"Unexpected error for user {user}: {e}")