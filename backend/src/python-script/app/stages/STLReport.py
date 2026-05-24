from statsmodels.tsa.seasonal import STL
from .createReport import createReport

def STL_report(results, startDate, endDate, user):

    try:
        result_trend = {}
        result_seasonal = {}
        result_residual = {}

        for type in results:
            stl = STL(results[type], period=7, seasonal=11) 
            result = stl.fit()
            result_trend[type] = result.trend.tolist()
            result_seasonal[type] = result.seasonal.tolist()
            result_residual[type] = result.resid.tolist()
            
        createReport( user, 'STL_TREND', startDate, endDate, result_trend )
        createReport( user, 'STL_SEASONAL', startDate, endDate, result_seasonal )
        createReport( user, 'STL_RESID', startDate, endDate, result_residual )
        return result_trend, result_seasonal, result_residual
    except Exception as e:
        print(f"Unexpected error for user {user}: {e}")
        return {}, {}, {}