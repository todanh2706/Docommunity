import requests
import json
import random

# ================== CONFIG ==================
BASE_URL = 'http://localhost:8080/api'

# Nếu có sẵn tagId để test community (view-all-docs) thì set vào đây
COMMUNITY_TAG_ID = None  # ví dụ: 1

# Test Data
username = f"user_{random.randint(1000, 9999)}"  # Random user mỗi lần chạy
user_data = {
    "username": username,
    "email": f"{username}@gmail.com",
    "password": "password123",
    "fullname": "Test User",
    "phone": "0912345678"
}


def print_response(response, title):
    print(f"\n--- {title} ---")
    print(f"URL: {response.request.method} {response.url}")
    print(f"Status: {response.status_code}")
    try:
        print("Response:", json.dumps(response.json(), indent=4, ensure_ascii=False))
    except Exception:
        print("Response:", response.text)


def get_data(resp):
    """Helper: trả về resp.json()['data'] nếu có."""
    try:
        body = resp.json()
        return body.get("data")
    except Exception:
        return None


def main():
    # 1. REGISTER
    print(f"Registering user: {user_data['username']}...")
    register_url = f'{BASE_URL}/auth/register'
    resp = requests.post(register_url, json=user_data)
    print_response(resp, "REGISTER")

    if resp.status_code != 201:
        print("Registration failed (hoặc đã tồn tại). Vẫn thử login...")

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
        body = resp.json()
        token_data = body.get('data', {})  # ✅ login trả về ResponseDTO

        access_token = token_data.get('accessToken')
        refresh_token = token_data.get('refreshToken')

        print("Access token:", access_token)
        print("Refresh token:", refresh_token)

        if not access_token:
            print("❌ Không lấy được accessToken -> dừng.")
            return

        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }

        # 3. GET CURRENT PROFILE
        profile_url = f'{BASE_URL}/users/me'
        resp = requests.get(profile_url, headers=headers)
        print_response(resp, "GET PROFILE")

        my_data = get_data(resp) if resp.status_code == 200 else None
        my_id = my_data.get('id') if my_data else None
        print("My ID:", my_id)

        # 4. UPDATE PROFILE
        update_url = f'{BASE_URL}/users/me'
        update_data = {
            "bio": "I love coding with Spring Boot!",
            "phone": "0999888777"
        }
        resp = requests.put(update_url, json=update_data, headers=headers)
        print_response(resp, "UPDATE PROFILE")

        # ---------- DOCUMENT ROUTES ----------

        # 5. CREATE DOCUMENT
        print("Creating document...")
        create_doc_url = f'{BASE_URL}/documents'
        doc_data = {
            "title": "My Project Plan",
            "content": "This project needs a backend using Java. It also needs a frontend.",
            "tags": ["java", "planning"],
            "isPublic": True
        }
        resp = requests.post(create_doc_url, json=doc_data, headers=headers)
        print_response(resp, "CREATE DOCUMENT")

        doc_id = None
        if resp.status_code in (200, 201):
            doc_data_resp = get_data(resp)
            if doc_data_resp:
                doc_id = doc_data_resp.get('id')
        print("Created doc ID:", doc_id)

        # 6. LIST MY DOCUMENTS
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
                "isPublic": True  # thử set public
            }
            resp = requests.put(update_doc_url, json=update_doc_data, headers=headers)
            print_response(resp, "UPDATE DOCUMENT")

        # ---------- LIKE / UNLIKE DOCUMENT ----------

        if doc_id:
            print("\n===== TEST LIKE / UNLIKE =====")

            like_url = f'{BASE_URL}/documents/{doc_id}/like'
            resp = requests.post(like_url, headers=headers)
            print_response(resp, "LIKE DOCUMENT")

            unlike_url = f'{BASE_URL}/documents/{doc_id}/like'
            resp = requests.delete(unlike_url, headers=headers)
            print_response(resp, "UNLIKE DOCUMENT")

        # ---------- COMMENTS & REPLIES ----------

        comment_id = None

        if doc_id:
            print("\n===== TEST COMMENTS =====")

            # 1) Add comment to document
            add_comment_url = f'{BASE_URL}/documents/{doc_id}/comments'
            add_comment_data = {
                "content": "This document looks great! 👍"
            }
            resp = requests.post(add_comment_url, json=add_comment_data, headers=headers)
            print_response(resp, "ADD COMMENT TO DOCUMENT")

            if resp.status_code in (200, 201):
                comment_data = get_data(resp)
                if comment_data:
                    comment_id = comment_data.get('id')
            print("Comment ID:", comment_id)

            # 2) Get comments of document
            get_comments_url = f'{BASE_URL}/documents/{doc_id}/comments'
            resp = requests.get(get_comments_url, headers=headers)
            print_response(resp, "GET COMMENTS OF DOCUMENT")

            # Nếu chưa lấy được comment_id, thử lấy từ list
            if not comment_id and resp.status_code == 200:
                comments_list = get_data(resp) or []
                if comments_list:
                    comment_id = comments_list[0].get('id')
                    print("Using first comment id from list:", comment_id)

        # 3) Reply to comment (CommentController)
        if comment_id:
            print("\n===== TEST REPLY TO COMMENT =====")
            reply_url = f'{BASE_URL}/comments/{comment_id}/replies'
            reply_data = {
                "content": "Thanks for your feedback!"
            }
            resp = requests.post(reply_url, json=reply_data, headers=headers)
            print_response(resp, "REPLY TO COMMENT")

        # ---------- COMMUNITY ROUTES ----------

        if doc_id:
            print("\n===== TEST COMMUNITY VIEW DOC =====")
            # /view-doc?docid={id}
            view_doc_url = f'{BASE_URL}/view-doc'
            params = {"docid": doc_id}
            resp = requests.get(view_doc_url, params=params, headers=headers)
            print_response(resp, "COMMUNITY VIEW DOC")

        if COMMUNITY_TAG_ID is not None:
            print("\n===== TEST COMMUNITY VIEW ALL DOCS (BY TAG) =====")
            view_all_url = f'{BASE_URL}/view-all-docs'
            params = {
                "tagid": str(COMMUNITY_TAG_ID),
                "page": "1"
            }
            resp = requests.get(view_all_url, params=params, headers=headers)
            print_response(resp, "COMMUNITY VIEW ALL DOCS")

        # ---------- AI ROUTES ----------

        print("\n===== TEST AI ROUTES =====")

        # 9. AI CHAT
        chat_url = f'{BASE_URL}/ai/chat'
        chat_data = {
            "message": "What is the capital of France?",
            "documentId": doc_id  # Optional context
        }
        resp = requests.post(chat_url, json=chat_data, headers=headers)
        print_response(resp, "AI CHAT")

        # 10. AI TAGS
        tags_url = f'{BASE_URL}/ai/tags'
        tags_data = {
            "content": "Spring Boot is a Java framework for building web applications. It uses Dependency Injection."
        }
        resp = requests.post(tags_url, json=tags_data, headers=headers)
        print_response(resp, "AI SUGGEST TAGS")

        # 11. AI GENERATE
        gen_url = f'{BASE_URL}/ai/generate'
        gen_data = {
            "type": "email",
            "prompt": "Write a short welcome email to a new user named John."
        }
        resp = requests.post(gen_url, json=gen_data, headers=headers)
        print_response(resp, "AI GENERATE")

        # 12. AI REFINE DOCUMENT
        if doc_id:
            refine_url = f'{BASE_URL}/documents/{doc_id}/refine'
            refine_data = {
                "action": "improve",
                # "content": "Optional override text"
            }
            resp = requests.post(refine_url, json=refine_data, headers=headers)
            print_response(resp, "AI REFINE DOCUMENT")

        # ---------- CLEANUP (OPTIONAL) ----------

        if doc_id:
            print("\n===== DELETE DOCUMENT =====")
            del_url = f'{BASE_URL}/documents/{doc_id}'
            resp = requests.delete(del_url, headers=headers)
            print_response(resp, "DELETE DOCUMENT")

            # Verify deletion
            resp = requests.get(del_url, headers=headers)
            print(f"Verify Delete Status: {resp.status_code} (Should be 404 or 403)")

    else:
        print("❌ Login failed, skipping protected route tests.")


if __name__ == "__main__":
    main()
