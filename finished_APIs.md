# Finished APIs (implemented)

Date: 2025-09-22

This document lists the API endpoints from `APIs_guide.md` that were implemented / integrated into the frontend codebase, the API number from the guide, the endpoint path, and short notes about where and how each is implemented.

Base URL (backend): `http://localhost:8080/api`

---

## Media Management APIs

- **#16 — Upload Media**

  - Endpoint: `POST /api/media/upload` (multipart/form-data)
  - Implemented in: `src/services/MediaService.ts` → `uploadMedia(request: MediaUploadRequest)`
  - Wired in UI: `src/components/media/MediaUpload.tsx` — full upload form with title, description, tags, game category, and visibility settings
  - Home Integration: Available in authenticated home page "Create Content" tab

- **#17 — Get Media Details**

  - Endpoint: `GET /api/media/{mediaId}`
  - Implemented in: `src/services/MediaService.ts` → `getMedia(mediaId: number)`
  - Wired in UI: Used by `MediaPreview` component for detailed media display

- **#18 — Get Media List**

  - Endpoint: `GET /api/media?page=...&size=...&category=...&type=...&visibility=...&myMedia=...`
  - Implemented in: `src/services/MediaService.ts` → `getMediaList(filters: MediaFilters)`
  - Wired in UI: `src/components/media/MediaGallery.tsx` — paginated gallery with filtering
  - Home Integration: Available in authenticated home page "Media Gallery" tab

- **#19 — Update Media**

  - Endpoint: `PUT /api/media/{mediaId}` (multipart/form-data)
  - Implemented in: `src/services/MediaService.ts` → `updateMedia(mediaId: number, request: MediaUpdateRequest)`
  - UI: Service ready, edit UI can be added to media components

- **#20 — Delete Media**

  - Endpoint: `DELETE /api/media/{mediaId}`
  - Implemented in: `src/services/MediaService.ts` → `deleteMedia(mediaId: number)`
  - UI: Service ready, delete functionality can be added to media components

- **#21 — Increment Media View Count**

  - Endpoint: `POST /api/media/{mediaId}/view`
  - Implemented in: `src/services/MediaService.ts` → `incrementViewCount(mediaId: number)`
  - Wired in UI: `src/components/media/MediaPreview.tsx` — auto-triggered on video play or image click

- **#22 — Search Media**

  - Endpoint: `GET /api/media/search?query=...&page=...&size=...&type=...`
  - Implemented in: `src/services/MediaService.ts` → `searchMedia(filters: MediaSearchFilters)`
  - UI: Service ready, search UI can be integrated

- **#23 — Get Trending Media**
  - Endpoint: `GET /api/media/trending?limit=...&days=...`
  - Implemented in: `src/services/MediaService.ts` → `getTrendingMedia(filters: TrendingMediaFilters)`
  - UI: Service ready, trending section can be added

## Post Management APIs

- **#24 — Create Post**

  - Endpoint: `POST /api/posts` (form-data)
  - Implemented in: `src/services/PostService.ts` → `createPost(request: PostCreateRequest)`
  - Wired in UI: `src/components/posts/CreatePost.tsx` — comprehensive post creation form with gaming details, tags, hashtags, and media attachment support
  - Home Integration: Available in authenticated home page "Create Content" tab

- **#25 — Get Post Details**

  - Endpoint: `GET /api/posts/{postId}`
  - Implemented in: `src/services/PostService.ts` → `getPost(postId: number)`
  - UI: Service ready, detailed post view can be implemented

- **#26 — Get Posts Feed**

  - Endpoint: `GET /api/posts?page=...&size=...&gameCategory=...&type=...&myPosts=...`
  - Implemented in: `src/services/PostService.ts` → `getPostsFeed(filters: PostFilters)`
  - Wired in UI: `src/components/posts/PostFeed.tsx` — paginated feed with loading states, error handling, and engagement features
  - Home Integration: Primary content in authenticated home page "Community Posts" tab

- **#27 — Update Post**

  - Endpoint: `PUT /api/posts/{postId}` (form-data)
  - Implemented in: `src/services/PostService.ts` → `updatePost(postId: number, request: PostUpdateRequest)`
  - UI: Service ready, edit functionality can be added to post components

