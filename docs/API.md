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

------------------------------------------------------------------------------------------

## 🔐 Authentication

### Register

<details>
 <summary><code>POST</code> <code><b>auth/register</b></code> <code>(Create new user)</code></summary>

##### Parameters

> | name       | type      | data type | description        |
> |------------|-----------|-----------|--------------------|
> | `email`    | required  | string    | User email         |
> | `password` | required  | string    | User password      |
> | `name`     | optional  | string    | Display name       |

##### Responses

> | http code | content-type            | response                                               |
> |-----------|-------------------------|--------------------------------------------------------|
> | `201`     | `application/json`      | `{ "message": "Account created", "userId": "u_123" }`  |
> | `400`     | `application/json`      | `{ "error": "Invalid input" }`                         |

</details>

---

### Login

<details>
 <summary><code>POST</code> <code><b>auth/login</b></code> <code>(Authenticate & issue JWT)</code></summary>

##### Parameters

> | name       | type      | data type | description       |
> |------------|-----------|-----------|-------------------|
> | `email`    | required  | string    | User email        |
> | `password` | required  | string    | User password     |

##### Responses

> | http code | content-type            | response                                                      |
> |-----------|-------------------------|---------------------------------------------------------------|
> | `200`     | `application/json`      | `{ "accessToken":"xxx.yyy.zzz", "expiresIn":3600 }`           |
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
> | `200`     | `application/json`      | `{ "accessToken":"eyJhbGciOi...", "expiresIn":900 }`                          |
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
> | `refreshToken`  | optional | string    | Token to revoke (if applicable)      |

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
 <summary><code>GET</code> <code><b>/users/me</b></code> <code>(Get own profile)</code></summary>

##### Responses

> | http code | content-type            | response                                                                 |
> |-----------|-------------------------|--------------------------------------------------------------------------|
> | `200`     | `application/json`      | `{ "id":"u_123","email":"a@b.com","name":"John","bio":"...","avatar":"" }` |
> | `401`     | `application/json`      | `{ "error":"Unauthorized" }`                                             |

</details>

---

### Update Profile

<details>
 <summary><code>PUT</code> <code><b>/users/me</b></code> <code>(Update own profile)</code></summary>

##### Parameters

> | name       | type     | data type | description           |
> |------------|----------|-----------|-----------------------|
> | `name`     | optional | string    | Display name          |
> | `bio`      | optional | string    | User bio              |
> | `avatar`   | optional | string    | Avatar URL            |

##### Responses

> | http code | content-type            | response                                              |
> |-----------|-------------------------|-------------------------------------------------------|
> | `200`     | `application/json`      | `{ "id":"u_123","name":"John","bio":"...","avatar":""}` |
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
> | `200`     | `application/json`      | `{ "id":"u_234","name":"Jane","bio":"...","publicNotes":[{ "id":"n1",...}] }` |
> | `404`     | `application/json`      | `{ "error":"User not found" }`                                                |

</details>

------------------------------------------------------------------------------------------

## 📝 Notes (CRUD)

### Create Note

<details>
 <summary><code>POST</code> <code><b>/notes</b></code> <code>(Create new note)</code></summary>

##### Parameters

> | name        | type      | data type | description                         |
> |-------------|-----------|-----------|-------------------------------------|
> | `title`     | required  | string    | Note title                          |
> | `content`   | optional  | string    | Markdown content                    |
> | `tags`      | optional  | array     | Tags array                          |
> | `isPublic`  | optional  | boolean   | Default false (private)             |

##### Responses

> | http code | content-type            | response                                                                 |
> |-----------|-------------------------|--------------------------------------------------------------------------|
> | `201`     | `application/json`      | `{ "id":"note_123","title":"My Note","tags":[],"isPublic":false }`       |
> | `400`     | `application/json`      | `{ "error": "Title is required" }`                                       |

</details>

---

### Get Note

<details>
 <summary><code>GET</code> <code><b>/notes/{id}</b></code> <code>(Get note details)</code></summary>

##### Parameters

