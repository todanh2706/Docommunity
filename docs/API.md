# 📘 WritExploit API Documentation

- **Base URL:** `https://api.example.com/api/`
- **Version:** `v1`
- **Authentication:** JWT Bearer Token (`Authorization: Bearer <token>`)
- **Content-Type:** `application/json`
- **Common Status Codes:**
  - `200` OK
  - `201` Created
  - `204` No Content
  - `400` Bad Request
  - `401` Unauthorized
  - `403` Forbidden
  - `404` Not Found
  - `500` Internal Server error
------------------------------------------------------------------------------------------

## 🔐 Authentication

### Register (checked)

<details>
 <summary><code>POST</code> <code><b>auth/register</b></code> <code>(Create new user)</code></summary>

##### Parameters

> | name       | type      | data type | description        |
> |------------|-----------|-----------|--------------------|
> | `username`    | required  | string    | Username  |
> | `password` | required  | string    | Password      |
> | `fullname`     | required  | string    | Display name       |
> | `phone`     | optional  | string    | Phone number       |
> | `email`    | required  | string    | User email  
##### Responses

> | http code | content-type            | response                                               |
> |-----------|-------------------------|--------------------------------------------------------|
> | `201`     | `application/json`      | `{ "message": "Account created"}`  |
> | `400`     | `application/json`      | `{ "error": "Invalid input" }`                         |

</details>

---

### Login (checked)

<details>
 <summary><code>POST</code> <code><b>auth/login</b></code> <code>(Authenticate & issue JWT)</code></summary>

##### Parameters

> | name       | type      | data type | description       |
> |------------|-----------|-----------|-------------------|
> | `username`    | required  | string    | Username        |
> | `password` | required  | string    |Password     |

##### Responses

> | http code | content-type            | response                                                      |
> |-----------|-------------------------|---------------------------------------------------------------|
> | `200`     | `application/json`      | `{ "accessToken":"xxx.yyy.zzz", "refreshToken":xxx }`           |
> | `401`     | `application/json`      | `{ "error": "Invalid credentials" }`                          |

</details>

---

### Refresh Token

<details>
 <summary><code>POST</code> <code><b>auth/refresh</b></code> <code>(Get new access token from refresh token)</code></summary>

##### Parameters

> | name            | type     | data type | description                                              |
> |-----------------|----------|-----------|----------------------------------------------------------|
> | `refreshToken`  | required | string    | Valid refresh token (cookie or body/header)             |

##### Responses

> | http code | content-type            | response                                                                      |
> |-----------|-------------------------|-------------------------------------------------------------------------------|
> | `200`     | `application/json`      | `{ "accessToken":"eyJhbGciOi..." }`                          |
> | `401`     | `application/json`      | `{ "error":"Invalid or expired refresh token" }`                              |
> | `403`     | `application/json`      | `{ "error":"Token revoked or already used" }`                                 |

</details>

---

### Logout

<details>
 <summary><code>POST</code> <code><b>auth/logout</b></code> <code>(Revoke current refresh token)</code></summary>

##### Parameters

> | name            | type     | data type | description                          |
> |-----------------|----------|-----------|--------------------------------------|
> | `refreshToken`  | require | string    | Token to revoke (if applicable)      |

##### Responses

> | http code | content-type            | response                                  |
> |-----------|-------------------------|-------------------------------------------|
> | `200`     | `application/json`      | `{ "message":"Logged out" }` or `{"OK"}`  |
> | `401`     | `application/json`      | `{ "error":"Unauthorized or invalid token"}` |

</details>

------------------------------------------------------------------------------------------

## 👤 Users (Profile)

### Get Current User Profile

<details>
 <summary><code>GET</code> <code><b>/users/me</b></code>🔒<code>(Get own profile)</code></summary>

##### Parameters

> | name     | type | data type | description |
> |----------|------|-----------|-------------|
> | `Authorization` | required | `Bearer <access_token>` | |
##### Responses

> | http code | content-type            | response                                                                 |
> |-----------|-------------------------|--------------------------------------------------------------------------|
> | `200`     | `application/json`      | `{ "username":"u_123","email":"a@b.com","fullname":"John","phone":"000", "bio":"..."}` |
> | `401`     | `application/json`      | `{ "error":"Unauthorized" }`                                             |

</details>

---

### Update Profile

<details>
 <summary><code>PUT</code> <code><b>/users/me</b></code>🔒<code>(Update own profile)</code></summary>

##### Parameters

> | name     | type | data type | description |
> |----------|------|-----------|-------------|
> | `Authorization` | required | `Bearer <access_token>` | |
##### Responses

