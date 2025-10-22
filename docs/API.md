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
> | `201`     | `application/json`      | `{ "message": "Account created", "userId": "u_123" }`   |
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
> | `200`     | `application/json`      | `{ "accessToken": "xxx.yyy.zzz", "expiresIn": 3600 }`          |
> | `401`     | `application/json`      | `{ "error": "Invalid credentials" }`                          |

</details>

---

### Refresh Token

<details>
 <summary><code>POST</code> <code><b>auth/refresh</b></code> <code>(Get new access token from refresh token)</code></summary>

##### Parameters

> | name              | type      | data type | description                                                  |
> |--------------------|-----------|-----------|--------------------------------------------------------------|
> | `refreshToken`     | required  | string    | Valid refresh token (from cookie or request body/header)     |

##### Responses

> | http code | content-type            | response                                                                                                 |
> |-----------|-------------------------|----------------------------------------------------------------------------------------------------------|
> | `200`     | `application/json`      | `{ "accessToken": "eyJhbGciOiJIUzI1NiIs...", "expiresIn": 900 }`                                         |
> | `401`     | `application/json`      | `{ "error": "Invalid or expired refresh token" }`                                                        |
> | `403`     | `application/json`      | `{ "error": "Token revoked or already used" }`                                                           |

</details>

---

### Logout

<details>
 <summary><code>POST</code> <code><b>auth/logout</b></code> <code>(Revoke current refresh token)</code></summary>

##### Parameters

> | name              | type      | data type | description                                                  |
> |--------------------|-----------|-----------|--------------------------------------------------------------|
> | `refreshToken`     | optional  | string    | Refresh token to be revoked            |

##### Responses

> | http code | content-type            | response                                                                                      |
> |-----------|-------------------------|-----------------------------------------------------------------------------------------------|
> | `200`     | `application/json`      | `{"OK"}`                                                                               |
> | `401`     | `application/json`      | `{ "error": "Unauthorized or invalid token" }`                                                |

</details>


------------------------------------------------------------------------------------------

## 📝 Notes (CRUD)

### Create Note

<details>
 <summary><code>POST</code> <code><b>/notes</b></code> <code>(Create new note)</code></summary>

##### Parameters

> | name        | type      | data type | description          |
> |-------------|-----------|-----------|-----------------------|
> | `title`     | required  | string    | Note title            |
> | `content`   | optional  | string    | Markdown content      |

##### Responses

> | http code | content-type            | response                                      |
> |-----------|-------------------------|-----------------------------------------------|
> | `201`     | `application/json`      | `{ "id": "note_123", "title": "My Note" }`    |
> | `400`     | `application/json`      | `{ "error": "Title is required" }`           |


</details>

---

### Get Note

<details>
 <summary><code>GET</code> <code><b>/notes/{id}</b></code> <code>(Get note details)</code></summary>

##### Parameters

> | name  | type     | data type | description        |
> |-------|----------|-----------|--------------------|
> | `id`  | required | string    | Note ID            |

##### Responses

> | http code | content-type            | response                                             |
> |-----------|-------------------------|------------------------------------------------------|
> | `200`     | `application/json`      | `{ "id":"note_123", "title":"My Note", "content":"..." }` |
> | `404`     | `application/json`      | `{ "error": "Note not found" }`                      |


</details>

---

### Update Note

<details>
 <summary><code>PATCH</code> <code><b>/notes/{id}</b></code> <code>(Update note)</code></summary>

##### Parameters

> | name       | type     | data type | description             |
> |------------|----------|-----------|-------------------------|
> | `id`       | path     | string    | Note ID                 |
> | `title`    | body     | string    | Updated title           |
> | `content`  | body     | string    | Updated markdown        |

##### Responses

> | http code | content-type            | response                                |
> |-----------|-------------------------|-----------------------------------------|
> | `200`     | `application/json`      | `{ "message": "Note updated" }`         |
> | `403`     | `application/json`      | `{ "error": "Not owner of note" }`     |


</details>

---

### Delete Note

<details>
 <summary><code>DELETE</code> <code><b>/notes/{id}</b></code> <code>(Delete note)</code></summary>

##### Parameters

> | name  | type     | data type | description        |
> |-------|----------|-----------|--------------------|
> | `id`  | required | string    | Note ID            |

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

> | name          | type      | data type | description              |
> |---------------|-----------|-----------|---------------------------|
> | `visibility`  | required  | string    | `public` or `private`    |

##### Responses

