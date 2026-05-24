
from stages.updateAccount import updateAccount
from stages.updateTransactions import updateTransactions
from stages.prepData import prepData
from stages.STLReport import STL_report
from stages.ARIMAReport import ARIMA_report
from stages.LSTMReport import LSTM_report
from stages.idleCapital import idle_capital_report
from stages.forecastDrivers import forecast_drivers_report
from stages.smartprint import smartprint
import pandas as pd
import sys
import os

#need to handle the logic of excel uploads
def analysisPipeline(user, unified):
    print("user: ", user)
    print("unified: ", unified)
    if unified: updateAccount(user)
    transactions = updateTransactions(user, unified)
    if transactions == []:
        print("0 trasnactions. Failed to create reports")
        return
    transactions = smartprint(transactions, user)
    results, startDate, endDate = prepData(transactions, user)
    if results == False:
        return
    _, stl_seasonal, _ = STL_report(results, startDate, endDate, user)
    arima_results = ARIMA_report(results, endDate, user)
    dateRage = pd.date_range(start=startDate, end=endDate, freq='D')
    lstmInput = {'volatility': results['VOLATILITY'], 'created_at': dateRage}
    lstmdf = pd.DataFrame(lstmInput)
    LSTM_report(lstmdf, user)

    # Intelligence Layer: idle capital decomposition
    min_cash_floor = float(os.environ.get("MIN_CASH_FLOOR", 0))
    payable_cycle_days = int(os.environ.get("PAYABLE_CYCLE_DAYS", 30))
    idle_capital_report(
        arima_results=arima_results,
        stl_seasonal_results=stl_seasonal,
        historical_results=results,
        min_cash_floor=min_cash_floor,
        payable_cycle_days=payable_cycle_days,
        endDate=endDate,
        user=user,
    )

    # Intelligence Layer: forecast explainability
    forecast_drivers_report(
        arima_results=arima_results,
        historical_results=results,
        endDate=endDate,
        user=user,
    )

analysisPipeline(sys.argv[1], sys.argv[2] == "UNF")

