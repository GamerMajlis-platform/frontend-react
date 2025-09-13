# GamerMajlis Frontend

A modern React 19 gaming platform with TypeScript, Vite, and Tailwind CSS. Features responsive design, RTL support, internationalization, and a component-driven architecture.

## Tech Stack

- **React 19** with TypeScript for modern component development
- **Vite 7.1.4** for fast development and optimized builds
- **Tailwind CSS 3.4.14** for utility-first styling
- **react-i18next** for internationalization with English/Arabic support
- **Node + npm** for package management and running scripts

## Project Structure

```
src/
├── components/
│   ├── BackgroundDecor.tsx      # Reusable decorative background
│   ├── Button.tsx               # Variant-based button component
│   ├── Card.tsx                 # Reusable card component
│   ├── ChatBot.tsx              # Enhanced chat interface with RTL support
│   ├── Composer.tsx             # Message composition component
│   ├── ConversationList.tsx     # Chat conversation list
│   ├── Footer.tsx               # Site footer with glassmorphism design
│   ├── Header.tsx               # Main navigation with enhanced styling
│   ├── icons.tsx                # SVG icon components
│   ├── LanguageSwitcher.tsx     # Language toggle (EN/AR)
│   ├── Logo.tsx                 # Brand logo component
│   ├── MessageBubble.tsx        # Individual message component
│   ├── MessageThread.tsx        # Message thread display
│   ├── PreferencesBootstrap.tsx # User preferences initialization
│   ├── ProgressBar.tsx          # Progress bar with glow effects
│   ├── ProfileDropdown.tsx      # User profile dropdown menu
│   ├── SortBy.tsx               # Reusable sort dropdown component
│   └── index.ts                 # Component exports
├── pages/
│   ├── Events.tsx               # Events page
│   ├── Home.tsx                 # Landing page with hero section
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
│   ├── palette.md               # Complete color palette documentation
│   └── options/
│       ├── sort-by-colors.md    # Color documentation for dropdowns
│       └── header-colors.md     # Header color specifications
├── data/
│   ├── events.ts                # Event data and types
│   ├── languages.ts             # Language options
│   ├── navigation.ts            # Navigation items
│   ├── products.ts              # Product catalog
│   ├── profile.ts               # Profile data and utilities
│   ├── tournaments.ts           # Tournament data
│   ├── README.md                # Data layer documentation
│   └── index.ts                 # Data exports
├── hooks/
│   └── usePreferences.ts        # User preferences hook
├── i18n/
│   └── config.ts                # Internationalization setup
├── services/
│   ├── AuthService.ts           # Authentication service
│   └── Context7Service.ts       # External documentation service
└── types/
    └── context7-mcp.d.ts        # TypeScript definitions
```

## Key Features

### Responsive Design

- **Mobile-first approach** with breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Adaptive header** with different layouts for mobile/desktop
- **Mobile navigation** with full-screen overlay dropdown
- **Responsive components** optimized for all screen sizes

### Internationalization (i18n)

- **Bilingual support**: English and Arabic with RTL layout
- **RTL handling**: the app uses the active language (Arabic) to set document `dir` and component-level direction; explicit language checks (e.g. `i18n.language.startsWith('ar')`) are used to flip label/button positions in form fields.
- **Dynamic font switching** (Alice for English, Scheherazade for Arabic)
- **Layout mirroring** for proper RTL experience

### Recent updates (localization & navigation fixes)

- Persisted user language preference across refreshes: the app now reads saved preferences from `localStorage` (`gm_settings`) early during initialization and applies the saved language so the chosen language (e.g., Arabic) survives reloads.
- Fixed i18n race conditions: centralized namespace readiness and a controlled post-init language application in `src/i18n/config.ts` to avoid "access t before namespace loaded" warnings and noisy missing-key logs.
- Login/Signup: input fields and labels are RTL-aware (form `dir`, label positioning, input alignment, and password toggle placement) so fields behave correctly in Arabic.
- Navigation hash behavior: the app no longer force-redirects to Home on refresh. The app now keeps `window.location.hash` synchronized with internal page state so refreshing preserves the current page.
- Replaced repeated sort/dropdown logic with a reusable `SortBy` component and wired translations via `labelKey` values.