> | name | type  | data type | description |
> |------|-------|-----------|-------------|
> | `id` | path  | string    | Note ID     |

##### Responses

> | http code | content-type            | response                                                                                   |
> |-----------|-------------------------|--------------------------------------------------------------------------------------------|
> | `200`     | `application/json`      | `{ "id":"note_123","title":"My Note","content":"...","tags":[],"isPublic":false,"owner":{"id":"u_123","name":"John"},"teamId":null,"created_at":"...","updated_at":"..." }` |
> | `404`     | `application/json`      | `{ "error":"Note not found" }`                                                             |

</details>

---

### List Own Notes

<details>
 <summary><code>GET</code> <code><b>/notes</b></code> <code>(List notes of current user)</code></summary>

##### Query Parameters

> | name  | type     | data type | description      |
> |-------|----------|-----------|------------------|
> | `tag` | optional | string    | Filter by tag    |
> | `q`   | optional | string    | Full-text search |

##### Responses

> | http code | content-type            | response                                                        |
> |-----------|-------------------------|-----------------------------------------------------------------|
> | `200`     | `application/json`      | `[{"id":"n1","title":"A","tags":["x"],"isPublic":false,"updated_at":"..."}]` |

</details>

---

### List Public Notes

<details>
 <summary><code>GET</code> <code><b>/notes/public</b></code> <code>(Explore public notes)</code></summary>

##### Responses

> | http code | content-type            | response                                                           |
> |-----------|-------------------------|--------------------------------------------------------------------|
> | `200`     | `application/json`      | `[{"id":"n1","title":"Public","owner":{"id":"u_234","name":"Jane"}}]` |

</details>

---

### Update Note

<details>
 <summary><code>PUT</code> <code><b>/notes/{id}</b></code> <code>(Update note)</code></summary>

##### Parameters

> | name       | type  | data type | description        |
> |------------|-------|-----------|--------------------|
> | `id`       | path  | string    | Note ID            |
> | `title`    | body  | string    | Updated title      |
> | `content`  | body  | string    | Updated markdown   |
> | `tags`     | body  | array     | Updated tags       |
> | `isPublic` | body  | boolean   | Updated visibility |

##### Responses

> | http code | content-type            | response                               |
> |-----------|-------------------------|----------------------------------------|
> | `200`     | `application/json`      | `{ "message":"Note updated" }`         |
> | `403`     | `application/json`      | `{ "error":"Not owner of note" }`      |

</details>

---

### Delete Note

<details>
 <summary><code>DELETE</code> <code><b>/notes/{id}</b></code> <code>(Delete note)</code></summary>

##### Parameters

> | name | type | data type | description |
> |------|------|-----------|-------------|
> | `id` | path | string    | Note ID     |

##### Responses

> | http code | content-type            | response            |
> |-----------|-------------------------|---------------------|
> | `204`     | `application/json`      | *No content*        |
> | `403`     | `application/json`      | `{ "error":"Forbidden" }` |

</details>

------------------------------------------------------------------------------------------

## 🏷 Visibility & Tags

### Toggle Visibility
<details>
 <summary><code>POST</code> <code><b>/notes/{id}/visibility</b></code> <code>(Change note to public/private)</code></summary>

##### Parameters

> | name         | type   | data type | description               |
> |--------------|--------|-----------|---------------------------|
> | `visibility` | body   | string    | `public` or `private`     |

##### Responses

> | http code | content-type            | response                     |
> |-----------|-------------------------|------------------------------|
> | `200`     | `application/json`      | `{ "visibility":"public" }`  |

</details>

---

### Add Tags
<details>
 <summary><code>POST</code> <code><b>/notes/{id}/tags</b></code> <code>(Add tags)</code></summary>

##### Parameters

> | name   | type | data type | description              |
> |--------|------|-----------|--------------------------|
> | `tags` | body | array     | e.g., `["XSS","SQLi"]`   |

##### Responses

> | http code | content-type            | response                        |
> |-----------|-------------------------|---------------------------------|
> | `200`     | `application/json`      | `{ "tags":["XSS","SQLi"] }`     |