- **#28 — Delete Post**

  - Endpoint: `DELETE /api/posts/{postId}`
  - Implemented in: `src/services/PostService.ts` → `deletePost(postId: number)`
  - Wired in UI: `src/components/posts/PostCard.tsx` — delete option in post menu with confirmation

- **#29 — Like/Unlike Post**

  - Endpoint: `POST /api/posts/{postId}/like`
  - Implemented in: `src/services/PostService.ts` → `toggleLike(postId: number)`
  - Wired in UI: `src/components/posts/PostCard.tsx` — heart button with like count and visual feedback

- **#30 — Add Comment to Post**

  - Endpoint: `POST /api/posts/{postId}/comments` (form-data)
  - Implemented in: `src/services/PostService.ts` → `addComment(postId: number, request: CommentCreateRequest)`
  - UI: Service ready, comment form can be added

- **#31 — Get Post Comments**

  - Endpoint: `GET /api/posts/{postId}/comments?page=...&size=...`
  - Implemented in: `src/services/PostService.ts` → `getComments(postId: number, filters: CommentFilters)`
  - UI: Service ready, comment display can be implemented

- **#32 — Delete Comment**

  - Endpoint: `DELETE /api/posts/comments/{commentId}`
  - Implemented in: `src/services/PostService.ts` → `deleteComment(commentId: number)`
  - UI: Service ready, comment management can be added

- **#33 — Share Post**

  - Endpoint: `POST /api/posts/{postId}/share`
  - Implemented in: `src/services/PostService.ts` → `sharePost(postId: number)`
  - Wired in UI: `src/components/posts/PostCard.tsx` — share button in engagement bar

- **#34 — Get Trending Posts**

  - Endpoint: `GET /api/posts/trending?limit=...&days=...`
  - Implemented in: `src/services/PostService.ts` → `getTrendingPosts(filters: TrendingPostFilters)`
  - UI: Service ready, trending posts section can be added

- **#35 — Search Posts**
  - Endpoint: `GET /api/posts/search?query=...&page=...&size=...&gameCategory=...`
  - Implemented in: `src/services/PostService.ts` → `searchPosts(filters: PostSearchFilters)`
  - UI: Service ready, search functionality can be integrated

## Marketplace / Products

- **#47 — Create Product Listing**

  - Endpoint: `POST /api/products` (multipart/form-data)
  - Implemented in: `src/services/ProductService.ts` → `createProduct(formData: FormData)`
  - Wired in UI: `src/pages/Marketplace.tsx` — minimal `CreateProductForm` posts a `FormData` and refreshes the product list.

- **#48 — Upload Product Images**

  - Endpoint: `POST /api/products/{productId}/images` (multipart/form-data)
  - Implemented in: `src/services/ProductService.ts` → `uploadProductImages(productId, files)`
  - UI: upload helper exists in service; multi-image UI is intentionally small/placeholder (image upload UX can be expanded).

- **#49 — Get Product Details**

  - Endpoint: `GET /api/products/{productId}`
  - Implemented in: `src/services/ProductService.ts` → `getProduct(productId)`
  - Wired in UI: available to pages/components that need product detail (service ready).

- **#50 — Get Products List**

  - Endpoint: `GET /api/products?page=...&size=...`
  - Implemented in: `src/services/ProductService.ts` → `listProducts(query)`
  - Wired in UI: `src/pages/Marketplace.tsx` — uses `listProducts` to display marketplace cards and seeds local wishlist flags.

- **#51 — Update Product**

  - Endpoint: `PUT /api/products/{productId}` (form-data)
  - Implemented in: `src/services/ProductService.ts` → `updateProduct(productId, data)`
  - UI: service available; full edit form UI is TBD.

- **#52 — Delete Product**

  - Endpoint: `DELETE /api/products/{productId}`
  - Implemented in: `src/services/ProductService.ts` → `deleteProduct(productId)`
  - UI: service available; delete confirmation UI is TBD.

- **#55 — Toggle Product Wishlist**

  - Endpoint: `POST /api/products/{productId}/wishlist` (no body)
  - Implemented in: `src/services/ProductService.ts` → `toggleWishlist(productId)`
  - Wired in UI: `src/context/AppContext.tsx` → `toggleWishlist` calls the service (updates local wishlist state and posts to backend); `src/components/shared/Card.tsx` uses `useAppContext().toggleWishlist()`.

