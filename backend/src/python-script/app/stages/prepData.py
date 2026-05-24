import pandas as pd
from .createReport import createReport


#Transactions[] => {category: data[]} 
#category is the account type the transaction belongs to (e.g. CREDIT_CARD, FIXED_ASSET, etc.)
#data is the change in the respective category (in CAD) from startDate to endDate
def prepData(transactions, user):

    #Given start and end date, calculate the balance and volatility for each day
    def volatility(data, start_date, end_date):
        #Group transactions by date and sum the total amount for each day
        data = data.groupby('created_at', as_index=False).sum()

        #Create date range from start to end date
        date_range = pd.date_range(start=start_date, end=end_date, freq='D')
        date_df = pd.DataFrame(date_range, columns=['created_at'])
        date_df = date_df['created_at'].dt.strftime('%Y-%m-%d')

        #Merge with date range to get all dates, fill NaN with 0 and calculate volatility
        data = pd.merge(date_df, data, on='created_at', how='left')
        data['total_amount'] = data['total_amount'].fillna(0)
        data['volatility'] = data['total_amount'] * -1 #originally it's + for debit and - for credit

        return data[['volatility']]
    
    #Calculate balance for each day
    def balance(data, start_date, end_date):
        res = volatility(data, start_date, end_date)
        res['balance'] = res['volatility'].cumsum()
        return res[['balance']]
    
    try:
        #Convert transactions to dataframe and update date format unto YYYY-MM-DD, and sort values by created_at
        df_transactions = pd.DataFrame(transactions)
        df_transactions['created_at'] = pd.to_datetime(df_transactions['created_at'])
        df_transactions['created_at'] = df_transactions['created_at'].dt.strftime('%Y-%m-%d')
        df_transactions = df_transactions.sort_values(by='created_at')

        #Get start and end date of entire transaction history
        startDate, endDate = df_transactions['created_at'].min(), df_transactions['created_at'].max()

        trans_by_category = {
            "VOLATILITY": df_transactions.to_dict(orient='list'),
            "ACCOUNTS_PAYABLE": [],
            "ACCOUNTS_RECEIVABLE": [],
            "BANK": [],
            "CREDIT_CARD": [],
            "FIXED_ASSET": [],
            "LIABILITY": [],
            "EQUITY": [],
            "EXPENSE": [],
            "REVENUE": [],
            "OTHER": [],
        }
        
        results = {}

        # Add transactions to their respective category
        for i in range(0, len(df_transactions)):
            catogories = df_transactions.loc[i, 'category']
            date = df_transactions.loc[i, 'created_at']
            for cat in catogories:
                cat['created_at'] = date
                trans_by_category[cat['account_type']].append(cat)

        # Calculate volatility for each category
        for key, value in trans_by_category.items():
            if len(value) == 0:
                continue
            res = volatility(pd.DataFrame(value), startDate, endDate)
            results[key] = res.to_dict(orient='list')['volatility'] # extract the array of values  
            
        results["TOTAL"] = balance(df_transactions, startDate, endDate).to_dict(orient='list')['balance'] # extract the array of values

        

        createReport(user, "VOLATILITY", startDate, endDate, results)

        return results, startDate, endDate
    
    except Exception as e:
        #If there is an error, return False for all results so parent function can handle it
        print(f"Unexpected error for user {user}: {e}")
        return False, False, False, False 