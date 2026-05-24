import requests
import os

BASE_URL = os.environ.get("BACKEND_URL", "http://localhost:4000")

def createReport(userId, modelType, startDate, endDate, data):
    try:
        url = f"{BASE_URL}/createReport"
        report = requests.post(url, json={
            "userId": userId, 
            'model_type': modelType,
            "startDate": startDate,
            "endDate": endDate,
            "data": data,
        })

        if report.status_code != 200:
            print(report.text)
            raise Exception(f'failed to create {modelType} report')
    except requests.RequestException as e:
        print(f"Request error for user {userId}: {e}")
    except Exception as e:
        print(f"Unexpected error for user {userId}: {e}")