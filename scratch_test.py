import requests

response = requests.get("http://localhost:8081/api/qr/resolve/demo123")
print(response.status_code)
print(response.text)
