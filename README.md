# GamerMajlis Frontend

A modern React 19 gaming platform with TypeScript, Vite, and Tailwind CSS. Features responsive design, RTL support, internationalization, and a component-driven architecture.

## Tech Stack

- **React 19** with TypeScript for modern component development
- **Vite 7.1.4** for fast development and optimized builds
- **Tailwind CSS 3.4.14** for utility-first styling
- **react-i18next** for internationalization with English/Arabic support
- **Node** (npm/pnpm) or **Bun** for package management and scripts

## Project structure (current)

```
src/
├── components/
│   ├── shared/                  # Truly shared UI used across pages
│   │   ├── BackgroundDecor.tsx  # Decorative background element
│   │   ├── Card.tsx             # Reusable card component
│   │   ├── ChatBot.tsx          # Chat interface (lazy-loaded)
│   │   ├── Footer.tsx           # Site footer
│   │   ├── Header.tsx           # Main navigation (desktop + mobile)
│   │   ├── icons.tsx            # Shared SVG icon components
│   │   ├── LanguageSwitcher.tsx # Language toggle (EN/AR)
│   │   ├── Logo.tsx             # Brand logo component
│   │   ├── MessageBubble.tsx    # Individual message component
│   │   ├── MessageThread.tsx    # Message thread display
│   │   ├── SortBy.tsx           # Reusable sort dropdown component
│   │   └── index.ts             # Barrel that exports all shared components
│   ├── profile/                 # Profile page components
│   │   ├── AboutSection.tsx     # Profile bio editor/view
│   │   ├── PreferencesList.tsx  # Editable list of user preferences
│   │   ├── StatsList.tsx        # Editable stats with progress
│   │   ├── TabBar.tsx           # Profile tabs (About/Preferences/Stats)
│   │   └── ProfileHeader.tsx    # Composite header (avatar, name, XP, actions)
│   ├── settings/                # Components only used inside Settings UI
│   │   └── ...                  # (e.g. color pickers, theme toggles — if present)
│   └── index.ts                 # Main component barrel -> `export * from './shared'`
├── pages/
│   ├── Events.tsx               # Events page
│   ├── Home.tsx                 # Landing page hero
│   ├── Login.tsx                # Authentication form
│   ├── Marketplace.tsx          # Product marketplace with search/filter
│   ├── Messages.tsx             # Messages page
│   ├── Profile.tsx              # User profile page with enhanced design
│   ├── Settings.tsx             # User settings and preferences
│   ├── Signup.tsx               # User registration form
│   ├── Tournaments.tsx          # Tournaments listing
│   ├── Wishlist.tsx             # User wishlist with localStorage
│   └── index.ts                 # Page exports
├── context/
│   ├── AppContext.tsx           # Global application state
│   └── useAppContext.ts         # Context hook
├── styles/
│   ├── BaseStyles.ts            # Design tokens and utilities
│   └── options/
│       ├── sort-by-colors.md    # Color documentation for dropdowns
│       └── header-colors.md     # Header color specifications
├── data/
│   ├── events.ts                # Event data and types
│   ├── languages.ts             # Language options
│   ├── navigation.ts            # Navigation items
│   ├── products.ts              # Product catalog
│   ├── tournaments.ts           # Tournament data
│   ├── README.md                # Data layer documentation
│   └── index.ts                 # Data exports
├── hooks/
│   ├── usePreferences.ts        # User preferences hook
│   └── useIsMobile.ts           # Simple viewport size hook (<640px)
├── i18n/
│   └── config.ts                # Internationalization setup
├── services/
│   └── AuthService.ts           # Authentication service
├── states/
│   └── EmptyState.tsx           # Shared empty state UI used by multiple pages
└── types/
    └── context7-mcp.d.ts        # TypeScript definitions

public/
└── locales/
  ├── en/translation.json      # English translations
  └── ar/translation.json      # Arabic translations
```

## Key Features