</details>

---

### Remove Tag
<details>
 <summary><code>DELETE</code> <code><b>/notes/{id}/tags/{tag}</b></code> <code>(Remove tag)</code></summary>

##### Parameters

> | name  | type | data type | description     |
> |-------|------|-----------|-----------------|
> | `id`  | path | string    | Note ID         |
> | `tag` | path | string    | Tag to remove   |

##### Responses

> | http code | content-type            | response      |
> |-----------|-------------------------|---------------|
> | `204`     | `application/json`      | *No content*  |

</details>

---

### List All Tags
<details>
 <summary><code>GET</code> <code><b>/tags</b></code> <code>(List all tags)</code></summary>

##### Responses

> | http code | content-type            | response                 |
> |-----------|-------------------------|--------------------------|
> | `200`     | `application/json`      | `["XSS","SQLi","LFI"]`   |

</details>

------------------------------------------------------------------------------------------

## 🧠 AI Refine

<details>
 <summary><code>POST</code> <code><b>/notes/{id}/refine</b></code> <code>(Refine note content using AI)</code></summary>

##### Parameters

> | name      | type     | data type | description                      |
> |-----------|----------|-----------|----------------------------------|
> | `action`  | optional | string    | `"improve"` or `"summarize"`     |
> | `content` | optional | string    | Original content (override)      |

##### Responses

> | http code | content-type            | response                                         |
> |-----------|-------------------------|--------------------------------------------------|
> | `200`     | `application/json`      | `{ "refinedContent":"# Improved Markdown..." }`  |

</details>

------------------------------------------------------------------------------------------

## 📤 Upload

<details>
 <summary><code>POST</code> <code><b>/upload</b></code> <code>(Upload a file to embed in notes)</code></summary>

##### Parameters

> | name   | type      | data type | description                    |
> |--------|-----------|-----------|--------------------------------|
> | `file` | form-data | file      | Image/file to upload (≤5MB)    |

##### Responses

> | http code | content-type            | response                                                   |
> |-----------|-------------------------|------------------------------------------------------------|
> | `200`     | `application/json`      | `{ "url":"https://cdn.example.com/uploads/file.png" }`     |

</details>

------------------------------------------------------------------------------------------

## 🔍 Search

<details>
 <summary><code>GET</code> <code><b>/search</b></code> <code>(Search for notes)</code></summary>

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
 <summary><code>POST</code> <code><b>/teams</b></code> <code>(Create a team)</code></summary>

##### Parameters

> | name          | type     | data type | description        |
> |---------------|----------|-----------|--------------------|
> | `name`        | required | string    | Team name          |
> | `description` | optional | string    | Team description   |

##### Responses

> | http code | content-type            | response                                  |
> |-----------|-------------------------|-------------------------------------------|
> | `201`     | `application/json`      | `{ "id":"team_123","name":"Dev" }`        |

</details>

---

### List My Teams
<details>
 <summary><code>GET</code> <code><b>/teams</b></code> <code>(List teams joined by current user)</code></summary>

##### Responses

> | http code | content-type            | response                                                                      |
> |-----------|-------------------------|-------------------------------------------------------------------------------|
> | `200`     | `application/json`      | `[{"id":"team_1","name":"Dev","role":"owner","memberCount":5}]`               |

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
> | `200`     | `application/json`      | `{ "id":"team_1","name":"Dev","description":"...","owner":{"id":"u1"},"members":[...],"notes":[...] }` |

</details>

---

### Update Team
<details>
 <summary><code>PUT</code> <code><b>/teams/{id}</b></code> <code>(Update team)</code></summary>

##### Parameters

> | name          | type | data type | description        |
> |---------------|------|-----------|--------------------|
> | `name`        | body | string    | Team name          |
> | `description` | body | string    | Team description   |

##### Responses

> | http code | content-type            | response                         |
> |-----------|-------------------------|----------------------------------|
> | `200`     | `application/json`      | `{ "message":"Team updated" }`   |

</details>

---