#### i18n: common race condition and the project's fix

When translations are loaded at runtime via the HTTP backend, i18next initialization and namespace loading are asynchronous. A common runtime warning is:

```
i18next::translator: key "labels.organizer" ... won't get resolved as namespace "translation" was not yet loaded
```

This happens when code calls `i18n.t(...)` before the backend has finished loading the requested namespace for the active language.

Project fix

- The project centralizes debug logging in `src/i18n/config.ts` and now waits for the namespace to load using `i18n.loadNamespaces(ns)` before calling `i18n.t(...)`. This removes the noisy warning and guarantees translations are available when read.

How to verify

- Start the dev server and open browser DevTools Console. You should see a single grouped block per language titled `i18n translation debug: <lang>` with the requested keys and values (or a single clear missing warning if a key is not present).

Notes on Context7

- The repository integrates with Context7 (see `src/services/Context7Service.ts`) for external documentation and tooling. If you run Context7 locally or via the project's integration, include the Context7 server url in your environment (or set it in the service) to enable richer documentation linking. The i18n debug and README notes can be used alongside Context7 to provide troubleshooting guides to translators or contributors.

### Component Architecture

- **Tailwind-first styling** with utility classes
- **TypeScript interfaces** for type safety
- **Composition patterns** for reusable components
- **Responsive utilities** built into all components

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

CSS variables are used for consistent theming across components:

```css
:root {
  --color-primary: #6fffe9;
  --color-primary-hover: #5ee6d3;
  --color-dark: #0b132b;
  --color-dark-secondary: #1c2541;
  --color-text: #ffffff;
  --color-text-secondary: #94a3b8;
}
```

### Layout Implementation Strategy

The project uses a strategic combination of CSS Grid and Flexbox based on layout complexity and requirements:

#### CSS Grid Implementation

Used for complex layouts requiring precise control over both rows and columns:

**Components using CSS Grid:**

- **Header.tsx (Mobile Layout)**:

  - `grid-cols-[auto_1fr_auto]` for logo, spacer, and hamburger menu
  - Provides consistent alignment across different logo sizes
  - Better control for mobile navigation overlay positioning

- **Settings.tsx**:

  - Main container: `grid grid-cols-1 gap-8` for section organization
  - SettingRow component: `grid-cols-[1fr_auto]` for label/control alignment
  - Responsive breakpoints: `md:grid-cols-2` for larger screens
  - Eliminates flexbox alignment issues with varying content heights

- **Profile.tsx**:
  - Header section: `grid-cols-[auto_1fr_1fr]` for avatar, info, and actions
  - Content sections: `grid gap-6` for consistent spacing
  - Replaces complex absolute positioning with semantic layout structure
  - Better responsive behavior with explicit column definitions

**Grid Usage Criteria:**

- Complex two-dimensional layouts (rows AND columns)
- Need for precise alignment control
- Responsive layouts with changing column structures
- Eliminating absolute positioning complexity

#### Flexbox Implementation

Used for simple linear layouts and component-level organization:

**Components using Flexbox:**

- **Button.tsx**: Simple horizontal icon/text alignment
- **Card.tsx**: Vertical content stacking with `flex-col`
- **Footer.tsx**: Simple grid-like layout using `flex-wrap`
- **Navigation items**: Horizontal menu layouts
- **Message components**: Basic content organization

**Flexbox Usage Criteria:**

- Single-direction layouts (either row or column)
- Simple content alignment and distribution
- Component-internal layouts
- When CSS Grid would be overkill

#### Decision Framework

**Choose CSS Grid when:**

