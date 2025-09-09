## Backend integration notes — Frontend ⇄ Backend (focus)

This document explains how the frontend should integrate with the `backend/` in this repo for authentication (signup, login), the database configuration used by the backend, and the API surfaces you can call. It assumes the backend is run locally (default config) and that the frontend runs on its dev server (Vite).

Summary of what I inspected
- Location: `backend/src/main/resources/application.properties`
- Key findings:
  - Database: PostgreSQL (jdbc:postgresql://localhost:5432/gamermajilis_db)
  - JPA / Hibernate: `spring.jpa.hibernate.ddl-auto=update` (auto-migrate)
  - Server: port `8080`, context-path `/api` (so base API = `http://localhost:8080/api`)
  - JWT config present: `jwt.secret` and `jwt.expiration` in properties
  - OAuth2 (Discord) client properties exist (client-id, client-secret, scopes, redirect-uri)
  - `User` model exists in `backend/src/main/java/com/gamermajilis/model/User.java` with fields for email, password, displayName, discordId, roles, verification token, etc.
  - I could not find auth controllers/services (no `AuthController`, `UserRepository`, or JWT utilities) in the backend codebase. That means the backend either expects auth to be implemented separately or the auth endpoints aren't committed here.

Implication
- The backend holds the data model and configuration but currently lacks visible controller/service code for login/signup and token issuance. The frontend should expect these endpoints to exist at the paths below; if they do not, either the backend must be extended with the endpoints or you should use the alternate auth service that this team uses.

Backend configuration you should know (defaults found)
- Database (Postgres):
  - URL: `jdbc:postgresql://localhost:5432/gamermajilis_db`
  - Username: `postgres`
  - Password: `password`
  - Driver: `org.postgresql.Driver`
  - DDL-auto: `update` (creates/updates schema automatically on startup)
- Server: `http://localhost:8080` and API base path: `/api` → API base = `http://localhost:8080/api`
- JWT: `jwt.secret` and `jwt.expiration` exist. Override `jwt.secret` via environment variable or properties for production.
- OAuth (Discord): set `DISCORD_CLIENT_ID` and `DISCORD_CLIENT_SECRET` environment variables to enable Discord login from the frontend.
- Email: SMTP placeholders are set; configure `EMAIL_USERNAME` and `EMAIL_PASSWORD` env vars for verification emails.

Recommended / expected Auth API (frontend-friendly contract)
> Note: these endpoints are proposed defaults the frontend should call. If the backend already exposes different paths/names, adapt accordingly.

- POST /api/auth/register
  - Request JSON: { "email": string, "password": string, "displayName": string }
  - Success Response (201): { "user": { "id": number, "email": string, "displayName": string }, "message": "verification_sent" }
  - Alternative (if backend returns token): { "token": "<jwt>", "user": {...} }
  - Notes: send plain JSON. Passwords must be hashed server-side (bcrypt recommended). If email verification is used, registration may return a 201 with verification required.

- POST /api/auth/login
  - Request JSON: { "email": string, "password": string }
  - Success Response (200): { "token": "<jwt>", "user": { "id", "email", "displayName", ... } }
  - Failure: 401 unauthorized

- GET /api/auth/me
  - Request: Authorization header `Bearer <jwt>`
  - Response (200): { "user": { ... } }

- POST /api/auth/logout  (optional)
  - May be implemented server-side or handled client-side by deleting tokens.

- OAuth2 (Discord) — frontend flow
  - To begin OAuth2 with Discord, redirect the browser to the backend OAuth entrypoint. With Spring Boot OAuth2 auto-config, the typical authorization URL is:
    - GET `/oauth2/authorization/discord` (no JSON; browser redirect)
  - The backend properties set the OAuth redirect URI template to `{baseUrl}/login/oauth2/code/{registrationId}`. Configure `baseUrl` either via properties or ensure the backend knows the correct application base.
  - After OAuth completes, the backend should create or fetch a `User` and typically issue a JWT or set a cookie. The frontend should handle the redirect response and store the token (if returned) or call `/api/auth/me` to fetch session info.

Environment variables the frontend/deploy needs to coordinate with backend
- DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET
- EMAIL_USERNAME, EMAIL_PASSWORD
- Optionally override DB settings: SPRING_DATASOURCE_URL, SPRING_DATASOURCE_USERNAME, SPRING_DATASOURCE_PASSWORD
- jwt.secret (do not use the default in production)

Frontend integration examples (recommended patterns)
- Storage and auth header
  - On successful login/register (if you get a JWT token), store it securely: `localStorage.setItem('gm_token', token)` or better `sessionStorage` if appropriate.
  - For API calls attach header: `Authorization: Bearer <token>`

- Example: login (fetch)
  ```js
  const res = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (res.ok) {
    localStorage.setItem('gm_token', data.token);
  }
  ```

- Example: call protected endpoint
  ```js
  const token = localStorage.getItem('gm_token');
  const res = await fetch('http://localhost:8080/api/some/protected', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  ```

CORS and development notes
- The backend must allow CORS from your front-end origin (e.g., `http://localhost:5173` or `http://localhost:3000`). If not already configured, add a Spring `CorsConfiguration` or annotate controllers with `@CrossOrigin(origins = "http://localhost:5173")`.
- Cookies vs tokens: the backend currently shows `jwt.secret` usage; JWT bearer tokens are simplest for SPA integration. If cookies/sessions are used, the frontend must use `fetch(..., { credentials: 'include' })` and the backend must set SameSite/CORS appropriately.

Security recommendations
- Never store plain-text passwords — server must hash with bcrypt/argon2.
- Do not embed `jwt.secret` in repos — override in production via env vars.
- Limit token lifetime or use refresh tokens.

If auth endpoints are missing in backend (next steps for backend team)
1. Implement `UserRepository` (extends JpaRepository<User, Long>) and `UserService` to manage users and password hashing.
2. Implement `AuthController` with `/api/auth/register`, `/api/auth/login`, `/api/auth/me` and JWT generation using `jwt.secret`.
3. Add a `WebSecurityConfigurer` to permit `/api/auth/**` and protect other endpoints; add CORS config for frontend origins.

Minimal example server-side snippets (for backend devs)
- UserRepository:
  ```java
  public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
  }
  ```
- Register/login endpoints (sketch):
  ```java
  @RestController
  @RequestMapping("/api/auth")
  public class AuthController {
    @PostMapping("/register") public ResponseEntity<?> register(@RequestBody RegisterDto dto) { ... }
    @PostMapping("/login") public ResponseEntity<?> login(@RequestBody LoginDto dto) { ... }
  }
  ```

What I changed
- Added this file `frontEnd/backend_integration.md` with the backend analysis and a concrete frontend integration guide.

Status checklist (your request)
- Focus only on `frontEnd/` and `backend/` folders — Done (document focuses on those two)
- Analyze backend folder for auth, DB and configs — Done (found application.properties and User model; no controllers found)
- Add `backend_integration.md` in `frontEnd` explaining login/signup, DB/config, and APIs — Done

If you want, next I can:
- Add concrete example endpoints to the backend (controller + service + tests) so the frontend can call them immediately, or
- Add a small auth helper in the frontend repo that wraps calls to `/api/auth` and stores tokens.

If you want either, tell me which and I will implement the next piece.
