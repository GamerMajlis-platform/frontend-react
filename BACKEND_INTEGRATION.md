# Backend Integration Methodology — GamerMajlis Frontend

This document describes how the frontend integrates with the backend API in this repository (frontend-react). It maps where network requests occur, how they are organized, how authentication tokens and session lifecycle are handled, the patterns used by services and context, and recommendations.

Paths referenced in this document are relative to the repository root. Key files:
- `src/lib/api.ts` — centralized API request wrapper (`apiFetch`) and helper `createFormData`
- `src/lib/security.ts` — token storage helpers (`SecureStorage`) and sanitizers
- `src/services/AuthService.ts` — authentication flows (login, logout, token handling)
- `src/services/SessionService.ts` — session lifecycle (validate token, token refresh timer, clear session, events)
- `src/services/ProfileService.ts` — example user-profile interactions and localStorage syncing
- `src/context/AppContext.tsx` — app-level state and wiring of session events to UI state
- `src/pages/Login.tsx`, `src/pages/AuthSuccess.tsx`, `src/pages/DiscordCallback.tsx` — examples of pages that interact with auth/session flows

Overview
--------

The app follows a layered approach:

- Network layer: `src/lib/api.ts` centralizes `fetch` usage through `apiFetch` and applies headers, token injection, Content-Type handling, dev-time logging, error handling and optional retry logic.
- Security/Storage: `src/lib/security.ts` provides `SecureStorage` to store the auth token using `sessionStorage` (with `localStorage` fallback) and exposes `setToken`, `getToken`, `removeToken`.
- Service layer: per-domain services (AuthService, ProfileService, TournamentService, etc.) call `apiFetch` to make requests and offer higher-level domain operations for components and context.
- Session management: `SessionService` orchestrates token validation, refresh timers, inactivity checks, and emits events (`session:logout`, `session:expired`) to which `AppContext` subscribes.
- UI / Context: `AppContext` consumes services to set `user`, `isAuthenticated`, initialize session and respond to session events. Pages/components call `useAppContext()` or service methods directly.

Where `fetch` happens and how it is used
--------------------------------------

All HTTP network calls are routed through `apiFetch` in `src/lib/api.ts`.

Key features of `apiFetch`:

- Base URL normalization via `VITE_API_BASE_URL` (falls back to `API_CONFIG.baseUrl`).
- Secure token injection — the wrapper reads token from `SecureStorage.getToken()` (and falls back to `localStorage.getItem(STORAGE_KEYS.auth)`). If present the token is added as an `Authorization: Bearer ...` header.
- Automatic content-type handling: if request body is `FormData` (or `useFormData` option is provided), `Content-Type` is not set manually (browser sets boundary). Otherwise `Content-Type: application/json` is set by default.
- Credentials: `credentials` default to `include` unless overridden in `options`.
- Debug logging in development for request/response and FormData payloads.
- Centralized response parsing and error handling delegated to `ErrorHandler.handleResponse` and `ErrorHandler.handleNetworkError` (see `src/lib/errors.ts`).
- Optional retry logic via `RetryHandler.retry(...)` if `retryOptions` provided.

Examples of service usage
-------------------------

AuthService example (login flow):

- `src/services/AuthService.ts` calls `apiFetch<LoginResponse>(API_ENDPOINTS.auth.login, ...)`.
- On successful login response the service calls `this.storeAuthData(data)` which:
  - writes the user object into `localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user))` and
  - calls `SessionService.storeToken(data.token)` which uses `SecureStorage.setToken(token)`.
- This decouples how token is stored from services that use it — they call `SessionService.getStoredToken()` or `AuthService.getStoredToken()` which, in turn, calls `SecureStorage.getToken()`.

AuthService (logout) flow:

- `AuthService.logout()` calls the backend logout endpoint (`POST API_ENDPOINTS.auth.logout`) via `apiFetch`.
- Regardless of backend result the service ensures local session cleanup by calling `SessionService.clearSession()` (which removes token and clears timers) and removing the stored user from `localStorage`.

Session lifecycle and events
---------------------------

`SessionService` (in `src/services/SessionService.ts`) manages session lifecycle:

- `initializeSession()` checks for stored token, validates it (via `validateToken()` which calls `apiFetch(API_ENDPOINTS.auth.validateToken)`), and starts a periodic token validation timer (`startTokenRefreshTimer`) and activity monitoring timer (`startActivityMonitoring`) if valid.
- `startTokenRefreshTimer()` periodically runs `validateToken()` and dispatches `session:expired` when token is invalid.
- `startActivityMonitoring()` records `lastActivity` and dispatches `session:expired` when inactivity timeout exceeded.
- `logout()` calls the backend logout endpoint then calls `clearSession()` and dispatches `session:logout`.
- `clearSession()` must remove the stored token and stored user, stop timers, and purge activity markers.

