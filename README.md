# GamerMajlis Frontend Architecture

React 19 gaming platform with TypeScript, Vite, and a hybrid CSS-in-JS/Tailwind architecture. Implements RTL/LTR support, hash-based SPA navigation, modular component system, and a reusable decorative background.

## Architecture Overview

**Stack**: React 19 • TypeScript • Vite • CSS-in-JS + Tailwind v4 • react-i18next \
**Patterns**: Component composition, CSS-in-JS styling, centralized state via Context API \
**Navigation**: Hash-based SPA concept (`window.location.hash`) with manual page state in `App.tsx` \
**Build**: Vite with TypeScript (tsc -b) and asset optimization

---

## Project Structure & Implementation

```
src/
├── components/
│   ├── Button.tsx          # Variant-based button (primary/secondary/link/outline)
│   ├── Header.tsx          # Main header with nav and profile menu
│   ├── Footer.tsx          # Static footer
│   ├── Logo.tsx            # Brand logo with banner/icon modes
│   ├── BackgroundDecor.tsx # Reusable page background (shapes + controller)
│   ├── ProductCard.tsx     # RTL-aware product display
│   ├── ProfileDropdown.tsx # Dropdown with useEffect click-outside
│   ├── LanguageSwitcher.tsx # i18n language toggle
│   ├── ChatBot.tsx         # Context7 integration
│   └── index.ts            # Component exports
├── pages/
│   ├── Home.tsx            # Landing with i18n strings + BackgroundDecor
│   ├── Login.tsx           # CSS-in-JS auth form with autofill detection
│   ├── Signup.tsx          # CSS-in-JS auth form with floating labels
│   ├── Settings.tsx        # React 19 patterns with consolidated useState
│   ├── Marketplace.tsx     # Product grid + filtering; BackgroundDecor applied
│   ├── Wishlist.tsx        # LocalStorage-backed wishlist; BackgroundDecor applied
│   ├── Tournaments.tsx     # BackgroundDecor only (content TBD)
│   ├── Events.tsx          # BackgroundDecor only (content TBD)
│   └── Messages.tsx        # BackgroundDecor only (content TBD)
├── styles/                 # CSS-in-JS modules
│   ├── AuthStyles.ts       # Auth page styles (card, inputs, labels)
│   ├── BaseStyles.ts       # Design tokens and utilities
│   ├── OptimizedStyles.ts  # General component styles
│   └── [Feature]Styles.ts  # Feature-specific styling
├── context/
│   └── AppContext.tsx      # Global state (user, settings, wishlist)
├── i18n/
│   └── config.ts           # react-i18next setup
├── data/                   # Static data
│   ├── products.ts         # Product catalog
│   ├── navigation.ts       # Nav items
│   └── languages.ts        # Language options
└── services/
    └── Context7Service.ts  # External doc service
```

**Key Implementation Details:**

- **Navigation**: No router - uses hash-based navigation with `App.tsx` listening to `hashchange`
- **Auth**: `Login.tsx` and `Signup.tsx` use `AuthStyles.ts` CSS-in-JS for unified styling
- **Forms**: Controlled inputs with `useId()` for unique IDs, floating labels, autofill detection
- **Styling**: Hybrid approach - Tailwind for layout, CSS-in-JS for component-specific styles
- **i18n**: Translation files at `public/locales/[lang]/translation.json` (lazy-loaded via i18next HTTP backend)
- **Background system**: `BackgroundDecor` provides reusable geometric shapes + floating controller background for pages.

---

## Styling System

**Architecture**: CSS-in-JS (TypeScript `CSSProperties`) + Tailwind utilities  
**Pattern**: Feature-specific style modules with shared design tokens

### Style Module Structure

```typescript
// src/styles/AuthStyles.ts - Authentication pages
export const authContainer: CSSProperties = {
  width: "100%",
  minHeight: "100vh",
  backgroundColor: "#0B132B",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export const authCard: CSSProperties = {
  width: "802px",
  minHeight: "520px",
  margin: "40px auto",
  background: "rgba(11, 19, 43, 0.95)",
  borderRadius: "12px",
  padding: "48px 64px 96px",
  backdropFilter: "blur(6px)",
};
```

### Design Tokens (BaseStyles.ts)

