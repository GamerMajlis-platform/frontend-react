# GamerMajlis Frontend

A modern React gaming platform built with TypeScript, Vite, and Tailwind CSS. Features Discord-only authentication, 24-hour session management, responsive design, and internationalization (English/Arabic with RTL support).

## 🚀 Tech Stack

- **React 19** + **TypeScript** for modern component development
- **Vite 5** for fast development and optimized builds
- **Tailwind CSS 3.4** + **lucide-react** for modern UI with optimized icons
- **react-i18next** for internationalization with English/Arabic support
- **Spring Boot Backend Integration** at `localhost:8080/api`
- **Discord OAuth** for passwordless authentication
- **24-Hour Session Management** with automatic expiry

## 🔑 Authentication & Session Management

### Authentication Requirements

- **Discord-Only Authentication**: No email/password login - only Discord OAuth
- **No Guest Users**: All functionality requires authentication except home, login, signup pages
- **24-Hour Session Timeout**: Sessions expire after 24 hours of inactivity
- **React Router Navigation**: All navigation uses `useNavigate()` hook for SPA behavior
- **Automatic Redirects**:
  - Expired sessions redirect to `/` (home)
  - Unauthorized access attempts redirect to `/` (home)
  - Login/signup pages redirect authenticated users to `/profile`

### Session Behavior & Refresh Persistence

- Session validation happens every 5 minutes with activity tracking
- Browser refresh maintains navigation state via React Router
- Token stored in localStorage with automatic cleanup
- Session expiry triggers cleanup and redirect to home

## 🎯 Implementation Status Summary

### ✅ FULLY IMPLEMENTED FEATURES

#### **Tournament System**

- Tournament name validation (3-50 characters)
- Future date validation for tournament start dates
- Tournament bracket auto-generation algorithms (elimination, round-robin, Swiss)
- Complete tournament management service layer

#### **Marketplace**

- Product price validation (positive values only)
- Enhanced product description validation (10-1000 characters)
- Image compression for product uploads with quality control

#### **Chat System**

- Message length limits (1-2000 characters)
- Real-time message delivery infrastructure with WebSocket service
- Moderator message deletion capabilities

#### **Event Management**

- Event capacity validation and overflow prevention
- Attendance tracking validation system
- Complete event creation and management forms

#### **Media Management**

- File format validation (MP4, AVI, MOV, JPG, PNG, GIF)
- File size limits (100MB videos, 10MB images)
- Upload progress indicators with real-time tracking
- Malicious file detection with security scanning
- Automatic media compression with 30% minimum reduction

#### **Profile Management**

- Complete profile system with Discord integration
- Display name validation with character limits
- Profile picture upload/change/remove functionality
- Gaming preferences with skill levels and platform selection
- Gaming statistics tracking with game-specific breakdowns
- Social media links integration (YouTube, Twitter, Instagram, Twitch, Steam)
- Privacy controls for profile visibility and settings
- Enhanced profile forms with sectioned interface

### ⚠️ PARTIALLY IMPLEMENTED

#### **Real-time Features**

- WebSocket infrastructure ready for chat and notifications
- Tournament bracket UI integration needed
- Live event updates system partially implemented

#### **Security & Optimization**

- CVE vulnerability scanning for dependencies implemented
- Additional security headers and CSRF protection needed
- Performance monitoring and analytics integration pending

## 📁 Project Structure