Wiring into the UI
-------------------

- `AppContext` sets up listeners: `SessionService.onSessionExpired(...)` and `SessionService.onLogout(...)` and maps these events to local state changes (`setUser(null)`, `setIsAuthenticated(false)`).
- After login, components/pages usually call `login(...)` exposed by `AppContext` or call `AuthService.login(...)` directly. `AppContext.login` uses `AuthService.login`, then sets `user` and `isAuthenticated` and starts `SessionService.startTokenRefreshTimer()`.
- Pages use React Router's `navigate(...)` for redirects (see `src/pages/Login.tsx`, `src/pages/AuthSuccess.tsx`, `src/pages/DiscordCallback.tsx`). OAuth callback pages store token via `SecureStorage.setToken` then call `refreshProfile()` to obtain and populate the user in the app state.

Patterns and practices used (catalog)
------------------------------------

1) Single API wrapper (`apiFetch`) — good

- Pros:
  - Single place to inject auth headers, add default headers, handle JSON vs FormData, log requests, and centralize error handling.
  - Easier to add telemetry, retries, timeouts or change base URL in future.
- Cons / watchouts:
  - Services must not reimplement low-level fetch logic; they should use `apiFetch` consistently.

2) Secure token abstraction (`SecureStorage`) — good idea

- Pros:
  - Keeps the token storage strategy centralized and easier to change (sessionStorage first, localStorage fallback).
  - Provides explicit `setToken`/`getToken`/`removeToken` operations.
- Caveats:
  - Beware mixing legacy storage keys (`STORAGE_KEYS.auth`) and `SecureStorage` key: both need to be cleared on logout to avoid stale auth state.

3) Session service with events (`SessionService`) — generally good

- Pros:
  - Centralizes token validation, expiration, inactivity detection, and event dispatching.
  - Makes it straightforward for UI to subscribe to `session:expired` / `session:logout`.
- Caveats:
  - Make sure `clearSession()` removes every place token or user might be stored (we updated it accordingly). Missing one key causes stale authenticated state.
  - Be careful with `sessionStorage` vs `localStorage` (tab-scoped vs persistent) when choosing UX behaviour.

4) Service-per-domain pattern (AuthService, ProfileService, etc.) — good modularization

- Pros:
  - Clear separation of domain logic; services encapsulate API endpoint paths and mapping server responses to domain models.
- Caveats:
  - Ensure services do not duplicate token handling or localStorage-side effects — prefer a single obvious place to store token/user.

5) AppContext for global state — typical and useful

- Pros:
  - Central place for `user`, `isAuthenticated`, wishlist and settings. Keeps components thin.
- Caveats:
  - Avoid putting heavy logic into context — prefer services for network interactions and keep context as state-and-wiring.

6) Error handling / RetryHandler

- `apiFetch` defers to `ErrorHandler` for response parsing and `RetryHandler` for retries. This is a good separation of concerns.

Detailed AuthService example (illustrated flow)
---------------------------------------------

Flow: form login on `/login` -> `AppContext.login` -> `AuthService.login` -> backend -> token + user stored -> UI updated.

1. UI `Login` page collects credentials and calls `await login(identifier, password)` from `useAppContext()`.
2. `AppContext.login` calls `AuthService.login(identifier, password)`.
3. `AuthService.login` calls `apiFetch<LoginResponse>(API_ENDPOINTS.auth.login, { method: 'POST', body: formData, useFormData: true })`.
4. If success and `data.token` and `data.user` exist, `AuthService.storeAuthData` stores the user in `localStorage` and calls `SessionService.storeToken(data.token)`.
5. `SessionService.storeToken` calls `SecureStorage.setToken(token)` which writes to `sessionStorage` (or `localStorage` fallback).
6. `AppContext.login` receives response and sets `user` and `isAuthenticated = true`, and starts `SessionService.startTokenRefreshTimer()`.
7. UI navigates using React Router; subsequent `apiFetch` calls will include token retrieved from `SecureStorage.getToken()`.

Important implementation details to check/keep consistent
------------------------------------------------------

