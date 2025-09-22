# GamerMajlis Frontend

A modern React gaming platform built with TypeScript, Vite, and Tailwind CSS. Features responsive design, internationalization (English/Arabic with RTL support), and a lean, performance-optimized architecture.

## 🚀 Tech Stack

- **React 19** + **TypeScript** for modern component development
- **Vite 5** for fast development and optimized builds
- **Tailwind CSS 3.4** for utility-first styling
- **react-i18next** for internationalization with English/Arabic support
- **Spring Boot Backend Integration** at `localhost:8080/api`

## 📁 Project Structure

```
src/
├── components/
│   ├── shared/              # Reusable UI components
│   │   ├── Header.tsx       # Main navigation with auth integration
│   │   ├── Footer.tsx       # Site footer
│   │   ├── InputField.tsx   # Unified form input with validation
│   │   ├── Card.tsx         # Product/tournament/event cards
│   │   ├── SortBy.tsx       # Reusable sort dropdown
│   │   ├── LanguageSwitcher.tsx # EN/AR language toggle
│   │   └── ErrorBoundary.tsx # Error handling with fallback UI
│   ├── profile/             # Profile-specific components
│   │   ├── BackendProfileHeader.tsx # Profile header with backend integration
│   │   ├── AboutSection.tsx # Profile bio section
│   │   ├── StatsList.tsx    # Gaming stats display
│   │   └── TabBar.tsx       # Profile navigation tabs
│   ├── settings/            # Settings page components
│   │   ├── SettingRow.tsx   # Individual setting row
│   │   ├── ToggleButton.tsx # Toggle switch
│   │   └── Dropdown.tsx     # Settings dropdown
│   ├── events/              # Event management components
│   │   ├── CreateEventForm.tsx # Event creation form with validation
│   │   ├── EventGrid.tsx    # Event display grid using shared Card
│   │   └── index.ts         # Event component exports
│   ├── discord/             # Discord OAuth integration components
│   │   ├── DiscordLoginButton.tsx # Discord OAuth login
│   │   ├── DiscordLinkButton.tsx # Account linking
│   │   └── DiscordUserInfo.tsx # Discord account display
│   └── chat/                # Real-time chat system components
│       ├── ChatRoom.tsx     # Main chat interface
│       ├── ChatRoomList.tsx # Room browsing and selection
│       ├── CreateRoomModal.tsx # Room creation modal
│       ├── MessageList.tsx  # Message history with pagination
│       ├── MessageInput.tsx # Message composer with file upload
│       ├── MessageBubble.tsx # Individual message display
│       ├── TypingIndicator.tsx # Real-time typing indicators
│       ├── MemberList.tsx   # Room member management
│       ├── OnlineUsersList.tsx # Online users sidebar
│       └── InviteMemberModal.tsx # Member invitation modal
├── pages/                   # Application pages
│   ├── Home.tsx            # Landing page
│   ├── Profile.tsx         # User profile with backend data
│   ├── Settings.tsx        # User settings (simplified)
│   ├── Login.tsx           # Authentication
│   ├── Marketplace.tsx     # Product marketplace
│   ├── Tournaments.tsx     # Tournament listings
│   ├── Events.tsx          # Event management with create/register/search
│   └── Messages.tsx        # Messaging interface
├── services/               # Backend API integration
│   ├── AuthService.ts      # Authentication with JWT
│   ├── ProfileService.ts   # Profile management
│   ├── EventService.ts     # Event management (11 API endpoints)
│   ├── DiscordService.ts   # Discord OAuth integration (6 API endpoints)
│   ├── ChatService.ts      # Chat system (14 API endpoints)
│   └── SessionService.ts   # Session/token management
├── context/
│   ├── AppContext.tsx      # Global state management
│   └── useAppContext.ts    # Context hook
├── hooks/                  # Custom reusable hooks
│   ├── useFormValidation.ts # Form validation logic
│   ├── useLocalStorage.ts  # Type-safe localStorage
│   ├── useDebounce.ts      # Value debouncing
│   ├── useClickOutside.ts  # Click detection
│   └── usePreferences.ts   # User preferences sync
├── types/                  # TypeScript definitions
│   ├── auth.ts            # User and auth types
│   ├── events.ts          # Event types and interfaces
│   ├── chat.ts            # Chat system types and interfaces
│   ├── discord.ts         # Discord integration types
│   ├── common.ts          # Shared types
│   └── ui.ts              # Component prop types
├── config/
│   └── constants.ts       # App constants and API endpoints
├── lib/
│   ├── api.ts            # API client with auth
│   └── security.ts       # Security utilities
└── i18n/
    └── config.ts         # Internationalization setup

public/
└── locales/              # Translation files
    ├── en/translation.json # English translations
    └── ar/translation.json # Arabic translations
```

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
```

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
