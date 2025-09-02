# Data Folder

This folder contains all the sample/mock data used throughout the application to keep components clean and maintainable.

## Files

### `products.ts`

Contains product data for the marketplace, including:

- Product interfaces and types
- Sample product data with images from Unsplash
- Product categories for filtering
- Sort options for marketplace
- Export of `SortOption` type

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
import { productData, sortOptions, navigationItems, languages } from "../data";
```

Or import from specific files:

```typescript
import { productData, type Product, type SortOption } from "../data/products";
import { navigationItems } from "../data/navigation";
import { languages } from "../data/languages";
```

## Benefits

1. **Reduced Bundle Size**: Static data is separated from component code
2. **Better Maintainability**: All sample data is centralized
3. **Type Safety**: Proper TypeScript interfaces and types exported
4. **Reusability**: Data can be easily shared between components
5. **Easy Testing**: Mock data can be easily replaced for testing

## Adding New Data

When adding new static data:

1. Create a new file in `src/data/` following the naming convention
2. Export proper TypeScript interfaces/types
3. Add the export to `index.ts`
4. Update this README with the new data description
