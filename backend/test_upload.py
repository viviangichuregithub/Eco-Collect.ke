import requests
from pathlib import Path

# Change these values as needed
API_URL = "http://127.0.0.1:5000/uploads/"
FILE_PATH = Path("uploads/89c0a74a-bc29-48e0-aa77-177722dd78b9.jpeg")
USER_ID = 1
USER_NAME = "Vivian"
WEIGHT = 2.5
CENTRE_ID = 1

if not FILE_PATH.exists():
    raise FileNotFoundError(f"File not found: {FILE_PATH}")

files = {"file": (FILE_PATH.name, open(FILE_PATH, "rb"), "image/jpeg")}
data = {
    "user_id": str(USER_ID),
    "user_name": USER_NAME,
    "weight": str(WEIGHT),
    "centre_id": str(CENTRE_ID)
}

try:
    response = requests.post(API_URL, files=files, data=data)
    print("Status code:", response.status_code)
    try:
        print("Response JSON:", response.json())
    except:
        print("Response text:", response.text)
except Exception as e:
    print("Request failed:", e)
finally:
    files["file"][1].close()