- Layout involves both rows and columns
- Need precise control over element positioning
- Complex responsive requirements with changing structures
- Replacing absolute positioning solutions

**Choose Flexbox when:**

- Simple linear layouts (single direction)
- Basic alignment and space distribution
- Component-level content organization
- Quick and straightforward layout needs

This hybrid approach leverages the strengths of both layout systems while maintaining clean, maintainable code.

### Z-Index Layering

Consistent layering system for proper element stacking:

- **Background**: `z-0` (BackgroundDecor)
- **Content**: `z-10` (Page containers)
- **Interactive elements**: `z-20` (Cards, buttons)
- **Navigation**: `z-50` (Header)
- **Overlays**: `z-[900+]` (Dropdowns, modals)

## Development

### Getting Started

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

### Dev checklist

Quick, repeatable steps for local development and verification:

- Install dependencies

  ```bash
  npm install
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

## Recent Major Updates (September 13, 2025)

### 🎨 Advanced Design System Implementation

Today's session focused on implementing a comprehensive design system with enhanced visual effects, glassmorphism, and consistent brand styling across key components.

#### ✅ **Components with Advanced Styling (Enhanced)**

**1. Profile.tsx**

- **Status**: ✨ **Fully Enhanced** with advanced glassmorphism design
- **Features**:
  - Responsive design with mobile/desktop layouts
  - Complete RTL support with proper text alignment
  - Enhanced glassmorphism effects with backdrop blur
  - Gradient styling throughout (headers, buttons, progress bars)
  - Interactive hover animations and state transitions
  - Custom progress bars with glow effects
  - Extracted data layer to `data/profile.ts` for better separation
- **Styling**: Uses new color palette with tiffany-blue, aquamarine, and rich-black gradients

**2. Header.tsx**

- **Status**: ✨ **Fully Enhanced** with creative brand-focused design
- **Features**:
  - Enhanced logo treatment with controller icon integration
  - Glassmorphism navigation pills with hover effects
  - Creative gradient buttons and backgrounds
  - Professional text-first logo approach
  - Smooth hover animations and glow effects
- **Styling**: Consistent with new palette using gradient combinations

**3. Footer.tsx**

- **Status**: ✨ **Fully Enhanced** with modern glassmorphism cards
- **Features**:
  - Enhanced brand section with creative logo styling
  - Glassmorphism link containers with hover animations
  - Gradient text effects and decorative background elements
  - Responsive layout with proper spacing
- **Styling**: Full integration of new color palette

**4. ChatBot.tsx**

- **Status**: ✨ **Fully Enhanced** with comprehensive UX improvements
- **Features**:
  - Simplified header design (removed text box, kept only close button)
  - Controller logo integration for bot avatar (brand consistency)
  - Enhanced glassmorphism chat window with backdrop blur
  - Smart RTL support for message layout and input direction
  - Advanced animations (staggered message fade-ins, typing indicators)
  - Interactive quick action buttons for common queries
  - Character counter, auto-resize textarea, gradient send button
  - Activity indicators and message count badges
  - Comprehensive responsive design (sm, md breakpoints)
- **Styling**: Uses complete new palette with creative UX elements

**5. BaseStyles.ts**

- **Status**: ✨ **Fully Enhanced** as centralized design system
- **Features**:
  - Cleaned to contain only truly shared design tokens
  - Comprehensive shadow system (small to xl, glow effects)
  - Base component patterns (buttons, containers)
  - RTL utilities for consistent directional styling
  - Color definitions and gradient utilities
- **Purpose**: Single source of truth for shared styling patterns

#### 📋 **Components with Previous Styling (Not Yet Enhanced)**

**1. Home.tsx**

- **Status**: 🔄 **Reverted to Simple Style** (advanced changes removed by user)
- **Current State**: Uses original Figma-based design with basic styling
- **Potential**: Ready for future enhancement with new palette and effects

**2. Login.tsx & Signup.tsx**

- **Status**: 🔄 **Basic Styling**
- **Current State**: Simple form layouts with basic Tailwind utilities
- **Note**: Functional and responsive but not visually enhanced

**3. Marketplace.tsx, Tournaments.tsx, Events.tsx**

- **Status**: 🔄 **Basic Styling**
- **Current State**: Functional layouts with standard card designs
- **Note**: Use basic product/tournament cards without advanced effects

**4. Settings.tsx, Messages.tsx, Wishlist.tsx**

- **Status**: 🔄 **Basic Styling**
- **Current State**: Standard layouts with minimal visual enhancement
- **Note**: Functional but ready for future design improvements

#### 🎨 **New Design System Assets Created**

**1. styles/palette.md**

- **Purpose**: Comprehensive color documentation from Coolors palettes
- **Content**:
  - Primary palette (Rich Black to Aquamarine spectrum)
  - Secondary palette (Persian Green to Light Cyan spectrum)
  - CSS custom properties ready for use
  - Tailwind configuration colors
  - Usage guidelines and gradient combinations
  - Accessibility considerations

**2. Enhanced Tailwind Configuration**

- **Added**: Complete new color palette integration
- **Colors**: Rich-black, dark-gunmetal, independence, tiffany-blue, aquamarine, persian-green, turquoise, medium-turquoise, powder-blue, light-cyan
- **Purpose**: Makes new palette available throughout the application

**3. Enhanced CSS Animations**

- **Added**: Comprehensive animation delay utilities (100ms to 1000ms)
- **Features**: Fade-in animations, staggered element appearances
- **Purpose**: Supports advanced interaction animations

#### 🌍 **Translation Consistency Updates**

**Updated Locations:**

- Home title and subtitle
- Navigation and page references
- Footer links and copyright
- Settings notifications
- Profile form labels
- ChatBot quick actions
- Authentication forms

#### 📊 **Current Enhancement Status Summary**

```
✨ Fully Enhanced (Advanced Styling):
├── 🎮 Profile.tsx (Complete responsive + RTL + glassmorphism)
├── 🏠 Header.tsx (Creative brand-focused design)
├── 🌐 Footer.tsx (Modern glassmorphism cards)
├── 💬 ChatBot.tsx (Comprehensive UX improvements)
└── 🎨 BaseStyles.ts (Centralized design system)