```
src/
├── components/
│   ├── chat/           # Real-time chat system UI
│   ├── discord/        # Discord OAuth integration UI
│   ├── events/         # Event management UI
│   ├── media/          # Media upload/validation UI
│   ├── posts/          # Post system UI
│   ├── products/       # Marketplace UI
│   ├── profile/        # Profile management UI
│   ├── settings/       # Settings UI
│   ├── shared/         # Reusable UI components
│   ├── tournaments/    # Tournament UI
│   ├── PreferencesBootstrap.tsx
│   ├── ProfileDropdown.tsx
│   ├── ProgressBar.tsx
│   └── index.ts
├── pages/
│   ├── AuthSuccess.tsx
│   ├── Chat.tsx
│   ├── DiscordCallback.tsx
│   ├── DiscordOnlyLogin.tsx
│   ├── EmailVerification.tsx
│   ├── Events.tsx
│   ├── Home.tsx
│   ├── Login.tsx
│   ├── Marketplace.tsx
│   ├── Messages.tsx
│   ├── NotFound.tsx
│   ├── Profile.tsx
│   ├── Settings.tsx
│   ├── Signup.tsx
│   ├── Tournaments.tsx
│   ├── Wishlist.tsx
│   └── index.ts
├── services/
│   ├── AuthService.ts        # Authentication management (extends BaseService)
│   ├── ChatService.ts        # Chat system (extends BaseService)
│   ├── DiscordService.ts     # Discord OAuth (extends BaseService)
│   ├── EventService.ts       # Event management (extends BaseService)
│   ├── MediaService.ts       # Media upload/validation (extends BaseService)
│   ├── PostService.ts        # Post system (extends BaseService)
│   ├── ProductService.ts     # Marketplace (extends BaseService)
│   ├── ProfileService.ts     # Profile management (extends BaseService)
│   ├── SessionService.ts     # 24-hour session handling
│   ├── TournamentService.ts  # Tournament operations (extends BaseService)
│   └── WebSocketService.ts   # Real-time communication
├── hooks/
│   ├── useApi.ts
│   ├── useClickOutside.ts
│   ├── useDebounce.ts
│   ├── useDeepStable.ts
│   ├── useFormValidation.ts
│   ├── useIsMobile.ts
│   ├── useLocalStorage.ts
│   ├── usePreferences.ts
│   └── useProfile.ts
├── types/
│   ├── auth.ts
│   ├── chat.ts
│   ├── common.ts
│   ├── context7-mcp.d.ts
│   ├── data.ts
│   ├── discord.ts
│   ├── events.ts
│   ├── forms.ts
│   ├── index.ts
│   ├── media.ts
│   ├── posts.ts
│   ├── products.ts
│   ├── tournaments.ts
│   └── ui.ts
├── lib/
│   ├── api.ts
│   ├── baseService.ts        # Abstract BaseService for DRY service logic
│   ├── errors.ts
│   ├── icons.tsx
│   ├── index.ts
│   ├── logger.ts
│   ├── navigation.ts
│   ├── security.ts
│   └── userStorage.ts
├── config/
│   ├── constants.ts
│   └── index.ts
├── context/
│   ├── AppContext.tsx
│   └── useAppContext.ts
├── data/
│   ├── index.ts
│   ├── languages.ts
│   ├── navigation.ts
│   └── README.md
├── i18n/
│   └── config.ts
└── states/
  └── EmptyState.tsx
```

## 🔧 Technical Improvements Made

### Icon Optimization

- Replaced verbose SVG code with **lucide-react** icons throughout the application
- Standardized icon usage in: Home.tsx (tabs), InputField.tsx (password visibility), Dropdown.tsx (chevrons)
- Reduced bundle size and improved consistency

### Navigation Enhancement

- Migrated from `window.location.href` to React Router `useNavigate()` hook
- Improved SPA behavior with proper state management
- Enhanced OAuth callback handling with state preservation

### Profile System Enhancement

- **Social Media Integration**: Social icons display under Discord username in profile header
- **RTL/LTR Support**: Proper right-to-left layout for Arabic language
- **Complete Profile Management**: Enhanced forms, gaming statistics, privacy controls

### Security & Validation

- Comprehensive file upload validation with malicious file detection
- Form validation for all user inputs with proper error handling
- CVE vulnerability scanning for project dependencies

### Service Layer Refactor

- Introduced `BaseService` abstract class for all major services to enforce DRY, maintainable, and consistent API logic (authentication, retries, error handling, form data, etc.)
- All domain services (AuthService, ChatService, DiscordService, EventService, MediaService, PostService, ProductService, ProfileService, TournamentService) now extend `BaseService`.
- Reduced boilerplate and improved maintainability across the codebase.

## 🏗️ Backend Integration Requirements

### API Endpoints Expected

- `POST /auth/discord` - Discord OAuth initiation
- `GET /auth/discord/callback` - OAuth callback handling
- `POST /profile/me/profile-picture` - Profile image upload
- `GET /events` - Event listing with filtering
- `POST /tournaments` - Tournament creation
- `WebSocket /chat` - Real-time chat communication

### Known Backend Issues

- Discord OAuth "authorization_request_not_found" error needs backend investigation
- Profile image upload returns 500 errors - backend file processing service needed
- General API 500 errors require backend server log review

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

## 📋 Development Guidelines

### Authentication Testing

- Use Discord OAuth for all user authentication
- Test session timeout after 24 hours
- Verify redirect behavior for unauthorized access

### Profile Management Testing

- Verify social icons display under Discord username in profile main section
- Test RTL/LTR layout switching for Arabic/English
- Validate profile picture upload functionality

### Navigation Testing

