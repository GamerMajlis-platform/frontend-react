# GamerMajlis Color Palette

## Primary Palette

_Dark to Light Blue-Teal Spectrum_

| Color Name    | Hex Code  | RGB                | Usage                             |
| ------------- | --------- | ------------------ | --------------------------------- |
| Rich Black    | `#0B132B` | rgb(11, 19, 43)    | Background base, deep shadows     |
| Dark Gunmetal | `#1C2541` | rgb(28, 37, 65)    | Primary dark backgrounds          |
| Independence  | `#3A506B` | rgb(58, 80, 107)   | Secondary backgrounds, borders    |
| Tiffany Blue  | `#5BC0BE` | rgb(91, 192, 190)  | Accent colors, highlights         |
| Aquamarine    | `#6FFFE9` | rgb(111, 255, 233) | Primary brand, CTAs, glow effects |

## Secondary Palette

_Teal-Cyan Spectrum_

| Color Name       | Hex Code  | RGB                | Usage                          |
| ---------------- | --------- | ------------------ | ------------------------------ |
| Persian Green    | `#07BEB8` | rgb(7, 190, 184)   | Dark teal accents              |
| Turquoise        | `#3DCCC7` | rgb(61, 204, 199)  | Mid-range teal                 |
| Medium Turquoise | `#68D8D6` | rgb(104, 216, 214) | Light teal highlights          |
| Powder Blue      | `#9CEAEF` | rgb(156, 234, 239) | Soft highlights                |
| Light Cyan       | `#C4FFF9` | rgb(196, 255, 249) | Lightest accents, hover states |

## CSS Custom Properties

```css
:root {
  /* Primary Palette */
  --rich-black: #0b132b;
  --dark-gunmetal: #1c2541;
  --independence: #3a506b;
  --tiffany-blue: #5bc0be;
  --aquamarine: #6fffe9;

  /* Secondary Palette */
  --persian-green: #07beb8;
  --turquoise: #3dccc7;
  --medium-turquoise: #68d8d6;
  --powder-blue: #9ceaef;
  --light-cyan: #c4fff9;
}
```

## Tailwind Config Colors

```javascript
// Add to tailwind.config.js
colors: {
  // Primary palette
  'rich-black': '#0B132B',
  'dark-gunmetal': '#1C2541',
  'independence': '#3A506B',
  'tiffany-blue': '#5BC0BE',
  'aquamarine': '#6FFFE9',

  // Secondary palette
  'persian-green': '#07BEB8',
  'turquoise': '#3DCCC7',
  'medium-turquoise': '#68D8D6',
  'powder-blue': '#9CEAEF',
  'light-cyan': '#C4FFF9',

  // Aliases for current usage
  primary: '#6FFFE9', // Aquamarine
  'cyan-300': '#6FFFE9', // Aquamarine
}
```

## Usage Guidelines

### Dark Mode Foundation

- **Base Background**: Rich Black (`#0B132B`)
- **Card Backgrounds**: Dark Gunmetal (`#1C2541`)
- **Border Colors**: Independence (`#3A506B`)

### Brand Colors

- **Primary**: Aquamarine (`#6FFFE9`)
- **Secondary**: Tiffany Blue (`#5BC0BE`)
- **Accent**: Persian Green (`#07BEB8`)

### Interactive States

- **Hover**: Light Cyan (`#C4FFF9`)
- **Active**: Turquoise (`#3DCCC7`)
- **Focus**: Medium Turquoise (`#68D8D6`)

### Gradients

```css
/* Primary brand gradient */
background: linear-gradient(to right, #5bc0be, #6fffe9);

/* Secondary gradient */
background: linear-gradient(to right, #07beb8, #3dccc7);

/* Light accent gradient */
background: linear-gradient(to right, #68d8d6, #c4fff9);
```

## Accessibility Notes

- Ensure sufficient contrast ratios when using light colors on dark backgrounds
- Test color combinations for color blindness accessibility
- Use darker colors from the palette for text on light backgrounds
