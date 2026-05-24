from .createReport import createReport
from datetime import timedelta
import pandas as pd


def forecast_drivers_report(arima_results, historical_results, endDate, user):
    """
    Identifies the top account-type drivers of forecast change.

    For each account type, computes the ratio of the forecasted 30-day average
    to the historical 30-day average. Values are stored as signed percentage
    changes so the frontend can render: "ACCOUNTS_PAYABLE is forecasted to
    change by -18% over the next 30 days."

    Output schema: { account_type: [pct_change] }  (length-1 array per type)
    Stored as model_type FORECAST_DRIVERS.
    """
    try:
        drivers = {}

        for account_type, forecast_values in arima_results.items():
            historical_values = historical_results.get(account_type, [])
            if not historical_values or not forecast_values:
                continue

            hist_30 = historical_values[-30:] if len(historical_values) >= 30 else historical_values
            hist_avg = sum(hist_30) / len(hist_30) if hist_30 else 0

            fore_30 = forecast_values[:30]
            fore_avg = sum(fore_30) / len(fore_30) if fore_30 else 0

            if hist_avg == 0:
                pct_change = fore_avg  # treat as raw delta when no historical baseline
            else:
                pct_change = (fore_avg - hist_avg) / abs(hist_avg) * 100

            drivers[account_type] = [round(pct_change, 4)]

        start_date = pd.to_datetime(endDate) + pd.Timedelta(days=1)
        start_date = start_date.strftime('%Y-%m-%d')
        end_date = pd.to_datetime(endDate) + pd.Timedelta(days=30)
        end_date = end_date.strftime('%Y-%m-%d')

        createReport(user, 'FORECAST_DRIVERS', start_date, end_date, drivers)
    except Exception as e:
        print(f"Unexpected error in forecast_drivers_report for user {user}: {e}")