- **#57, #58, #59, #56 (Search/Categories/Featured/View)**
  - Endpoints implemented in `src/services/ProductService.ts` as helper methods where appropriate (e.g., `searchProducts`, `getCategories`, `getFeatured`, `recordView`). These are available for wiring into UI as needed.

## Events

- **#36 — Create Event**

  - Endpoint: `POST /api/events` (form-data)
  - Implemented in: `src/services/EventService.ts` → `createEvent(formData)`
  - Wired in UI: `src/components/events/CreateEventForm.tsx` — comprehensive event creation form with validation, accessibility, and file upload support. Integrated into `src/pages/Events.tsx` with modal display.

- **#37 — Get Event Details**

  - Endpoint: `GET /api/events/{eventId}`
  - Implemented in: `src/services/EventService.ts` → `getEvent(eventId)`
  - UI: service ready for event detail pages and modals.

- **#38 — Get Events List**

  - Endpoint: `GET /api/events?page=...&size=...&category=...&status=...&search=...`
  - Implemented in: `src/services/EventService.ts` → `listEvents(filters)`
  - Wired in UI: `src/pages/Events.tsx` — complete event listing with search, filtering by category/status, sorting, and pagination. Uses `src/components/events/EventGrid.tsx` for responsive display.

- **#39 — Update Event**

  - Endpoint: `PUT /api/events/{eventId}` (form-data)
  - Implemented in: `src/services/EventService.ts` → `updateEvent(eventId, formData)`
  - UI: service ready; edit functionality can be added to event forms.

- **#40 — Delete Event**

  - Endpoint: `DELETE /api/events/{eventId}`
  - Implemented in: `src/services/EventService.ts` → `deleteEvent(eventId)`
  - UI: service ready; delete confirmation can be added to event management.

- **#41 — Register for Event**

  - Endpoint: `POST /api/events/{eventId}/register`
  - Implemented in: `src/services/EventService.ts` → `registerForEvent(eventId)`
  - Wired in UI: `src/context/AppContext.tsx` → `registerForEvent` function calls service and updates local state. Event cards show registration status and allow registration/unregistration.

- **#42 — Unregister from Event**

  - Endpoint: `DELETE /api/events/{eventId}/register`
  - Implemented in: `src/services/EventService.ts` → `unregisterFromEvent(eventId)`
  - Wired in UI: `src/context/AppContext.tsx` → `unregisterFromEvent` function integrated with registration state management.

- **#43 — Get Event Attendees**

  - Endpoint: `GET /api/events/{eventId}/attendees`
  - Implemented in: `src/services/EventService.ts` → `getEventAttendees(eventId)`
  - UI: service ready for attendee management features.

- **#44 — Check-in Event Attendee**

  - Endpoint: `POST /api/events/{eventId}/checkin`
  - Implemented in: `src/services/EventService.ts` → `checkInAttendee(eventId, attendeeId)`
  - UI: service ready for event check-in functionality.

- **#45 — Search Events**

  - Endpoint: `GET /api/events/search?q=...&location=...&dateFrom=...&dateTo=...`
  - Implemented in: `src/services/EventService.ts` → `searchEvents(query)`
  - Wired in UI: `src/pages/Events.tsx` — real-time search with debouncing (300ms), supports text search and advanced filtering.

- **#46 — Get Trending Events**

  - Endpoint: `GET /api/events/trending?limit=...`
  - Implemented in: `src/services/EventService.ts` → `getTrendingEvents(limit)`
  - UI: service ready for trending events sections and recommendations.

## Tournaments

- **#74 — Create Tournament**

  - Endpoint: `POST /api/tournaments` (JSON body)
  - Implemented in: `src/services/TournamentService.ts` → `createTournament(payload)`
  - UI: service exists; tournament create UI is pending (suggested `src/pages/Tournaments.tsx`).

- **#75 — Get Tournament Details**

  - Endpoint: `GET /api/tournaments/{id}`
  - Implemented in: `src/services/TournamentService.ts` → `getTournament(id)`

- **#76 — Update Tournament**

  - Endpoint: `PUT /api/tournaments/{id}`
  - Implemented in: `src/services/TournamentService.ts` → `updateTournament(id, payload)`

- **#77 — Delete Tournament**

  - Endpoint: `DELETE /api/tournaments/{id}`
  - Implemented in: `src/services/TournamentService.ts` → `deleteTournament(id)`