- Ensure all navigation uses React Router (no window.location.href)
- Test browser refresh persistence across all pages
- Verify OAuth callback navigation works correctly

### Media Upload Testing

- Test file format validation (MP4, AVI, MOV, JPG, PNG, GIF)
- Verify file size limits (100MB videos, 10MB images)
- Test malicious file detection
- Validate compression requirements (30% minimum reduction)

## 🔍 Debugging Guide

### Session Issues

- Check localStorage for `gamerMajlis_auth` token
- Verify session validation in browser network tab
- Check console for session timeout warnings

### OAuth Issues

- Verify Discord OAuth configuration in backend
- Check OAuth state storage and retrieval
- Monitor OAuth callback URL parameters

### Profile Issues

- Verify Discord username integration
- Check social links parsing from backend user data
- Test profile picture upload with backend logs

This project implements a comprehensive gaming platform with modern React architecture, proper authentication flows, and extensive validation systems.
│ ├── MessageInput.tsx # Message composer with file upload
│ ├── MessageBubble.tsx # Individual message display
│ ├── TypingIndicator.tsx # Real-time typing indicators
│ ├── MemberList.tsx # Room member management
│ ├── OnlineUsersList.tsx # Online users sidebar
│ └── InviteMemberModal.tsx # Member invitation modal
├── pages/ # Application pages
│ ├── Home.tsx # Landing page
│ ├── Profile.tsx # User profile with backend data
│ ├── Settings.tsx # User settings (simplified)
│ ├── Login.tsx # Authentication
│ ├── Marketplace.tsx # Product marketplace
│ ├── Tournaments.tsx # Tournament listings
│ ├── Events.tsx # Event management with create/register/search
│ └── Messages.tsx # Messaging interface
├── services/ # Backend API integration
│ ├── AuthService.ts # Authentication with JWT
│ ├── ProfileService.ts # Profile management
│ ├── EventService.ts # Event management (11 API endpoints)
│ ├── DiscordService.ts # Discord OAuth integration (6 API endpoints)
│ ├── ChatService.ts # Chat system (14 API endpoints)
│ └── SessionService.ts # Session/token management
├── context/
│ ├── AppContext.tsx # Global state management
│ └── useAppContext.ts # Context hook
├── hooks/ # Custom reusable hooks
│ ├── useFormValidation.ts # Form validation logic
│ ├── useLocalStorage.ts # Type-safe localStorage
│ ├── useDebounce.ts # Value debouncing
│ ├── useClickOutside.ts # Click detection
│ └── usePreferences.ts # User preferences sync
├── types/ # TypeScript definitions
│ ├── auth.ts # User and auth types
│ ├── events.ts # Event types and interfaces
│ ├── chat.ts # Chat system types and interfaces
│ ├── discord.ts # Discord integration types
│ ├── common.ts # Shared types
│ └── ui.ts # Component prop types
├── config/
│ └── constants.ts # App constants and API endpoints
├── lib/
│ ├── api.ts # API client with auth
│ └── security.ts # Security utilities
└── i18n/
└── config.ts # Internationalization setup

public/
└── locales/ # Translation files
├── en/translation.json # English translations
└── ar/translation.json # Arabic translations

````

## ⚡ Key Features

### 🔐 Backend Integration

- **JWT Authentication** with automatic token refresh
- **Profile Management** with real user data from Spring Boot API
- **Session Management** with automatic logout on token expiration
- **Event Management** with comprehensive CRUD operations and registration
- **Discord OAuth Integration** with account linking and user info
- **Real-time Chat System** with rooms, direct messages, and file sharing
- **Form-data Uploads** for profile pictures, event images, and chat attachments

### 🎨 Modern UI/UX

- **Responsive Design** with mobile-first approach
- **Dark Theme** with custom color palette
- **Smooth Animations** and hover effects
- **Accessible Forms** with proper ARIA labels and focus management

### 🌐 Internationalization

- **Bilingual Support**: English and Arabic with complete translations
- **RTL Layout**: Automatic right-to-left layout for Arabic
- **Dynamic Language Switching** with persistence
- **Direction-aware Components** for proper RTL experience

### 📱 Performance Optimizations

- **Debounced Search** (300ms) across all interfaces
- **Strategic Memoization** of components for optimal re-rendering
- **Type-safe LocalStorage** with error handling
- **Error Boundaries** for graceful error handling

## 🛠️ Development

### Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint
````

### Development server port configuration