### Responsive Design

- **Mobile-first approach** with Tailwind breakpoints: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px)
- **Adaptive header**:
  - Desktop: centered pill-style nav with a clearly visible frame and hover states
  - Mobile: simple dropdown list that opens below the header (no page overlay)
- **Responsive components** optimized for all screen sizes

### Internationalization (i18n)

- **Bilingual support**: English and Arabic with RTL layout
- **RTL handling**: document `dir` is synced to the active language; sensitive components set `dir` explicitly and use direction-aware spacing/alignment
- **Dynamic font pairing** (Latin + Arabic-friendly fonts)
- **Layout mirroring** for proper RTL experience

### Recent updates (September 2025)

- Navigation
  - Desktop: increased contrast of the nav “pill” frame for clarity
  - Mobile: simplified menu to a dropdown below the header; minimalist hamburger; profile dropdown includes Profile, Wishlist (badge), Settings, Logout with RTL-aware alignment
- Search & Sort (Marketplace / Tournaments / Events)
  - On mobile: hide SortBy, shorten search placeholder to “Search”, add a small search icon button that focuses the input
  - Added `IconSearch` and a tiny `useIsMobile` hook (640px breakpoint)
- Home page
  - Mobile: CTA buttons reduced in size and set to ~half-width side-by-side
  - Labels updated to “Subscribe” and “Tournaments” (with translations)
- i18n

  - Persist language across refresh; namespace loading and debug logs refined

- Profile refactor and cleanup

  - Introduced a composite `ProfileHeader` that encapsulates avatar picker, name/discord editing, level + XP progress (via `ProgressBar`), and edit/save/cancel actions.
  - Split Profile content into `TabBar`, `AboutSection`, `PreferencesList`, and `StatsList` for clarity and reuse.
  - Reduced component count by inlining header subcomponents to avoid over-fragmentation.

- Shared Empty State

  - Added `src/states/EmptyState.tsx` and adopted it in `Wishlist`, `Marketplace`, `Events`, and `Tournaments` for consistent empty views.
  - Localized messages and actions in both English and Arabic.

- Lifecycle fix

  - Moved `hashchange` side-effect from `useState` to `useEffect` in `App.tsx` with proper cleanup.

- Favicon stabilization

  - Switched to PNG-based favicons for consistent cross-browser rendering; added guidance for cache-busting.

- RTL and ChatBot fixes

  - Corrected RTL alignment and arrow flipping in ChatBot composer; reduced brand icon height; improved `dir` detection.

- Auth polish
  - Added responsive "Login with Discord" button using `react-icons`.
  - Fixed mobile viewport issues in `Signup.tsx` with responsive widths and layout.

- Performance and cleanup
  - Wrapped leaf components with `React.memo` to reduce unnecessary re-renders:
    - `src/components/shared/SortBy.tsx`
    - `src/components/profile/TabBar.tsx`
    - `src/components/profile/AboutSection.tsx`
    - `src/components/profile/PreferencesList.tsx`
    - `src/components/profile/StatsList.tsx`
  - Stabilized handler identities in `src/pages/Profile.tsx` using `useCallback` so memoized children don’t re-render on every parent update.
  - Adopted a `props.xxx` access style in child components for clarity and consistency.
  - Removed unused/empty files: `src/components/MobileMenu.tsx` and `src/services/Context7Service.ts`.

#### i18n: namespace loading and debug

When translations are loaded at runtime via the HTTP backend, i18next initialization and namespace loading are asynchronous. A common runtime warning is:

```
i18next::translator: key "labels.organizer" ... won't get resolved as namespace "translation" was not yet loaded
```

This happens when code calls `i18n.t(...)` before the backend has finished loading the requested namespace for the active language.

Project approach

- Centralized debug logging in `src/i18n/config.ts`; waits for namespaces via `i18n.loadNamespaces(ns)` before logging keys in dev.

How to verify