> | http code | content-type            | response                         |
> |-----------|-------------------------|----------------------------------|
> | `200`     | `application/json`      | `{ "visibility": "public" }`     |

</details>

---

### Add Tags
<details>
 <summary><code>POST</code> <code><b>/notes/{id}/tags</b></code> <code>(Add tags)</code></summary>

##### Parameters

> | name    | type      | data type | description                     |
> |---------|-----------|-----------|---------------------------------|
> | `tags`  | required  | array     | e.g., ["XSS", "SQLi"]           |

##### Responses

> | http code | content-type            | response                              |
> |-----------|-------------------------|---------------------------------------|
> | `200`     | `application/json`      | `{ "tags": ["XSS","SQLi"] }`          |

</details>

---

### Remove Tag
<details>
 <summary><code>DELETE</code> <code><b>/notes/{id}/tags/{tag}</b></code> <code>(Remove tag)</code></summary>

##### Parameters

> | name | type | data type | description |
> |------|------|-----------|-------------|
> | `id` | path | string | Note ID |
> | `tag` | path | string | Tag to remove |

##### Responses

> | http code | content-type            | response             |
> |-----------|-------------------------|----------------------|
> | `204`     | `application/json`      | *No content*         |

</details>

------------------------------------------------------------------------------------------

## 🧠 AI Refine

<details>
 <summary><code>POST</code> <code><b>/notes/{id}/refine</b></code> <code>(Refine note content using AI)</code></summary>

##### Parameters

> None (uses existing content of the note)

##### Responses

> | http code | content-type            | response                                        |
> |-----------|-------------------------|-------------------------------------------------|
> | `200`     | `application/json`      | `{ "refinedContent": "# Improved Markdown..."}` |

</details>

------------------------------------------------------------------------------------------

## 👥 Team & Sharing

### Create Team
<details>
 <summary><code>POST</code> <code><b>/teams</b></code> <code>(Create a team)</code></summary>

##### Parameters

> | name   | type      | data type | description         |
> |--------|-----------|-----------|---------------------|
> | `name` | required  | string    | Team name           |

##### Responses

> | http code | content-type            | response                              |
> |-----------|-------------------------|---------------------------------------|
> | `201`     | `application/json`      | `{ "id": "team_123", "name": "Dev" }` |

##### Example cURL

> ```bash
> curl -X POST -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
> -d '{"name":"Dev Team"}' \
> https://api.example.com/teams
> ```

</details>

---

### Invite Member
<details>
 <summary><code>POST</code> <code><b>/teams/{id}/invite</b></code> <code>(Invite member by email)</code></summary>

##### Parameters

> | name     | type      | data type | description             |
> |----------|-----------|-----------|-------------------------|
> | `email`  | required  | string    | Email of invitee       |

##### Responses

> | http code | content-type            | response                                |
> |-----------|-------------------------|-----------------------------------------|
> | `200`     | `application/json`      | `{ "message": "Invitation sent" }`     |

##### Example cURL

> ```bash
> curl -X POST -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
> -d '{"email":"member@example.com"}' \
> https://api.example.com/teams/team_123/invite
> ```

</details>

---

### Share Note to Team
<details>
 <summary><code>POST</code> <code><b>/notes/{id}/share</b></code> <code>(Share note with a team)</code></summary>

##### Parameters

> | name       | type      | data type | description         |
> |------------|-----------|-----------|---------------------|
> | `teamId`   | required  | string    | Target team ID     |

##### Responses

> | http code | content-type            | response                                     |
> |-----------|-------------------------|----------------------------------------------|
> | `200`     | `application/json`      | `{ "message": "Note shared with team" }`    |

##### Example cURL

> ```bash
> curl -X POST -H "Authorization: Bearer <token>" -H "Content-Type: application/json" \
> -d '{"teamId":"team_123"}' \
> https://api.example.com/notes/note_123/share
> ```

</details>

------------------------------------------------------------------------------------------

## ❌ Error Responses

| Status | Content-Type             | Example                                           |
|--------|---------------------------|--------------------------------------------------|
| 400    | `application/json`       | `{ "error": "Bad Request" }`                     |
| 401    | `application/json`       | `{ "error": "Unauthorized" }`                    |
| 403    | `application/json`       | `{ "error": "Forbidden" }`                       |
| 404    | `application/json`       | `{ "error": "Not Found" }`                       |
| 500    | `application/json`       | `{ "error": "Internal Server Error" }`           |