By default the dev server will attempt to start at port `3000`. If `3000` is already in use, Vite will automatically pick the next free port (e.g. `3001`, `3002`, ...). This lets you run multiple dev instances simultaneously without setting a port manually.

If you need to force a specific port (for example, to test exact-origin OAuth flows), set the `VITE_DEV_PORT` environment variable before starting the server. When `VITE_DEV_PORT` is provided the dev server will fail to start if that port is unavailable (to avoid silent port changes during testing).

Example (bash) — allow automatic incrementing (simply run multiple instances):

```bash
npm run dev
```

Example (bash) — force a specific port:

```bash
VITE_DEV_PORT=3000 npm run dev
```

Example (PowerShell) — force a specific port:

```powershell
$env:VITE_DEV_PORT=3000; npm run dev
```

When testing OAuth or other origin-sensitive flows on multiple ports, ensure your backend's allowed origins or redirect URIs include the ports you use (for example `http://localhost:3000` and `http://localhost:3001`).

### Backend Requirements

The frontend expects a Spring Boot backend running at `localhost:8080/api` with these endpoints:

```
Authentication:
POST /api/auth/login
POST /api/auth/signup
POST /api/auth/logout
GET  /api/auth/me
POST /api/auth/validate-token

Profile:
GET  /api/profile/me
PUT  /api/profile/me
POST /api/profile/me/profile-picture

Events:
POST /api/events              # Create event
GET  /api/events              # List events with filtering
GET  /api/events/{id}         # Get event details
PUT  /api/events/{id}         # Update event
DELETE /api/events/{id}       # Delete event
POST /api/events/{id}/register # Register for event
DELETE /api/events/{id}/register # Unregister from event
GET  /api/events/{id}/attendees # Get event attendees
POST /api/events/{id}/checkin # Check-in attendee
GET  /api/events/search       # Search events
GET  /api/events/trending     # Get trending events

Discord OAuth:
GET  /api/auth/discord/oauth  # Initiate OAuth flow
POST /api/auth/discord/callback # Handle OAuth callback
POST /api/auth/discord/link   # Link Discord account
POST /api/auth/discord/unlink # Unlink Discord account
GET  /api/auth/discord/user-info # Get Discord user info
POST /api/auth/discord/refresh # Refresh Discord token

Chat System:
POST /api/chat/rooms          # Create chat room
GET  /api/chat/rooms          # Get user chat rooms
GET  /api/chat/rooms/{id}     # Get room details
POST /api/chat/rooms/{id}/join # Join room
POST /api/chat/rooms/{id}/leave # Leave room
POST /api/chat/rooms/{id}/messages # Send message
GET  /api/chat/rooms/{id}/messages # Get messages
DELETE /api/chat/messages/{id} # Delete message
POST /api/chat/rooms/{id}/members/{userId} # Add member
DELETE /api/chat/rooms/{id}/members/{userId} # Remove member
GET  /api/chat/rooms/{id}/members # Get room members

## 🧭 Routing

The application now uses `react-router-dom` (BrowserRouter) instead of hash-based (`window.location.hash`) navigation.

### Added Routes

```

/ -> Home
/profile -> Current user profile
/profile/:id -> Other user profile
/tournaments -> Tournaments
/events -> Events
/messages -> Legacy redirect page (auto forwards to /chat)
/chat -> Chat system
/marketplace -> Marketplace
/signup -> Signup
/login -> Login
/verify-email -> Email verification status page
/discord-callback -> Discord OAuth callback
/auth/success -> Auth success token exchange
/wishlist -> Wishlist
/settings -> Settings
/\* -> 404 NotFound

```

### Migration Notes

- All previous `window.location.hash = "#section"` patterns replaced with `useNavigate()` calls.
- `/#home`, `/#login` etc. fragments removed in favor of clean paths (`/`, `/login`).
- Dynamic profile navigation supports `navigate('/profile/:id')` based on user selection.
- Added a `NotFound` fallback route (`*`).

### SPA Fallback (Production Deployment)

Because BrowserRouter relies on the server returning `index.html` for unknown paths, configure a rewrite rule:

Nginx example:
```

location / {
try_files $uri /index.html;
}

```

Apache (.htaccess):
```

RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

```

Netlify `_redirects` file:
```

/\* /index.html 200

```

Vercel (`vercel.json`):
```

{
"rewrites": [ { "source": "/(.*)", "destination": "/index.html" } ]
}

```

Without these, direct refreshing on nested routes (e.g. `/profile/123`) will 404 at the server layer.