- Start the dev server and open browser DevTools Console. You should see a single grouped block per language titled `i18n translation debug: <lang>` with the requested keys and values (or a single clear missing warning if a key is not present).

Notes on Context7

- Context7 integration is currently deferred in this branch to keep the codebase lean. The previous placeholder service has been removed. If/when integration resumes, add back a service under `src/services/` and wire configuration via environment variables.

### Component architecture

- **Shared vs settings**: Components that are reused across pages live under `src/components/shared/` and are exported from the shared barrel (`src/components/shared/index.ts`). Settings-specific UI should live in `src/components/settings/` so contributors know which pieces are app-shell vs settings-only.
- **Single import entry**: Import shared components from the top-level barrel `src/components` (this file re-exports from `./shared`) rather than importing deep paths. Example:

```ts
// preferred
import { Header, Footer, Card } from "../components";

// avoid
import Header from "../components/shared/Header";
```

This keeps imports stable when components are reorganized and simplifies refactors.

## Application Structure (Parent → Children)

Below is a high-level parent/children map of the application using Mermaid for a clean visual. It focuses on the app shell and key pages. You can preview Mermaid diagrams directly on GitHub.

```mermaid
flowchart TD
  A[App] --> B[AppProvider]
  B --> C[PreferencesBootstrap]
  B --> D{isAuthPage?}
  D -- no --> E[Header]
  B --> F[<Suspense>]
  F --> G[[Page Content]]
  D -- no --> H[Footer]
  B --> I[<Suspense>]
  I --> J[ChatBot]

  %% Pages (lazy-loaded)
  G --> G1[Home]
  G --> G2[Profile]
  G --> G3[Tournaments]
  G --> G4[Events]
  G --> G5[Messages]
  G --> G6[Marketplace]
  G --> G7[Signup]
  G --> G8[Login]
  G --> G9[Wishlist]
  G --> G10[Settings]
```

### Page Composition Details

```mermaid
flowchart LR
  subgraph Shell
    E[Header]:::shell
    H[Footer]:::shell
    J[ChatBot]:::shell
  end

  subgraph Home
    HO[Home]
    HO --> H1[BackgroundDecor]
  end

  subgraph Messages
    MS[MessagesPage]
    MS --> MS1[ConversationList]
    MS --> MS2[MessageThread]
    MS2 --> MS3[MessageBubble]
    MS2 --> MS4[Composer]
  end

  subgraph Profile
    PR[Profile]
    PR --> PR1[ProfileHeader]
    PR --> PR2[TabBar]
    PR --> PR3[AboutSection]
    PR --> PR4[PreferencesList]
    PR --> PR5[StatsList]
  end

  subgraph Marketplace
    MK[Marketplace]
    %% Uses SortBy, Card (repeated), search UI
    MK --> MK1[SortBy]
    MK --> MK2[Card xN]
  end

  subgraph Tournaments
    TO[Tournaments]
    TO --> TO1[SortBy]
    TO --> TO2[Card xN]
  end

  subgraph Events
    EV[Events]
    EV --> EV1[SortBy]
    EV --> EV2[Card xN]
  end

  classDef shell fill:#0ea5,fill-opacity:0.15,stroke:#22d3ee,color:#e2e8f0;
```

Notes

- The shell (`Header`, `Footer`, `ChatBot`) is hidden on auth pages (`Login`, `Signup`).
- Pages are lazy-loaded via React `lazy` and wrapped in `Suspense`.
- Shared UI like `Card`, `SortBy`, `BackgroundDecor`, `Logo`, and icons live under `src/components/shared` and are imported through the barrel `src/components`.
- Navigation between pages is handled via the URL hash (e.g., `#home`, `#tournaments`), which the `App` component listens to and syncs.

### Changelog (structural)

- Removed files (inlined into `ProfileHeader`):

  - `src/components/profile/AvatarPicker.tsx`
  - `src/components/profile/NameSection.tsx`
  - `src/components/profile/LevelXp.tsx`
  - `src/components/profile/ActionButtons.tsx`

