# Data Folder

This folder contains essential static data used throughout the application.

## Files

### `navigation.ts`

Contains navigation data for the header component:

- Navigation items with translation keys
- Includes key mappings for routing

### `languages.ts`

Contains language data for the language switcher:

- Available languages (English, Arabic)
- Language codes, names, and flag emojis

### `index.ts`

Main export file that re-exports all data modules for easy importing.

## Usage

Import data from the main index file:

```typescript
import { navigationItems, languages } from "../data";
```

Or import from specific files:

```typescript
import { navigationItems } from "../data/navigation";
import { languages } from "../data/languages";
```

## Benefits

1. **Reduced Bundle Size**: Static data is separated from component code
2. **Better Maintainability**: All essential data is centralized
3. **Type Safety**: Proper TypeScript interfaces and types exported
4. **Reusability**: Data can be easily shared between components

## Adding New Data

When adding new static data:

1. Create a new file in `src/data/` following the naming convention
2. Export proper TypeScript interfaces/types
3. Add the export to `index.ts`
4. Update this README with the new data description