```typescript
export const colors = {
  primary: "#6fffe9", // Teal accent
  dark: "#0B132B", // Primary background
  darkCard: "rgba(11, 19, 43, 0.95)", // Card backgrounds
  text: "#ffffff", // Primary text
  textMuted: "rgba(255,255,255,0.6)", // Secondary text
};
```

**Key Patterns:**

- **Floating Labels**: Position `absolute` with transform animations on focus/autofill
- **RTL Awareness**: Dynamic text alignment and layout direction
- **Autofill Handling**: CSS overrides for webkit autofill styling
- **Component Isolation**: Each major feature has dedicated style module

---

## Internationalization (i18n)

**Languages**: English (default) + Arabic (RTL)  
**Library**: react-i18next with JSON translation files  
**RTL Detection**: Automatic based on Unicode character ranges

### Implementation overview

Translations are fetched at runtime using `i18next-http-backend` and language is detected using `i18next-browser-languagedetector`. The app updates `<html lang>` and `<html dir>` on language change to switch between LTR and RTL.

### Translation Structure

```json
// public/locales/en/translation.json
{
  "nav": { "home": "Home", "tournaments": "Tournaments" },
  "auth": {
    "login": "Log In",
    "signup": "Sign Up",
    "email": "Email",
    "or": "or",
    "loginWithDiscord": "Login with Discord"
  },
  "home": { "title": "GAMERMAJLIS", "subtitle": "Join the ultimate..." }
}
```

### RTL Handling

```typescript
// Automatic RTL detection
const isRTLText = (text: string): boolean => {
  return /[\u0600-\u06FF\u0750-\u077F]/.test(text);
};

// Dynamic text alignment
textAlign: isRTLText(text) ? "right" : "left";
```

**Key Features:**

- Unicode-based RTL detection for mixed content
- CSS `direction: rtl` applied automatically
- Font switching (Arabic content uses Tahoma)
- Layout mirroring for buttons, badges, positioning

---

## Reusable Background + z-index layering

The Home background has been refactored into `src/components/BackgroundDecor.tsx` and reused on Marketplace, Wishlist, and the placeholder pages (Tournaments, Events, Messages).

Layering conventions (Tailwind z-utilities):

- BackgroundDecor: `absolute inset-0 z-0 pointer-events-none`
- Page containers/content: `relative z-10`
- Product cards and key content blocks: `relative z-20`
- Header: `relative z-50`
- Profile dropdown backdrop: `z-[900]`
- Profile dropdown menu: `z-[1000]`

These ensure the background is visible but non-interactive, content sits above it, and overlays (dropdowns/modals) always appear on top.

---

## Component Architecture

**Pattern**: Composition over inheritance with TypeScript interfaces  
**State Management**: React hooks with Context API for global state

### Authentication Components

```typescript
// Login.tsx / Signup.tsx - CSS-in-JS auth forms
const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [focus, setFocus] = useState({ email: false, password: false });

  // Autofill detection with useEffect + setTimeout
  useEffect(() => {
    setTimeout(() => {
      const elEmail = document.getElementById(
        `${id}-email`
      ) as HTMLInputElement;
      if (elEmail?.value) setFormData((p) => ({ ...p, email: elEmail.value }));
    }, 150);
  }, [id]);

  return (
    <div style={S.authContainer}>
      <div style={S.authCard}>
        {/* Floating label inputs with focus tracking */}
      </div>
    </div>
  );
};
```

### Button Component

```typescript
interface ButtonProps {
  variant?: "primary" | "secondary" | "link" | "outline";
  size?: "small" | "medium" | "large";
  width?: number;
  height?: number;
  borderRadius?: number;
}

// Usage: <Button variant="link" width={345} height={57} borderRadius={20} />
```

### Navigation Pattern

The app uses a hash-based concept with manual page state inside `App.tsx`. `Header` triggers page changes via the `onSectionChange` prop, and some flows (like login) may set `window.location.hash` for deep-linking.

---

## State Management

**Architecture**: React Context API + localStorage persistence  
**Pattern**: Single global context with feature-specific state slicing

### AppContext Implementation