- Added files:
  - `src/states/EmptyState.tsx`
  - `src/components/profile/ProfileHeader.tsx` (composite)
  - `src/components/profile/TabBar.tsx`
  - `src/components/profile/AboutSection.tsx`
  - `src/components/profile/PreferencesList.tsx`
  - `src/components/profile/StatsList.tsx`

- Removed files (cleanup):
  - `src/components/MobileMenu.tsx` (unused after mobile dropdown rollback)
  - `src/services/Context7Service.ts` (deferred integration)

### State Management

- **React Context API** for global state
- **localStorage persistence** for user preferences and wishlist
- **Controlled components** with proper form handling

## Styling System

### Tailwind Configuration

The project uses Tailwind CSS 3.4.14 with custom theme extensions including the enhanced color palette:

```javascript
// tailwind.config.js
theme: {
  extend: {
    fontFamily: {
      alice: ["Alice-Regular", "Helvetica", "sans-serif"],
      scheherazade: ["Scheherazade New", "serif"],
      inter: ["Inter", "system-ui", "sans-serif"],
    },
    colors: {
      dark: "#0b132b",
      "dark-secondary": "#1e293b",
      primary: "#6fffe9",
      "primary-hover": "#5ee6d3",
      text: "#ffffff",
      "text-secondary": "#94a3b8",

      // Enhanced Palette Colors
      'rich-black': '#0B132B',
      'dark-gunmetal': '#1C2541',
      'independence': '#3A506B',
      'tiffany-blue': '#5BC0BE',
      'aquamarine': '#6FFFE9',
      'persian-green': '#07BEB8',
      'turquoise': '#3DCCC7',
      'medium-turquoise': '#68D8D6',
      'powder-blue': '#9CEAEF',
      'light-cyan': '#C4FFF9',
    },
  },
}
```

### Design Tokens

Design tokens are provided via Tailwind theme extension; component-level CSS variables can be added as needed.

### Layout Notes

- **Flexbox**: used heavily for header, toolbars, and linear layouts
- **CSS Grid**: used for content grids (e.g., product/tournament/event cards)

### Z-Index Layering

Consistent layering:

- **Background**: `z-0` (BackgroundDecor)
- **Content**: `z-10` (pages)
- **Navigation**: `z-50` (Header)
- **Dropdowns**: `z-[10001]` (mobile menu/profile)

## Development

### Getting Started

```bash
# Install dependencies (choose one)
npm install
# or
pnpm install
# or
bun install

# Start development server
npm run dev
# or
bun run dev

# Build for production
npm run build

# Lint code
npm run lint
```

### Dev checklist

Quick, repeatable steps for local development and verification:

- Install dependencies

  ```bash
  npm install # or pnpm install / bun install
  ```

- Start the dev server and open the app (Vite default port 5173)

  ```bash
  npm run dev
  # then open http://localhost:5173
  ```

- Verify translations & RTL

  - Use the in-app LanguageSwitcher (top-right) to toggle between English and Arabic.
  - Alternatively, append `?lang=ar` or `?lang=en` to the URL to test language-specific load behavior.
  - Confirm translations persist across refresh and that the current page remains after reload (URL hash is synchronized with app state).
  - Confirm: Marketplace/Events/Tournaments sort dropdowns and product cards show translated labels and proper RTL alignment.

- Smoke tests

  - Check the product card: no category badge on the card, localized "Buy Now"/"Details"/"No Image" strings, and review counts render via translations.
  - Open browser console to observe the centralized i18n debug block (dev only) and ensure there are no repeated "namespace not loaded" warnings.

- Build, typecheck & lint

  ```bash
  npm run build   # runs tsc -b && vite build
  npm run lint
  ```

- Preview production build

  ```bash
  npm run preview
  # then open the preview URL printed by Vite
  ```