> | http code | content-type            | response                                              |
> |-----------|-------------------------|-------------------------------------------------------|
> | `200`     | `application/json`      | `{ "id":"u_123","name":"John","bio":"...", "phone": "...", "avatar":""}` |
> | `401`     | `application/json`      | `{ "error":"Unauthorized" }`                         |

</details>

---

### Get Public User Profile

<details>
 <summary><code>GET</code> <code><b>/users/{userId}</b></code> <code>(View another user's public profile)</code></summary>

##### Parameters

> | name     | type | data type | description |
> |----------|------|-----------|-------------|
> | `userId` | path | string    | User ID     |

##### Responses

> | http code | content-type            | response                                                                      |
> |-----------|-------------------------|-------------------------------------------------------------------------------|
> | `200`     | `application/json`      | `{ "id":"...","fullname":"Jane","bio":"...","avatar": "...", "publicNotes":[{ "id":"n1",...}] }` |
> | `404`     | `application/json`      | `{ "error":"User not found" }`                                                |

</details>

### Delete Account (Soft Delete)

<details>
 <summary><code>POST</code> <code><b>/users/me</b></code>🔒<code>(Deactivate account)</code></summary>

*Logic: Yêu cầu password xác nhận. Tài khoản sẽ bị vô hiệu hóa (soft delete) và lên lịch xóa vĩnh viễn sau 30 ngày.*

##### Parameters

> | name | type | data type | description |
> |---|---|---|---|
> | `password` | body | string | Password |

##### Responses

> | http code | content-type | response |
> |---|---|---|
> | `200` | `application/json` | `{ "message": "Account deactivated. Will be deleted in 30 days." }` |
> | `401` | `application/json` | `{ "error": "Incorrect password" }` |

</details>
------------------------------------------------------------------------------------------

## 📝 Documents (CRUD) 

### Create Document (checked)

<details>
 <summary><code>POST</code> <code><b>/documents</b></code>🔒<code>(Create new document)</code></summary>

##### Parameters

> | name        | type      | data type | description                         |
> |-------------|-----------|-----------|-------------------------------------|
> | `Authorization` | required | `Bearer <access_token>` | |
> | `title`     | required  | string    | Document title                          |
> | `content`   | optional  | string    | Markdown content                    |
> | `tags`      | optional  | array     | Tags array                          |
> | `isPublic`  | optional  | boolean   | Default false (private)             |

##### Responses

> | http code | content-type            | response                                                                 |
> |-----------|-------------------------|--------------------------------------------------------------------------|
> | `201`     | `application/json`      | `{ "id":"note_123","title":"My Note","tags":[],"isPublic":false }`       |
> | `400`     | `application/json`      | `{ "error": "Title is required" }`                                       |
> | `401` | `application/json` | `{ "error": "Unauthorized" }` |
</details>

---

### Get Document

<details>
 <summary><code>GET</code> <code><b>/documents/{id}</b></code> <code>(Get document details)</code></summary>

##### Parameters

> | name | type  | data type | description |
> |------|-------|-----------|-------------|
> | `id` | path  | string    | Document ID     |

##### Responses

> | http code | content-type            | response                                                                                   |
> |-----------|-------------------------|--------------------------------------------------------------------------------------------|
> | `200`     | `application/json`      | `{ "id":"note_123","title":"My Note","content":"...","tags":[],"isPublic":false,"owner":{"id":"u_123","name":"John"},"teamId":null,"created_at":"...","updated_at":"..." }` |
> | `404`     | `application/json`      | `{ "error":"Note not found" }`                                                             |

</details>

---

### List Own Documents

<details>
 <summary><code>GET</code> <code><b>/documents</b></code>🔒<code>(List documents of current user)</code></summary>

##### Query Parameters

> | name  | type     | data type | description      |
> |-------|----------|-----------|------------------|
> | `Authorization` | required | `Bearer <access_token>` | |
> | `tag` | optional | string    | Filter by tag    |
> | `q`   | optional | string    | Full-text search |

##### Responses

> | http code | content-type            | response                                                        |
> |-----------|-------------------------|-----------------------------------------------------------------|
> | `200`     | `application/json`      | `[{"id":"n1","title":"A","tags":["x"],"isPublic":false,"updated_at":"..."}]` |
> | `401` | `application/json` | `{ "error": "Unauthorized" }` |
</details>

---

### List Public Documents

<details>
 <summary><code>GET</code> <code><b>/documents/public</b></code> <code>(Explore public documents)</code></summary>

##### Responses

> | http code | content-type            | response                                                           |
> |-----------|-------------------------|--------------------------------------------------------------------|
> | `200`     | `application/json`      | `[{"id":"n1","title":"Public","owner":{"id":"u_234","name":"Jane"}}]` |

</details>

---

### Update Document
<details>
 <summary><code>PUT</code> <code><b>/documents/{id}</b></code>🔒<code>(Update document)</code></summary>

##### Parameters

> | name       | type  | data type | description        |
> |------------|-------|-----------|--------------------|
> | `Authorization` | required | `Bearer <access_token>` | |
> | `title`    | optional  | string    | Updated title      |
> | `content`  | optional  | string    | Updated markdown   |
> | `tags`     | optional  | array     | Updated tags       |
> | `isPublic` | optional  | boolean   | Updated visibility |

##### Responses

> | http code | content-type            | response                               |
> |-----------|-------------------------|----------------------------------------|
> | `200`     | `application/json`      | `{ "message":"Document updated" }`         |
> | `403`     | `application/json`      | `{ "error":"Not owner of document" }`      |
> | `401` | `application/json` | `{ "error": "Unauthorized" }` |
</details>

---

### Delete Document

<details>
 <summary><code>DELETE</code> <code><b>/documents/{id}</b></code>🔒<code>(Delete document)</code></summary>

##### Parameters
> | name | type | data type | description |
> |------|------|-----------|-------------|
> | `Authorization` | required | `Bearer <access_token>` | |
> | `id` | path | string    | Document ID     |

##### Responses

> | http code | content-type            | response            |
> |-----------|-------------------------|---------------------|
> | `204`     | `application/json`      | *No content*        |
> | `403`     | `application/json`      | `{ "error":"Forbidden" }` |
> | `401` | `application/json` | `{ "error": "Unauthorized" }` |
</details>

------------------------------------------------------------------------------------------

## 🧠 AI Refine

<details>
 <summary><code>POST</code> <code><b>/documents/{id}/refine</b></code>🔒<code>(Refine document content using AI)</code></summary>

##### Parameters

> | name      | type     | data type | description                      |
> |-----------|----------|-----------|----------------------------------|
> | `Authorization` | required | `Bearer <access_token>` | |
> | `action`  | optional | string    | `"improve"` or `"summarize"`     |
> | `content` | optional | string    | Original content (override)      |

thêm 1 route AI: suggestion (text completion, tag suggestion, refine), chatbot, template+


##### Responses

> | http code | content-type            | response                                         |
> |-----------|-------------------------|--------------------------------------------------|
> | `200`     | `application/json`      | `{ "refinedContent":"# Improved Markdown..." }`  |
> | `401` | `application/json` | `{ "error": "Unauthorized" }` |
</details>

### AI Chat / Assistant
<details>
 <summary><code>POST</code> <code><b>/ai/chat</b></code>🔒<code>(Chat with context of a document)</code></summary>

##### Parameters

> | name | type | data type | description |
> |---|---|---|---|
> | `Authorization` | required | `Bearer <access_token>` | |
> | `documentId` | body | string | Context document ID (optional) |
> | `message` | body | string | User question |

##### Responses

> | http code | content-type | response |
> |---|---|---|
> | `200` | `application/json` | `{ "reply": "Based on your note, user X is..." }` |
> | `401` | `application/json` | `{ "error": "Unauthorized" }` |
</details>

### AI Suggest Tags
<details>
 <summary><code>POST</code> <code><b>/ai/tags</b></code>🔒<code>(Auto-suggest tags based on content)</code></summary>

##### Parameters

> | name | type | data type | description |
> |---|---|---|---|
> | `Authorization` | required | `Bearer <access_token>` | |
> | `content` | body | string | Text to analyze |

##### Responses

> | http code | content-type | response |
> |---|---|---|
> | `200` | `application/json` | `{ "tags": ["react", "javascript", "frontend"] }` |
> | `401` | `application/json` | `{ "error": "Unauthorized" }` |
</details>

### AI Generate / Template
<details>
 <summary><code>POST</code> <code><b>/ai/generate</b></code>🔒<code>(Generate content from prompt/template)</code></summary>

##### Parameters

> | name | type | data type | description |
> |---|---|---|---|
> | `Authorization` | required | `Bearer <access_token>` | |
> | `type` | body | string | `blog`, `summary`, `email`, `code` |
> | `prompt` | body | string | Key points or instruction |

##### Responses

> | http code | content-type | response |
> |---|---|---|
> | `200` | `application/json` | `{ "content": "# Generated Blog Post\n\nHere is..." }` |
> | `401` | `application/json` | `{ "error": "Unauthorized" }` |
</details>

------------------------------------------------------------------------------------------

## 📤 Upload

<details>
 <summary><code>POST</code> <code><b>/upload</b></code>🔒<code>(Upload a file to embed in documents)</code></summary>

##### Parameters

> | name   | type      | data type | description                    |
> |--------|-----------|-----------|--------------------------------|
> | `Authorization` | required | `Bearer <access_token>` | |
> | `file` | form-data | file      | Image/file to upload (≤5MB)    |

##### Responses

> | http code | content-type            | response                                                   |
> |-----------|-------------------------|------------------------------------------------------------|
> | `200`     | `application/json`      | `{ "url":"https://cdn.example.com/uploads/file.png" }`     |
> | `401` | `application/json` | `{ "error": "Unauthorized" }` |
</details>

------------------------------------------------------------------------------------------

## 🔍 Search

<details>
 <summary><code>GET</code> <code><b>/search</b></code> <code>(Search for documents)</code></summary>

##### Parameters

> | name | type  | data type | description            |
> |------|-------|-----------|------------------------|
> | `q`  | query | string    | Keyword to search      |

##### Responses

> | http code | content-type            | response                                                             |
> |-----------|-------------------------|----------------------------------------------------------------------|
> | `200`     | `application/json`      | `[{"id":"note_1","title":"Keyword Match","owner":{"name":"User"}}]`  |

</details>

------------------------------------------------------------------------------------------

## 👥 Team & Sharing

### Create Team
<details>
 <summary><code>POST</code> <code><b>/teams</b></code>🔒<code>(Create a team)</code></summary>

##### Parameters

> | name          | type     | data type | description        |
> |---------------|----------|-----------|--------------------|
> | `Authorization` | required | `Bearer <access_token>` | |
> | `name`        | required | string    | Team name          |
> | `description` | optional | string    | Team description   |

##### Responses

> | http code | content-type            | response                                  |
> |-----------|-------------------------|-------------------------------------------|
> | `201`     | `application/json`      | `{ "id":"team_123","name":"Dev" }`        |
> | `401` | `application/json` | `{ "error": "Unauthorized" }` |
</details>

---

### List My Teams
<details>
 <summary><code>GET</code> <code><b>/teams</b></code>🔒<code>(List teams joined by current user)</code></summary>

##### Parameters

> | name          | type     | data type | description        |
> |---------------|----------|-----------|--------------------|
> | `Authorization` | required | `Bearer <access_token>` | |

##### Responses

> | http code | content-type            | response                                                                      |
> |-----------|-------------------------|-------------------------------------------------------------------------------|

> | `200`     | `application/json`      | `[{"id":"team_1","name":"Dev","role":"owner","memberCount":5}]`               |
> | `401` | `application/json` | `{ "error": "Unauthorized" }` |
</details>

---

### Get Team Detail
<details>
 <summary><code>GET</code> <code><b>/teams/{id}</b></code> <code>(Get team info)</code></summary>

##### Parameters

> | name | type | data type | description |
> |------|------|-----------|-------------|
> | `id` | path | string    | Team ID     |

##### Responses

> | http code | content-type            | response                                                                                 |
> |-----------|-------------------------|------------------------------------------------------------------------------------------|
> | `200`     | `application/json`      | `{ "id":"team_1","name":"Dev","description":"...","owner":{"id":"u1"},"members":[...],"documents":[...] }` |

</details>

---

### Update Team
<details>
 <summary><code>PUT</code> <code><b>/teams/{id}</b></code>🔒<code>(Update team)</code></summary>

##### Parameters

> | name          | type | data type | description        |
> |---------------|------|-----------|--------------------|
> | `Authorization` | required | `Bearer <access_token>` | |
> | `name`        | body | string    | Team name          |
> | `description` | body | string    | Team description   |

##### Responses

> | http code | content-type            | response                         |
> |-----------|-------------------------|----------------------------------|
> | `200`     | `application/json`      | `{ "message":"Team updated" }`   |
> | `401` | `application/json` | `{ "error": "Unauthorized" }` |
</details>

---

### Delete Team
<details>
 <summary><code>DELETE</code> <code><b>/teams/{id}</b></code>🔒<code>(Delete team)</code></summary>

##### Parameters

> | name | type | data type | description |
> |------|------|-----------|-------------|
> | `Authorization` | required | `Bearer <access_token>` | |
> | `id` | path | string    | Team ID     |

##### Responses

> | http code | content-type            | response                     |
> |-----------|-------------------------|------------------------------|
> | `200`     | `application/json`      | `{ "message":"Deleted" }`    |
> | `401` | `application/json` | `{ "error": "Unauthorized" }` |
</details>

---

### Invite Member
<details>
 <summary><code>POST</code> <code><b>/teams/{id}/invite</b></code>🔒<code>(Invite member by email)</code></summary>

##### Parameters

> | name    | type | data type | description        |
> |---------|------|-----------|--------------------|
> | `Authorization` | required | `Bearer <access_token>` | |
> | `email` | body | string    | Email of invitee   |

##### Responses

> | http code | content-type            | response                         |
> |-----------|-------------------------|----------------------------------|
> | `200`     | `application/json`      | `{ "message":"Invitation sent" }`|
> | `401` | `application/json` | `{ "error": "Unauthorized" }` |
</details>

---

### Remove Member
<details>
 <summary><code>POST</code>🔒<code><b>/teams/{teamId}/members/{userId}/remove</b></code> <code>(Remove a member or leave team)</code></summary>

##### Parameters

> | name      | type | data type | description        |
> |-----------|------|-----------|--------------------|
> | `Authorization` | required | `Bearer <access_token>` | |
> | `teamId`  | path | string    | Team ID            |
> | `userId`  | path | string    | Member to remove   |

##### Responses

> | http code | content-type            | response                         |
> |-----------|-------------------------|----------------------------------|
> | `200`     | `application/json`      | `{ "message":"Member removed" }` |
> | `401` | `application/json` | `{ "error": "Unauthorized" }` |
</details>

---

### List Team Documents
<details>
 <summary><code>GET</code> <code><b>/teams/{id}/documents</b></code>🔒<code>(List documents in team)</code></summary>

##### Parameters

> | name | type | data type | description |
> |------|------|-----------|-------------|
> | `Authorization` | required | `Bearer <access_token>` | |
> | `id` | path | string    | Team ID     |

##### Responses

> | http code | content-type            | response                                                        |
> |-----------|-------------------------|-----------------------------------------------------------------|
> | `200`     | `application/json`      | `[{"id":"n1","title":"Team Doc","tags":[],"updated_at":"..."}]` |
> | `401` | `application/json` | `{ "error": "Unauthorized" }` |
</details>

---

### Create Team Document
<details>
 <summary><code>POST</code> <code><b>/teams/{id}/documents</b></code>🔒<code>(Create a document in team space)</code></summary>

##### Parameters

> | name        | type  | data type | description             |
> |-------------|-------|-----------|-------------------------|
> | `Authorization` | required | `Bearer <access_token>` | |
> | `id`        | path  | string    | Team ID                 |
> | `title`     | body  | string    | Document title              |
> | `content`   | body  | string    | Markdown content        |
> | `tags`      | body  | array     | Tags array              |
> | `isPublic`  | body  | boolean   | Team-visible/public     |

##### Responses

> | http code | content-type            | response                                  |
> |-----------|-------------------------|-------------------------------------------|
> | `201`     | `application/json`      | `{ "id":"note_team_1","teamId":"id" }`    |
> | `401` | `application/json` | `{ "error": "Unauthorized" }` |

</details>

---

### Share Document to Team (owner action)
<details>
 <summary><code>PUT</code> <code><b>/documents/{id}/share-to-team</b></code>🔒<code>(Move/share a personal document into a team)</code></summary>

##### Parameters

> | name      | type | data type | description         |
> |-----------|------|-----------|---------------------|
> | `Authorization` | required | `Bearer <access_token>` | |
> | `id`      | path | string    | Document ID             |
> | `teamId`  | body | string    | Target team ID      |

##### Responses

> | http code | content-type            | response                           |
> |-----------|-------------------------|------------------------------------|
> | `200`     | `application/json`      | `{ "message":"Shared to team" }`   |
> | `403`     | `application/json`      | `{ "error":"Forbidden" }`          |

</details>

------------------------------------------------------------------------------------------

## ❌ Error Responses

| Status | Content-Type        | Example                               |
|--------|---------------------|----------------------------------------|
| 400    | `application/json`  | `{ "error": "Bad Request" }`           |
| 401    | `application/json`  | `{ "error": "Unauthorized" }`          |
| 403    | `application/json`  | `{ "error": "Forbidden" }`             |
| 404    | `application/json`  | `{ "error": "Not Found" }`             |
| 500    | `application/json`  | `{ "error": "Internal Server Error" }` |