```typescript
// context/AppContext.tsx
interface AppContextType {
  // User state
  user: User | null;
  settings: UserSettings;
  updateSetting: (key: string, value: any) => void;

  // Wishlist (localStorage backed)
  wishlist: WishlistItem[];
  toggleWishlist: (item: WishlistItem) => void;
  isInWishlist: (id: number) => boolean;

  // Navigation
  activeSection: string;
  setActiveSection: (section: string) => void;
}
```

### Settings Structure

```typescript
interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    marketplace: boolean;
    tournaments: boolean;
  };
  privacy: {
    profileVisibility: "public" | "friends" | "private";
    showOnlineStatus: boolean;
    showGameActivity: boolean;
  };
  preferences: {
    language: string;
    theme: "dark" | "light" | "auto";
    currency: string;
  };
}
```

### Form State Pattern

```typescript
// Controlled inputs with consolidated state
const [formData, setFormData] = useState({
  email: "",
  password: "",
  username: "",
  confirmPassword: "",
});

const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setFormData((prev) => ({ ...prev, [name]: value }));
};
```

---

## Technical Implementation Notes

### Authentication UI

- **Floating Labels**: Labels float above inputs on focus/value using CSS transforms and absolute positioning
- **Autofill Detection**: `useEffect` with 150ms timeout checks DOM for browser-filled values and syncs with React state
- **Form Validation**: Controlled inputs with real-time validation and accessibility (useId for unique IDs)
- **Navigation**: Auth footer links use hash navigation (`window.location.hash = "#page"`)

### RTL Text Handling

- **Detection**: Unicode regex `/[\u0600-\u06FF\u0750-\u077F]/` identifies Arabic characters
- **Layout**: Dynamic CSS `direction`, `textAlign`, and font-family switching
- **Components**: ProductCard, Header, Settings all implement RTL-aware styling

### Performance Considerations

- **Lazy Loading**: Images use `loading="lazy"` attribute
- **Bundle Size**: CSS-in-JS modules prevent unused CSS; Vite tree-shaking
- **State Updates**: Functional state updates prevent unnecessary re-renders
- **Event Handling**: Event delegation and cleanup in useEffect hooks

### Browser Compatibility

- **CSS**: Modern properties with fallbacks (backdrop-filter, CSS grid)
- **JavaScript**: ES2020+ features, Vite transpilation for older browsers
- **Input Styling**: Webkit autofill overrides for consistent appearance across browsers

---

## Development Workflow

```bash
# Install dependencies
npm install  # or bun install

# Development server
npm run dev  # or bun dev

# Build (type check + bundle)
npm run build  # Runs tsc -b && vite build

# Project structure validation
npm run lint  # ESLint + Prettier
```

### File Creation Patterns

- **Components**: TypeScript interface + CSS-in-JS styling + export from index.ts
- **Pages**: Full page component with i18n keys, Context API integration
- **Styles**: Feature-based CSS modules with TypeScript CSSProperties
- **Types**: Interface definitions in /types or inline with components

### Key Dependencies

- react, react-dom
- typescript
- vite
- react-i18next, i18next, i18next-browser-languagedetector, i18next-http-backend
- tailwindcss (utility CSS for layout)

---

## Critical Implementation Details

### Background layering quick reference

Use the z-index conventions listed above to ensure overlays (e.g., dropdowns/modals) render above content and backgrounds across pages.

### Autofill Handling

```typescript
// Login.tsx - Browser autofill detection
useEffect(() => {
  setTimeout(() => {
    const elEmail = document.getElementById(`${id}-email`) as HTMLInputElement;
    if (elEmail?.value) {
      setFocus((p) => ({ ...p, email: true }));
      setFormData((p) => ({ ...p, email: elEmail.value }));
    }
  }, 150);
}, [id]);
```

### CSS-in-JS Pattern

```typescript
// AuthStyles.ts - Consistent styling approach
export const inputLabel: CSSProperties = {
  position: "absolute",
  left: "20px",
  top: "50%",
  transform: "translateY(-50%)",
  color: "rgba(255,255,255,0.6)",
  transition: "all 0.2s ease",
  backgroundColor: "rgba(11, 19, 43, 0.95)", // Matches card background
  padding: "0 8px",
};
```

This architecture prioritizes maintainability, type safety, and consistent UX patterns across the application.