- Always use `apiFetch` for backend calls — don't call `fetch` directly in services/components.
- Ensure `clearSession()` removes the token via `SecureStorage.removeToken()` and removes the `STORAGE_KEYS.user` localStorage key; otherwise `AuthService.isAuthenticated()` may return true even after logout.
- When adding retries, keep idempotency in mind (POSTs that modify server state should not be retried blindly).
- For forms and file uploads use `useFormData: true` or pass a `FormData` and rely on `apiFetch` not setting Content-Type header.
- For OAuth flows (e.g., Discord) confirm the backend supplies a `return` or `returnUrl` param and that the callback pages use `navigate(returnUrl)` rather than hard-coded routes.

Good practices already present
----------------------------

- Centralized API wrapper (`apiFetch`) with token injection and retry support
- Centralized error handling in `ErrorHandler` and retry strategy in `RetryHandler`
- Separate session management via `SessionService` with events
- Domain services (AuthService, ProfileService) encapsulate API details

Risks / Potential issues (and how to fix)
----------------------------------------

- Mixed storage keys: some code may still check `STORAGE_KEYS.auth` while `SecureStorage` uses a different key (`gamerMajlis_secure_token`). Ensure `clearSession()` and logout clear both keys and that `AuthService.getStoredToken()` delegates to `SessionService.getStoredToken()`.
- sessionStorage vs localStorage: `sessionStorage` is tab-scoped. If your intended UX requires cross-tab sign-out or persistence across tab reloads, pick storage accordingly and document the decision.
- Direct `window.location.href` navigation: prefer React Router `navigate(...)` from components to preserve SPA navigation and history; only use `location.href` for hard full-page redirects when necessary.
- Retry semantics: ensure non-idempotent endpoints (POST/DELETE) are not retried unless safe to do so or guarded by idempotency keys.

How to add a new backend call (example: PostsService.createPost)
-------------------------------------------------------------

1. Add endpoint path in `src/config/constants.ts` under `API_ENDPOINTS`.
2. Create `src/services/PostService.ts` (or add method to existing PostService):

```ts
import { apiFetch, createFormData } from '../lib/api';
import { API_ENDPOINTS } from '../config/constants';

export default class PostService {
  static async createPost(data: { title: string; body: string; image?: File }) {
    const form = createFormData({ title: data.title, body: data.body });
    if (data.image) form.append('image', data.image);
    return await apiFetch(API_ENDPOINTS.posts.create, {
      method: 'POST',
      body: form,
      useFormData: true,
    });
  }
}
```

3. Call this service from components or context; do not call `fetch` directly.

Testing and verification
------------------------

- Manual tests:
  - Login -> ensure token saved to sessionStorage (and `localStorage[STORAGE_KEYS.user]` set)
  - Logout -> ensure token removed from `sessionStorage` and `localStorage[STORAGE_KEYS.user]` removed; check that protected routes redirect to `/`.
  - OAuth -> ensure `AuthSuccess`/`DiscordCallback` read `token` or `return` parameters and navigate appropriately.

- Automated tests: create unit tests for `apiFetch` error cases, for `SessionService` timers, and for `AuthService` store/clear logic. Mock `fetch` and `sessionStorage`.

Recommended next steps / improvements
-----------------------------------

1. Add unit tests for `apiFetch`, `SessionService.clearSession`, and `AuthService.storeAuthData` to prevent regressions.
2. Add a central navigation handler for `session:logout` in `AppContent` that calls `navigate('/')` so all logout events route consistently inside React Router.
3. Consider moving user profile persistence into `SessionService` or a small `UserStorage` utility so token+user clear is an atomic operation.
4. Document storage decisions (why `sessionStorage` vs `localStorage`) in this file.
5. When adding retries, add idempotency awareness and a safe default of no retries for non-idempotent requests.

Appendix — Quick file references
--------------------------------

- API wrapper: `src/lib/api.ts`
- Token storage & sanitizers: `src/lib/security.ts`
- Error & retry handlers: `src/lib/errors.ts` and any `RetryHandler` implementation
- Auth: `src/services/AuthService.ts`
- Session lifecycle: `src/services/SessionService.ts`
- Profile: `src/services/ProfileService.ts`
- App wiring: `src/context/AppContext.tsx`
- Login page example: `src/pages/Login.tsx`

If you want, I can also:

- Add the central `session:logout` -> `navigate('/')` listener inside `AppContent` so logout always uses React Router navigation (recommended if you prefer SPA navigation over full reloads).
- Add a short unit test suite skeleton for `apiFetch` and `SessionService.clearSession`.

---
Document generated on: 2025-09-24