- **#78, #79, #80, #81**
  - Additional tournament endpoints (list, by-organizer, add moderator, increment view) are available and the service provides helper methods for them.

## Profile / Auth (partial integration)

- **#8 — Get My Profile**

  - Endpoint: `GET /api/profile/me`
  - Implemented in: `src/services/ProfileService.ts` → `getMyProfile()` (existing service)
  - Wired in App: `src/context/AppContext.tsx` — session initialization calls `ProfileService.getMyProfile()` to refresh optimistic user data and merges JSON fields like `privacySettings` and `gamingPreferences` into local settings.

## Discord Authentication APIs

- **#88 — Initiate Discord OAuth**

  - Endpoint: `GET /api/auth/discord/login` (302 redirect to Discord)
  - Implemented in: `src/services/DiscordService.ts` → `initiateOAuth(returnUrl?: string)`
  - Wired in UI: `src/components/discord/DiscordLoginButton.tsx` — available in Login and Signup pages
  - Integration: OAuth flow with state management and CSRF protection

- **#89 — Discord OAuth Callback**

  - Endpoint: `GET /api/auth/discord/callback?code=...&state=...`
  - Implemented in: `src/services/DiscordService.ts` → `handleOAuthCallback(code: string, state: string)`
  - Wired in UI: `src/pages/DiscordCallback.tsx` — dedicated callback page with success/error handling
  - Route: Available at `/auth/discord/callback` path

- **#90 — Link Discord Account**

  - Endpoint: `POST /api/auth/discord/link` (form-data)
  - Implemented in: `src/services/DiscordService.ts` → `linkAccount(code: string)`
  - Wired in UI: `src/components/discord/DiscordLinkButton.tsx` — integrated in Settings page
  - Usage: Links Discord account to existing authenticated user

- **#91 — Unlink Discord Account**

  - Endpoint: `POST /api/auth/discord/unlink`
  - Implemented in: `src/services/DiscordService.ts` → `unlinkAccount()`
  - Wired in UI: `src/components/discord/DiscordLinkButton.tsx` and `DiscordUserInfo.tsx`
  - Integration: Available in Settings page for account management

- **#92 — Get Discord User Info**

  - Endpoint: `GET /api/auth/discord/user-info`
  - Implemented in: `src/services/DiscordService.ts` → `getUserInfo()`
  - Wired in UI: `src/components/discord/DiscordUserInfo.tsx` — displays linked Discord account details
  - Usage: Shows Discord username, avatar, email, and linking date

- **#93 — Refresh Discord Token**

  - Endpoint: `POST /api/auth/discord/refresh`
  - Implemented in: `src/services/DiscordService.ts` → `refreshToken()`
  - UI: Service ready for automatic token refresh management

---

## Chat System APIs

- **#60 — Create Chat Room**

  - Endpoint: `POST /api/chat/rooms` (multipart/form-data)
  - Implemented in: `src/services/ChatService.ts` → `createRoom(data: CreateChatRoomData)`
  - Wired in UI: `src/components/chat/CreateRoomModal.tsx` — full room creation modal with settings
  - Features: Room name, description, privacy settings, member limits, game association

- **#61 — Get User Chat Rooms**

  - Endpoint: `GET /api/chat/rooms?page=...&size=...`
  - Implemented in: `src/services/ChatService.ts` → `getUserRooms(params: ChatRoomsParams)`
  - Wired in UI: `src/components/chat/ChatRoomList.tsx` — paginated room list with last activity
  - Features: Room preview with member count, last message, game tags

- **#62 — Get Chat Room Details**

  - Endpoint: `GET /api/chat/rooms/{roomId}`
  - Implemented in: `src/services/ChatService.ts` → `getRoomDetails(roomId: number)`
  - Wired in UI: `src/components/chat/ChatRoom.tsx` — detailed room view with members
  - Usage: Loads full room info including member list and permissions

- **#63 — Join Chat Room**

  - Endpoint: `POST /api/chat/rooms/{roomId}/join`
  - Implemented in: `src/services/ChatService.ts` → `joinRoom(roomId: number)`
  - UI: Service ready for room joining functionality

- **#64 — Leave Chat Room**

  - Endpoint: `POST /api/chat/rooms/{roomId}/leave`
  - Implemented in: `src/services/ChatService.ts` → `leaveRoom(roomId: number)`
  - UI: Service ready for room leaving functionality

