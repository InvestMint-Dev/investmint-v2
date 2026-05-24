from .createReport import createReport
import statsmodels.api as sm
import numpy as np
import pandas as pd
import itertools
from datetime import timedelta
from sklearn.metrics import mean_squared_error

def ARIMA_report(results, endDate, user):

    def objective_function(args, data):
        evaluated = []
        results = []

        train_size = int(len(args) * 0.8)
        test_size = len(data[train_size:])

        for params in args:
            try:
                model = sm.tsa.arima.ARIMA(data[: train_size], order=params)
                fitted_model = model.fit()
                predictions = fitted_model.forecast(steps=test_size)
                mse = mean_squared_error(data[train_size:], predictions)
                evaluated.append(params)
                results.append(mse)
            except Exception as e:
                print(f"Unexpected error for user {user}: {e}")

        min_loss = min(results)
        parameters = evaluated[results.index(min_loss)]

        model = sm.tsa.arima.ARIMA(data, order=parameters)
        fitted_model = model.fit()
        forecast_result = fitted_model.get_forecast(steps=365)
        predictions = forecast_result.predicted_mean.tolist()
        conf_int = forecast_result.conf_int(alpha=0.05)
        lower = conf_int.iloc[:, 0].tolist()
        upper = conf_int.iloc[:, 1].tolist()

        return predictions, lower, upper

    try:
        input = list(itertools.product(range(1, 10), range(0, 2), range(1, 10)))
        results_arima = {}
        results_arima_lower = {}
        results_arima_upper = {}

        for type in results:
            if type == "TOTAL": continue
            point, lower, upper = objective_function(input, np.array(results[type]))
            key = "TOTAL" if type == "VOLATILITY" else type
            results_arima[key] = point
            results_arima_lower[key] = lower
            results_arima_upper[key] = upper

        start_date = pd.to_datetime(endDate) + timedelta(days=1)
        start_date = start_date.strftime('%Y-%m-%d')
        end_date = pd.to_datetime(endDate) + timedelta(days=365)
        end_date = end_date.strftime('%Y-%m-%d')

        createReport(user, 'ARIMA', start_date, end_date, results_arima)
        createReport(user, 'ARIMA_LOWER', start_date, end_date, results_arima_lower)
        createReport(user, 'ARIMA_UPPER', start_date, end_date, results_arima_upper)
        return results_arima
    except Exception as e:
        print(f"Unexpected error for user {user}: {e}")
        return {}