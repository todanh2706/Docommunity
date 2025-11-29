import requests
import json
import random

# Configuration
BASE_URL = 'http://localhost:8080/api' 

# Test Data
user_data = {
    "username": "khoa090505",
    "email": "nbdk090505@gmail.com",
    "password": "123khoa123",
    "fullname": "Nguyen Ba Dang Khoa",
    "phone": "0912415535"
}

def print_response(response, title):
    print(f"\n--- {title} ---")
    print(f"Status Code: {response.status_code}")
    try:
        print("Response:", json.dumps(response.json(), indent=4))
    except:
        print("Response:", response.text)

def main():
    # 1. REGISTER
    print(f"Registering user: {user_data['username']}...")
    register_url = f'{BASE_URL}/auth/register'
    resp = requests.post(register_url, json=user_data)
    print_response(resp, "REGISTER")

    # Stop if registration failed (and not because user already exists)
    if resp.status_code != 201 and "already taken" not in resp.text:
        print("Stopping due to registration error.")
        # return # Uncomment to stop, but sometimes we want to try login anyway if user exists

    # 2. LOGIN
    print(f"Logging in...")
    login_url = f'{BASE_URL}/auth/login'
    login_data = {
        "username": user_data['username'],
        "password": user_data['password']
    }
    
    resp = requests.post(login_url, json=login_data)
    print_response(resp, "LOGIN")

    if resp.status_code == 200:
        # Capture the tokens
        data = resp.json()
        access_token = data.get('accessToken')
        refresh_token = data.get('refreshToken')
        
        headers = {
            'Authorization': f'Bearer {access_token}'
        }

        # 3. GET CURRENT PROFILE (Protected Route)
        print("Fetching current profile...")
        profile_url = f'{BASE_URL}/users/me'
        resp = requests.get(profile_url, headers=headers)
        print_response(resp, "GET PROFILE")

        # 4. UPDATE PROFILE (Protected Route)
        print("Updating profile (changing phone)...")
        update_url = f'{BASE_URL}/users/me'
        update_data = {
            "phone": f'0912{random.randint(100000, 999999)}',
            "bio": "Updated via API test"
        }
        resp = requests.put(update_url, json=update_data, headers=headers)
        print_response(resp, "UPDATE PROFILE")

        # 4.2. GET CURRENT PROFILE (Protected Route)
        print("Fetching current profile...")
        profile_url = f'{BASE_URL}/users/me'
        resp = requests.get(profile_url, headers=headers)
        print_response(resp, "GET PROFILE AGAIN")

        # 5. REFRESH TOKEN
        print("Refreshing token...")
        refresh_url = f'{BASE_URL}/auth/refresh'
        refresh_req_data = {
            "refreshToken": refresh_token
        }
        resp = requests.post(refresh_url, json=refresh_req_data)
        print_response(resp, "REFRESH TOKEN")

        # 6. CREATE DOCUMENT
        print("Creating document...")
        create_doc_url = f'{BASE_URL}/documents/'
        doc_data = {
            "title": "My First Document",
            "content": "This is the content of my first document.",
            "tags": ["test"],
            "isPublic": True
        }
        resp = requests.post(create_doc_url, json=doc_data, headers=headers)
        print_response(resp, "CREATE DOCUMENT")

    else:
        print("Login failed, skipping protected route tests.")

if __name__ == "__main__":
    main()