- **#65 — Send Message**

  - Endpoint: `POST /api/chat/rooms/{roomId}/messages` (multipart/form-data)
  - Implemented in: `src/services/ChatService.ts` → `sendMessage(roomId: number, data: SendMessageData)`
  - Wired in UI: `src/components/chat/MessageInput.tsx` — rich message composer with file attachments
  - Features: Text messages, file uploads (images/videos/documents), reply to messages

- **#66 — Get Chat Messages**

  - Endpoint: `GET /api/chat/rooms/{roomId}/messages?page=...&size=...&beforeMessageId=...&afterMessageId=...`
  - Implemented in: `src/services/ChatService.ts` → `getMessages(roomId: number, params: ChatMessagesParams)`
  - Wired in UI: `src/components/chat/MessageList.tsx` — infinite scroll message history
  - Features: Pagination, message grouping by date, load more on scroll

- **#67 — Delete Message**

  - Endpoint: `DELETE /api/chat/messages/{messageId}`
  - Implemented in: `src/services/ChatService.ts` → `deleteMessage(messageId: number)`
  - Wired in UI: `src/components/chat/MessageBubble.tsx` — delete button for own/moderated messages
  - Usage: Message deletion with permission checks (sender or moderator)

- **#68 — Add Chat Room Member**

  - Endpoint: `POST /api/chat/rooms/{roomId}/members/{memberId}` (form-data)
  - Implemented in: `src/services/ChatService.ts` → `addMember(roomId: number, memberId: number, data: AddMemberData)`
  - Wired in UI: `src/components/chat/InviteMemberModal.tsx` — invite users with role selection
  - Features: Add members with MEMBER or MODERATOR roles

- **#69 — Remove Chat Room Member**

  - Endpoint: `DELETE /api/chat/rooms/{roomId}/members/{memberId}`
  - Implemented in: `src/services/ChatService.ts` → `removeMember(roomId: number, memberId: number)`
  - Wired in UI: `src/components/chat/MemberList.tsx` — remove member button for moderators
  - Usage: Member removal with permission checks

- **#70 — Get Chat Room Members**

  - Endpoint: `GET /api/chat/rooms/{roomId}/members?page=...&size=...`
  - Implemented in: `src/services/ChatService.ts` → `getMembers(roomId: number, params: ChatMembersParams)`
  - Wired in UI: `src/components/chat/MemberList.tsx` — comprehensive member list with status
  - Features: Online status, roles, join dates, member management

- **#71 — Start Direct Message**

  - Endpoint: `POST /api/chat/direct` (form-data)
  - Implemented in: `src/services/ChatService.ts` → `startDirectMessage(data: StartDirectMessageData)`
  - Wired in UI: `src/components/chat/OnlineUsersList.tsx` — start DM from online users
  - Usage: Create direct message conversations between users

- **#72 — Get Online Users**

  - Endpoint: `GET /api/chat/online-users`
  - Implemented in: `src/services/ChatService.ts` → `getOnlineUsers()`
  - Wired in UI: `src/components/chat/OnlineUsersList.tsx` — real-time online user list
  - Features: User status (online/away/busy/in-game), current game info

- **#73 — Send Typing Indicator**

  - Endpoint: `POST /api/chat/typing` (form-data)
  - Implemented in: `src/services/ChatService.ts` → `sendTypingIndicator(roomId: number, isTyping: boolean)`
  - Wired in UI: `src/components/chat/MessageInput.tsx` and `TypingIndicator.tsx`
  - Features: Real-time typing indicators with animated display

## Discord OAuth APIs

- **#88 — Initiate Discord OAuth**

  - Endpoint: `GET /api/auth/discord/login`
  - Implemented in: `src/services/DiscordService.ts` → `initiateOAuth(returnUrl?: string)`
  - Wired in UI: `src/components/discord/DiscordLoginButton.tsx` — OAuth login integration
  - Usage: Redirects to backend OAuth endpoint which handles Discord OAuth flow

- **#89 — Discord OAuth Callback**

  - Endpoint: `GET /api/auth/discord/callback?code=...&state=...`
  - Implemented in: `src/services/DiscordService.ts` → `handleOAuthCallback(code: string, state: string)`
  - Wired in UI: `src/pages/DiscordCallback.tsx` — handles OAuth callback processing
  - Features: State verification, JWT token handling, user session creation