🔄 Basic Styling (Ready for Enhancement):
├── 🏠 Home.tsx (Reverted to simple - ready for future)
├── 🔐 Login.tsx & Signup.tsx (Functional forms)
├── 🛒 Marketplace.tsx (Standard card layouts)
├── 🏆 Tournaments.tsx (Basic tournament cards)
├── 📅 Events.tsx (Simple event listings)
├── ⚙️ Settings.tsx (Standard settings layout)
├── 💬 Messages.tsx (Basic message interface)
└── ❤️ Wishlist.tsx (Simple wishlist display)
```

#### 🎯 **Next Steps for Future Enhancement**

1. **Home.tsx**: Re-apply advanced styling with new palette and effects
2. **Authentication Pages**: Enhance Login/Signup with glassmorphism forms
3. **Content Pages**: Apply advanced styling to Marketplace, Tournaments, Events
4. **Utility Pages**: Enhance Settings, Messages, Wishlist with consistent design
5. **Components**: Create enhanced versions of Card components for consistency

The foundation is now established with a complete design system, comprehensive color palette, and proven enhancement patterns that can be systematically applied to remaining components.

## Architecture Decisions

### Navigation

Hash-based SPA navigation with manual page state management in App.tsx, avoiding the complexity of a full router for this application size.

### Styling Strategy

Moved from CSS-in-JS to Tailwind-first approach for better performance, smaller bundle sizes, and improved developer experience.

### Component Design

Composition over inheritance with TypeScript interfaces, focusing on reusable, responsive components that work across the entire application.

### Internationalization

Runtime translation loading with automatic RTL detection, providing seamless bilingual experience without additional build complexity.