- Commit & branch workflow

  ```bash
  git checkout -b feat/your-feature
  git add -A
  git commit -m "feat: short description"
  git push --set-upstream origin feat/your-feature
  ```

- Optional: quick translation parity check (node)

  This one-liner will list keys present in English but missing in Arabic. Run from the repo root (requires Node.js):

  ```bash
  node -e "const en=require('./public/locales/en/translation.json'); const ar=require('./public/locales/ar/translation.json'); const keys=(o)=>Object.keys(o).reduce((acc,k)=>{ if(typeof o[k]==='object') Object.keys((function f(x){return x})(o[k])||{}).forEach(sub=>acc.push(k+'.'+sub)); else acc.push(k); return acc; },[]); const flat=(o,p='')=>Object.entries(o).flatMap(([k,v])=>typeof v==='object'&&v!==null?flat(v,p?`${p}.${k}`:k):[(p?`${p}.`:'')+k]); const enKeys=flat(en); const arKeys=flat(ar); console.log('missing in ar:', enKeys.filter(k=>!arKeys.includes(k)).join('\n')||'none');"
  ```

If you'd like, I can add a small parity script to the repo and a package.json script for convenience.

### Key Development Patterns

#### Component Creation

- Use TypeScript interfaces for props
- Implement responsive design with Tailwind utilities
- Include RTL support for text-heavy components
- Export from appropriate index.ts files

#### Styling Approach

- **Tailwind utilities** for layout, spacing, and responsive design
- **CSS variables** for theme colors and consistent styling
- **Inline styles** only for dynamic or computed values
- **Component-specific styles** in BaseStyles.ts when needed

#### State Management

- Use React Context for global state
- Implement controlled components for forms
- Persist important data in localStorage
- Use proper TypeScript interfaces for state shape

### Browser Support

- **Modern browsers** with ES2020+ support
- **CSS Grid and Flexbox** for layouts
- **CSS custom properties** for theming
- **Responsive design** across all viewport sizes

### Performance Optimizations

- **Optimized builds** with Vite
- **Tree shaking** for unused code elimination
- **Fast development** with hot module replacement
– **Memoization where it counts**: Leaf components with primitive props are wrapped in `React.memo`.
– **Stable callbacks**: Parent components (e.g., Profile page) use `useCallback` to keep function identities stable for memoized children.
– **Pragmatic memo**: High-level composites with local state (e.g., `ProfileHeader`) are intentionally not memoized to avoid complexity with minimal upside.

### Prop Style Convention

To keep code skimmable and consistent, child components use a single `props` parameter and access props as `props.xxx` instead of destructuring long lists at the top of the function. Rationale:

- Easier to scan and refactor, especially in components with many props
- Reduces churn when adding/removing props
- Plays nicely with inline IDE hovers and jump-to-def on `props`

## Changelog (Sep 2025)

- Desktop header nav frame made higher-contrast for easier evaluation
- Mobile header uses a simple dropdown (no overlay) and a minimal hamburger
- Mobile profile dropdown: Profile, Wishlist (badge), Settings, Logout; RTL aware
- Marketplace/Tournaments/Events (mobile): hide SortBy, shorten search placeholder to “Search”, add small search icon button
- Home (mobile): buttons reduced in size and set to ~half-width; labels changed to “Subscribe” and “Tournaments”
- New utilities: `useIsMobile` hook and `IconSearch`

## Architecture Decisions

### Navigation

Hash-based SPA navigation with manual page state management in App.tsx, avoiding the complexity of a full router for this application size.

### Styling Strategy

Moved from CSS-in-JS to Tailwind-first approach for better performance, smaller bundle sizes, and improved developer experience.

### Component Design

Composition over inheritance with TypeScript interfaces, focusing on reusable, responsive components that work across the entire application.

### Internationalization

Runtime translation loading with automatic RTL detection, providing seamless bilingual experience without additional build complexity.