- **#90 — Link Discord Account**

  - Endpoint: `POST /api/auth/discord/link` (form-data)
  - Implemented in: `src/services/DiscordService.ts` → `linkAccount(code: string)`
  - Wired in UI: `src/components/discord/DiscordLinkButton.tsx` — account linking in settings
  - Usage: Links Discord account to existing user account

- **#91 — Unlink Discord Account**

  - Endpoint: `POST /api/auth/discord/unlink`
  - Implemented in: `src/services/DiscordService.ts` → `unlinkAccount()`
  - Wired in UI: `src/components/discord/DiscordUserInfo.tsx` — unlink option in settings
  - Features: Removes Discord account association with confirmation

- **#92 — Get Discord User Info**

  - Endpoint: `GET /api/auth/discord/user-info`
  - Implemented in: `src/services/DiscordService.ts` → `getUserInfo()`
  - Wired in UI: `src/components/discord/DiscordUserInfo.tsx` — displays linked Discord info
  - Features: Shows Discord username, avatar, email in profile/settings

- **#93 — Refresh Discord Token**

  - Endpoint: `POST /api/auth/discord/refresh`
  - Implemented in: `src/services/DiscordService.ts` → `refreshToken()`
  - Usage: Refreshes Discord access token for continued API access
  - Integration: Service ready for automatic token refresh flows

## WebSocket Implementation

- **WebSocket Service**

  - Endpoint: `ws://localhost:8080/api/ws`
  - Implemented in: `src/services/WebSocketService.ts` — complete real-time messaging service
  - Features: Connection management, topic subscriptions, automatic reconnection
  - Topics: `/topic/chat/room/{roomId}`, `/topic/notifications/{userId}`, `/topic/tournament/{tournamentId}`, `/topic/typing/{roomId}`, `/user/queue/private`
  - Wired in UI: `src/pages/Chat.tsx` — full chat interface with real-time updates

- **Auth endpoints (#1..#7, #88..#93)**
  - `AuthService.ts` provides login/logout/signup helpers mapped to `APIs_guide.md`. The core login flow uses `src/services/AuthService.ts` and `src/context/AppContext.tsx` for storing tokens and session initialization. Specific endpoints used by UI: `POST /api/auth/login`, `POST /api/auth/logout`, `POST /api/auth/signup`, `GET /api/auth/me`.

## Notes & Status

- What "implemented" means here:

  - A service method exists that calls the documented backend endpoint (uses the project's `apiFetch` wrapper).
  - UI wiring indicates whether the service is already used in a page/component (e.g., `Marketplace` uses product list and create; `Events` uses the events list). If UI is not yet wired, the service is still present and ready.

- Quick status summary:
  - **Product APIs**: Core CRUD, images, wishlist toggle, search/categories implemented and wired to `Marketplace` for listing + creating products. Wishlist toggle (`#55`) is fully integrated through `AppContext` and UI components.
  - **Event APIs**: Complete implementation of all 11 event endpoints with comprehensive UI integration. Features include event creation with validation, listing with search/filtering, registration management, and trending events. Full TypeScript types and English/Arabic translations included.
  - **Tournament APIs**: Core CRUD methods implemented in services; Events list is used in `src/pages/Events.tsx`, but full create/edit UIs are pending.
  - **Profile APIs**: Profile retrieval (`#8`) integrated into `AppContext` session init, merging server JSON fields into local settings.
  - **Discord OAuth APIs**: Complete integration of all 6 Discord endpoints with OAuth flow, account linking/unlinking, and user info display. Full UI components integrated in Login, Signup, and Settings pages.
  - **Chat System APIs**: Complete implementation of all 14 chat endpoints with comprehensive real-time messaging system. Features include room management, message history, file sharing, member management, online users, direct messages, and typing indicators. Full component suite ready for main Chat page integration.

---

If you want, next I can:

1. Wire explicit create forms for Events and Tournaments into `src/pages/Events.tsx` and `src/pages/Tournaments.tsx` so you can seed those resources from the frontend (recommended).
2. Add small unit tests for `ProductService` and `EventService` methods (lightweight mocks).
3. Expand multi-image upload UI for products and attach it to `uploadProductImages`.

If any of the service file paths above look different in your local copy, tell me and I'll update this file to match exactly.