### Delete Team
<details>
 <summary><code>DELETE</code> <code><b>/teams/{id}</b></code> <code>(Delete team)</code></summary>

##### Parameters

> | name | type | data type | description |
> |------|------|-----------|-------------|
> | `id` | path | string    | Team ID     |

##### Responses

> | http code | content-type            | response                     |
> |-----------|-------------------------|------------------------------|
> | `200`     | `application/json`      | `{ "message":"Deleted" }`    |

</details>

---

### Invite Member
<details>
 <summary><code>POST</code> <code><b>/teams/{id}/invite</b></code> <code>(Invite member by email)</code></summary>

##### Parameters

> | name    | type | data type | description        |
> |---------|------|-----------|--------------------|
> | `email` | body | string    | Email of invitee   |

##### Responses

> | http code | content-type            | response                         |
> |-----------|-------------------------|----------------------------------|
> | `200`     | `application/json`      | `{ "message":"Invitation sent" }`|

</details>

---

### Remove Member
<details>
 <summary><code>POST</code> <code><b>/teams/{teamId}/members/{userId}/remove</b></code> <code>(Remove a member or leave team)</code></summary>

##### Parameters

> | name      | type | data type | description        |
> |-----------|------|-----------|--------------------|
> | `teamId`  | path | string    | Team ID            |
> | `userId`  | path | string    | Member to remove   |

##### Responses

> | http code | content-type            | response                         |
> |-----------|-------------------------|----------------------------------|
> | `200`     | `application/json`      | `{ "message":"Member removed" }` |

</details>

---

### List Team Notes
<details>
 <summary><code>GET</code> <code><b>/teams/{id}/notes</b></code> <code>(List notes in team)</code></summary>

##### Parameters

> | name | type | data type | description |
> |------|------|-----------|-------------|
> | `id` | path | string    | Team ID     |

##### Responses

> | http code | content-type            | response                                                        |
> |-----------|-------------------------|-----------------------------------------------------------------|
> | `200`     | `application/json`      | `[{"id":"n1","title":"Team Doc","tags":[],"updated_at":"..."}]` |

</details>

---

### Create Team Note
<details>
 <summary><code>POST</code> <code><b>/teams/{id}/notes</b></code> <code>(Create a note in team space)</code></summary>

##### Parameters

> | name        | type  | data type | description             |
> |-------------|-------|-----------|-------------------------|
> | `id`        | path  | string    | Team ID                 |
> | `title`     | body  | string    | Note title              |
> | `content`   | body  | string    | Markdown content        |
> | `tags`      | body  | array     | Tags array              |
> | `isPublic`  | body  | boolean   | Team-visible/public     |

##### Responses

> | http code | content-type            | response                                  |
> |-----------|-------------------------|-------------------------------------------|
> | `201`     | `application/json`      | `{ "id":"note_team_1","teamId":"id" }`    |

</details>

---

### Share Note to Team (owner action)
<details>
 <summary><code>PUT</code> <code><b>/notes/{id}/share-to-team</b></code> <code>(Move/share a personal note into a team)</code></summary>

##### Parameters

> | name      | type | data type | description         |
> |-----------|------|-----------|---------------------|
> | `id`      | path | string    | Note ID             |
> | `teamId`  | body | string    | Target team ID      |

##### Responses

> | http code | content-type            | response                           |
> |-----------|-------------------------|------------------------------------|
> | `200`     | `application/json`      | `{ "message":"Shared to team" }`   |
> | `403`     | `application/json`      | `{ "error":"Forbidden" }`          |

</details>

---

### Share Note to Team (alternate)
<details>
 <summary><code>POST</code> <code><b>/notes/{id}/share</b></code> <code>(Share note with a team)</code></summary>

##### Parameters

> | name     | type | data type | description     |
> |----------|------|-----------|-----------------|
> | `teamId` | body | string    | Target team ID  |

##### Responses

> | http code | content-type            | response                                   |
> |-----------|-------------------------|--------------------------------------------|
> | `200`     | `application/json`      | `{ "message":"Note shared with team" }`    |

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
