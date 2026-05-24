import requests
import os

BASE_URL = os.environ.get("BACKEND_URL", "http://localhost:4000")

def updateTransactions(user, unified):
    try:
        url = f"{BASE_URL}/addTransactions" if unified else f"{BASE_URL}/getTransactions"
        res = None
        if (unified):
            res = requests.post(url, json={"userId": user}).json()
        else:
            res = requests.get(url + "?userId=" + user).json()
        if 'data' not in res:
            print(res['message'])
        return res['data']
    except requests.RequestException as e:
        print(f"Request error for user {user}: {e}")
    except Exception as e:
        print(f"Unexpected error for user {user}: {e}")