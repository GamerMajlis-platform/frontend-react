# GamerMajlis Frontend

A modern React 19 gaming platform with TypeScript, Vite, and Tailwind CSS. Features responsive design, RTL support, internationalization, and a component-driven architecture.

## Tech Stack

- **React 19** with TypeScript for modern component development
- **Vite 7.1.4** for fast development and optimized builds
- **Tailwind CSS 3.4.14** for utility-first styling
- **react-i18next** for internationalization with English/Arabic support
- **Bun** for fast package management and builds

## Project Structure

```
src/
├── components/
│   ├── BackgroundDecor.tsx      # Reusable decorative background
│   ├── Button.tsx               # Variant-based button component
│   ├── ChatBot.tsx              # Context7 integration
│   ├── Footer.tsx               # Site footer with responsive layout
│   ├── Header.tsx               # Main navigation with mobile/desktop variants
│   ├── LanguageSwitcher.tsx     # Language toggle (EN/AR)
│   ├── Logo.tsx                 # Brand logo component
│   ├── PreferencesBootstrap.tsx # User preferences initialization
│   ├── ProductCard.tsx          # RTL-aware product display
│   ├── ProfileDropdown.tsx      # User profile dropdown menu
│   ├── TournamentCard.tsx       # Tournament display component
│   └── index.ts                 # Component exports
├── pages/
│   ├── Events.tsx               # Events page
│   ├── Home.tsx                 # Landing page with hero section
│   ├── Login.tsx                # Authentication form
│   ├── Marketplace.tsx          # Product marketplace with search/filter
│   ├── Messages.tsx             # Messages page
│   ├── Profile.tsx              # User profile page
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
│   ├── languages.ts             # Language options
│   ├── navigation.ts            # Navigation items
│   ├── products.ts              # Product catalog
│   ├── tournaments.ts           # Tournament data
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

- **Bilingual support**: English (default) and Arabic with RTL layout
- **Automatic RTL detection** based on Unicode character ranges
- **Dynamic font switching** (Alice for English, Scheherazade for Arabic)
- **Layout mirroring** for proper RTL experience

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

The project uses Tailwind CSS 3.4.14 with custom theme extensions:

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
- **ProductCard.tsx**: Vertical content stacking with `flex-col`
- **Footer.tsx**: Simple grid-like layout using `flex-wrap`
- **Navigation items**: Horizontal menu layouts
- **Card components**: Basic content organization

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
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Lint code
bun run lint
```

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

- **Code splitting** with React.lazy for pages
- **Optimized builds** with Vite
- **Tree shaking** for unused code elimination
- **Lazy loading** for images and components

## Architecture Decisions

### Navigation

Hash-based SPA navigation with manual page state management in App.tsx, avoiding the complexity of a full router for this application size.

### Styling Strategy

Moved from CSS-in-JS to Tailwind-first approach for better performance, smaller bundle sizes, and improved developer experience.

### Component Design

Composition over inheritance with TypeScript interfaces, focusing on reusable, responsive components that work across the entire application.

### Internationalization

Runtime translation loading with automatic RTL detection, providing seamless bilingual experience without additional build complexity.