POST /api/chat/direct         # Start direct message
GET  /api/chat/online-users   # Get online users
POST /api/chat/typing         # Send typing indicator
```

### Development Workflow

1. **Authentication**: Login/signup forms with real backend validation
2. **Profile Management**: Edit profile data that syncs with backend
3. **Session Handling**: Automatic token validation and refresh
4. **Error Handling**: Graceful degradation when backend is unavailable

## 🎯 Simplified Architecture

### Settings Page

After cleanup, Settings now only includes features with backend support:

- **Language**: English/Arabic switching (client-side)
- **Privacy**: Profile visibility and online status (backend API)

**Removed**: Notifications, currency, account management (no backend APIs)

### Authentication Flow

```
1. User submits login form
2. AuthService.login() → POST /api/auth/login
3. JWT stored in localStorage
4. SessionService manages token validation/refresh
5. Automatic logout on token expiration
```

### Profile Management

```
1. ProfileService.getMyProfile() → GET /api/profile/me
2. Real user data displayed in components
3. Profile updates → PUT /api/profile/me
4. Image uploads → POST /api/profile/me/profile-picture
```

## 🧩 Component Architecture

### Form System

Unified `InputField` component with:

- Built-in validation and error states
- Floating labels with smooth animations
- Password visibility toggle
- RTL support and proper accessibility

### Reusable Patterns

- **Custom Hooks**: Centralized logic for forms, localStorage, debouncing
- **Error Boundaries**: Development-friendly error catching
- **Click Outside**: Consistent dropdown/modal behavior
- **Responsive Design**: Mobile-first with Tailwind breakpoints

## 🔧 Configuration

### Environment Variables

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:8080/api

# Development Settings
VITE_DEV_MODE=true
```

### Tailwind Theme

Custom color palette and design tokens:

```javascript
colors: {
  dark: "#0b132b",
  "dark-secondary": "#1e293b",
  primary: "#6fffe9",
  "primary-hover": "#5ee6d3",
  text: "#ffffff",
  "text-secondary": "#94a3b8"
}
```

## 📋 Recent Updates (September 2025)

### ✅ Events Feature Implementation

- Complete event management system with 11 API endpoints
- Event creation, registration, and attendance tracking
- Search, filtering, and trending events functionality
- Comprehensive TypeScript types and validation
- Full English/Arabic translation support
- Mobile-responsive event grid and forms

### ✅ Discord OAuth Integration

- Complete Discord OAuth flow with 6 API endpoints
- Discord account linking/unlinking functionality
- OAuth login and signup integration
- Discord user info display with avatar and username
- Account management in Settings page
- CSRF protection and secure state management

### ✅ Real-time Chat System

- Comprehensive chat system with 14 API endpoints
- Chat room creation and management
- Real-time messaging with file attachments
- Direct message conversations
- Online user presence and status
- Typing indicators and message reactions
- Member management and moderation tools
- Mobile-responsive chat interface

### ✅ Backend Integration

- Integrated Spring Boot API with JWT authentication
- Real profile data loading and updates
- Session management with automatic token refresh
- Enhanced error handling for API failures

### ✅ Settings Cleanup

- Removed 57% of Settings page code (427 → 183 lines)
- Eliminated unsupported features (notifications, currency, account management)
- Reduced translation keys by 60%
- Aligned all features with actual backend APIs

### ✅ Performance Improvements

- Strategic component memoization
- Debounced search across all interfaces
- Optimized re-rendering patterns
- Error boundary implementation

### ✅ Profile Enhancement

- Backend-integrated profile header
- Real user data display
- Profile picture upload (frontend ready)
- Enhanced mobile responsiveness

## 🚦 Development Guidelines

### Code Quality

- **TypeScript First**: Full type coverage for reliability
- **Component Reuse**: Prefer composition over duplication
- **Performance**: Measure and optimize re-renders
- **Accessibility**: ARIA labels and keyboard navigation

### Backend Integration

- **Error Handling**: Graceful fallbacks for API failures
- **Loading States**: Proper loading indicators
- **Authentication**: JWT token management
- **Data Sync**: Real-time updates when possible

### Styling Approach

- **Tailwind Utilities**: Utility-first for consistency
- **Responsive Design**: Mobile-first approach
- **Dark Theme**: Consistent dark mode throughout
- **RTL Support**: Proper Arabic layout handling

## 📞 Support

For backend API integration issues, ensure:

1. Spring Boot server running on `localhost:8080`
2. CORS configured for `localhost:5173` (Vite dev server)
3. JWT authentication endpoints available
4. Profile management endpoints implemented

---

**Built with ❤️ for the gaming community**
