import requests
import json
import random
import time

# Configuration
BASE_URL = 'http://localhost:8080/api'

# Test Data
username = f"user_{random.randint(1000, 9999)}" # Random user each run to avoid conflicts
user_data = {
    "username": username,
    "email": f"{username}@gmail.com",
    "password": "password123",
    "fullname": "Test User",
    "phone": "0912345678"
}

def print_response(response, title):
    print(f"\n--- {title} ---")
    print(f"URL: {response.url}")
    print(f"Status: {response.status_code}")
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

    if resp.status_code != 201:
        print("Registration failed. Attempting login anyway...")

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
        # Capture tokens
        data = resp.json()
        access_token = data.get('accessToken')
        refresh_token = data.get('refreshToken')

        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }

        # --- USER ROUTES ---

        # 3. GET CURRENT PROFILE
        profile_url = f'{BASE_URL}/users/me'
        resp = requests.get(profile_url, headers=headers)
        print_response(resp, "GET PROFILE")

        my_id = resp.json().get('id') if resp.status_code == 200 else None

        # 4. UPDATE PROFILE
        update_url = f'{BASE_URL}/users/me'
        update_data = {
            "bio": "I love coding with Spring Boot!",
            "phone": "0999888777"
        }
        resp = requests.put(update_url, json=update_data, headers=headers)
        print_response(resp, "UPDATE PROFILE")

        # --- DOCUMENT ROUTES ---

        # 5. CREATE DOCUMENT
        print("Creating document...")
        create_doc_url = f'{BASE_URL}/documents' # Note: No trailing slash usually
        doc_data = {
            "title": "My Project Plan",
            "content": "This project needs a backend using Java. It also needs a frontend.",
            "tags": ["java", "planning"],
            "isPublic": True
        }
        resp = requests.post(create_doc_url, json=doc_data, headers=headers)
        print_response(resp, "CREATE DOCUMENT")

        doc_id = None
        if resp.status_code == 200:
            doc_id = resp.json().get('id')

        # 6. LIST DOCUMENTS
        list_doc_url = f'{BASE_URL}/documents'
        resp = requests.get(list_doc_url, headers=headers)
        print_response(resp, "LIST MY DOCUMENTS")

        # 7. GET SPECIFIC DOCUMENT
        if doc_id:
            get_doc_url = f'{BASE_URL}/documents/{doc_id}'
            resp = requests.get(get_doc_url, headers=headers)
            print_response(resp, f"GET DOCUMENT {doc_id}")

        # 8. UPDATE DOCUMENT
        if doc_id:
            update_doc_url = f'{BASE_URL}/documents/{doc_id}'
            update_doc_data = {
                "title": "Updated Project Plan (v2)",
                "isPublic": False # Making it private
            }
            resp = requests.put(update_doc_url, json=update_doc_data, headers=headers)
            print_response(resp, "UPDATE DOCUMENT")

        # --- AI ROUTES ---

        # 9. AI CHAT
        print("Testing AI Chat...")
        chat_url = f'{BASE_URL}/ai/chat'
        chat_data = {
            "message": "What is the capital of France?",
            "documentId": doc_id # Optional context
        }
        resp = requests.post(chat_url, json=chat_data, headers=headers)
        print_response(resp, "AI CHAT")

        # 10. AI TAGS
        print("Testing AI Tags...")
        tags_url = f'{BASE_URL}/ai/tags'
        tags_data = {
            "content": "Spring Boot is a Java framework for building web applications. It uses Dependency Injection."
        }
        resp = requests.post(tags_url, json=tags_data, headers=headers)
        print_response(resp, "AI SUGGEST TAGS")

        # 11. AI GENERATE
        print("Testing AI Generate...")
        gen_url = f'{BASE_URL}/ai/generate'
        gen_data = {
            "type": "email",
            "prompt": "Write a short welcome email to a new user named John."
        }
        resp = requests.post(gen_url, json=gen_data, headers=headers)
        print_response(resp, "AI GENERATE")

        # 12. AI REFINE DOCUMENT
        if doc_id:
            print("Testing Document Refine...")
            refine_url = f'{BASE_URL}/documents/{doc_id}/refine'
            refine_data = {
                "action": "improve",
                # "content": "Optional override text"
            }
            resp = requests.post(refine_url, json=refine_data, headers=headers)
            print_response(resp, "AI REFINE DOCUMENT")

        # --- CLEANUP ---

        # 13. DELETE DOCUMENT
        if doc_id:
            print(f"Deleting document {doc_id}...")
            del_url = f'{BASE_URL}/documents/{doc_id}'
            resp = requests.delete(del_url, headers=headers)
            print_response(resp, "DELETE DOCUMENT")

            # Verify deletion
            resp = requests.get(del_url, headers=headers)
            print(f"Verify Delete Status: {resp.status_code} (Should be 404)")

        # 14. DELETE ACCOUNT (Soft Delete)
        # Note: This might prevent re-running the script with same user if you don't change username
        # print("Deleting account...")
        # del_acc_url = f'{BASE_URL}/users/me'
        # del_acc_data = {"password": user_data['password']}
        # resp = requests.delete(del_acc_url, json=del_acc_data, headers=headers)
        # print_response(resp, "DELETE ACCOUNT")

    else:
        print("Login failed, skipping protected route tests.")

if __name__ == "__main__":
    main()