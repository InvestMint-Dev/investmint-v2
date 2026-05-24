from .createReport import createReport
import pandas as pd


def idle_capital_report(arima_results, stl_seasonal_results, historical_results,
                        min_cash_floor, payable_cycle_days, endDate, user):
    """
    Separates the forecasted balance into four components:
        - deployable_capital   : balance available for investment today
        - operational_float    : minimum cash floor the business must hold
        - committed_payables   : buffer for outstanding payables due within payable_cycle_days
        - seasonal_reserve     : largest seasonal cash drain expected in the next 30 days

    Output schema (all length-1 arrays so values fit the Report data model):
        {
            "deployable_capital":   [value],
            "operational_float":    [value],
            "committed_payables":   [value],
            "seasonal_reserve":     [value],
            "available_horizon":    [days],   # days until forecast drops below floor
            "confidence_lower":     [value],  # provided by caller if available
            "confidence_upper":     [value],
        }
    Stored as model_type IDLE_CAPITAL.
    """
    try:
        # --- Current balance: last observed value from VOLATILITY TOTAL series ---
        balance_series = historical_results.get("TOTAL", [])
        current_balance = balance_series[-1] if balance_series else 0.0

        # --- Operational float (minimum cash floor) ---
        operational_float = float(min_cash_floor) if min_cash_floor else 0.0

        # --- Committed payables buffer ---
        # Average daily outflow from ACCOUNTS_PAYABLE over the last 90 days,
        # scaled by the payable cycle length.
        payables_history = historical_results.get("ACCOUNTS_PAYABLE", [])
        lookback = min(90, len(payables_history))
        if lookback > 0:
            avg_daily_payables = abs(sum(payables_history[-lookback:]) / lookback)
        else:
            avg_daily_payables = 0.0
        committed_payables = avg_daily_payables * float(payable_cycle_days)

        # --- Seasonal reserve ---
        # Largest seasonal cash drain expected in the next 30 days (from STL seasonal).
        seasonal_series = stl_seasonal_results.get("TOTAL", [])
        if seasonal_series:
            next_30_seasonal = seasonal_series[:30]
            seasonal_reserve = max(0.0, -min(next_30_seasonal))
        else:
            seasonal_reserve = 0.0

        # --- Deployable capital ---
        deployable = max(
            0.0,
            current_balance - operational_float - committed_payables - seasonal_reserve
        )

        # --- Available horizon ---
        # Find the first forecast day where the cumulative balance falls
        # below operational_float + committed_payables.
        floor = operational_float + committed_payables
        daily_flows = arima_results.get("TOTAL", [])
        running_balance = current_balance
        available_horizon = len(daily_flows)  # optimistic default: full forecast window
        for i, flow in enumerate(daily_flows):
            running_balance += flow
            if running_balance < floor:
                available_horizon = i
                break

        data = {
            "deployable_capital":  [round(deployable, 2)],
            "operational_float":   [round(operational_float, 2)],
            "committed_payables":  [round(committed_payables, 2)],
            "seasonal_reserve":    [round(seasonal_reserve, 2)],
            "available_horizon":   [available_horizon],
        }

        start_date = pd.to_datetime(endDate) + pd.Timedelta(days=1)
        start_date = start_date.strftime('%Y-%m-%d')
        end_date = pd.to_datetime(endDate) + pd.Timedelta(days=365)
        end_date = end_date.strftime('%Y-%m-%d')

        createReport(user, 'IDLE_CAPITAL', start_date, end_date, data)
    except Exception as e:
        print(f"Unexpected error in idle_capital_report for user {user}: {e}")
