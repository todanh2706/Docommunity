import requests

url = 'http://localhost:8080'
# # Register
username = "khoa090505"
email = "nbdk090505@gmail.com"
password = "123khoa123"
fullname = "Nguyeenx Bas Dang khoa"
phone = "0912415535"

resp = requests.post(f'{url}/api/auth/register', json={"username": username, "email": email, "password": password, "fullName": "Khoa"})
print(resp.text)

# Login
resp = requests.post(f'{url}/api/auth/login', json={"username": username, "password": password})
print(resp.text)

# # Refresh
# resp = requests.post(f'{url}/api/auth/refresh', json={"email": "kkk@gmail.com", "password": "kkkdfdfdf"})

# print(resp.text)