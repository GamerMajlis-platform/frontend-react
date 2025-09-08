# Unified `Card` Component (Product | Event | Tournament)

## Goal

Remove duplicated UI logic from `ProductCard`, `EventCard`, `TournamentCard` while **preserving exact visual layout and behavior** and making future card types additive (Open/Closed Principle).

## What Changed

| Before                                                                                      | After                                                                                                                                |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 3 separate components with near‑duplicate image, container, variant, and RTL/wishlist logic | Single `Card` in `src/components/Card.tsx` with three internal preset renderers (`ProductPreset`, `EventPreset`, `TournamentPreset`) |
| Repeated wishlist + RTL detection in only ProductCard                                       | Shared + isolated in product preset (other presets unaffected)                                                                       |
| Variant button logic duplicated across event/tournament                                     | Centralized style maps (`eventVariantStyles`, `tournamentVariantStyles`)                                                             |
| Hard to introduce a new card type without copy/paste                                        | Add new discriminated `preset` branch + props interface (existing presets untouched)                                                 |
| Marketplace / Events / Tournaments / Wishlist imported different components                 | All pages import and use `Card` with `preset` prop                                                                                   |
| Legacy files present                                                                        | Removed (`ProductCard.tsx`, `EventCard.tsx`, `TournamentCard.tsx`) after migration                                                   |

## Open / Closed Principle (OCP) Compliance

The design keeps existing behavior **closed for modification** yet **open for extension**:

1. **Discriminated Union Props** – `preset` narrows prop requirements (`ProductPresetProps | EventPresetProps | TournamentPresetProps`). Adding a new preset creates a _new_ interface & switch branch; existing code paths remain unchanged.
2. **Preset Isolation** – Each preset has its own small renderer function (`ProductPreset`, etc.) so changes to, say, the product layout don’t risk regressions in events or tournaments.
3. **Centralized Variant Maps** – Extending allowed activity states only requires adding a key to `eventVariantStyles` or `tournamentVariantStyles` (pure data, not structural rewrites).
4. **Wishlist / RTL Concerns Scoped** – Only product preset wires wishlist + hover states. Other presets remain lean and unaffected; new presets opt‑in explicitly.
5. **No Runtime Condition Maze in Shared Markup** – Avoids giant conditional blocks that become fragile when extended; each preset returns its own self‑contained JSX.

### How to Add a New Preset (Example: `news`)

1. Define props:

```ts
interface NewsPresetProps extends BaseCardProps {
  preset: "news";
  headline: string;
  source: string;
  publishedOn: string;
}
```

2. Extend `CardProps` union:

```ts
export type CardProps =
  | ProductPresetProps
  | EventPresetProps
  | TournamentPresetProps
  | NewsPresetProps;
```

3. Add switch branch inside `Card`:

```tsx
case "news": return <NewsPreset {...props} />;
```

4. Implement `NewsPreset` (independent layout). No edits to other presets required.

## Migration Notes

| Page              | Old Usage                | New Usage                          |
| ----------------- | ------------------------ | ---------------------------------- |
| `Marketplace.tsx` | `<ProductCard ... />`    | `<Card preset="product" ... />`    |
| `Events.tsx`      | `<EventCard ... />`      | `<Card preset="event" ... />`      |
| `Tournaments.tsx` | `<TournamentCard ... />` | `<Card preset="tournament" ... />` |
| `Wishlist.tsx`    | `<ProductCard ... />`    | `<Card preset="product" ... />`    |

## Removed Files

Deleted after successful migration:

```
src/components/ProductCard.tsx
src/components/EventCard.tsx
src/components/TournamentCard.tsx
```

`components/index.ts` exports for those were removed; only `Card` remains (plus other unrelated components).

## Risk Mitigation

- Preserved all original Tailwind class sequences for each layout (heights, spacing, radii, font sizing).
- Kept product wishlist hover + heart toggle exactly as before (props: `id`, `category`, `productName`, etc.).
- Event & Tournament variant button styles unchanged; labels still map to `upcoming | ongoing | past`.
- Comments retained in `Card.tsx` for traceability.

## Verification Performed

1. TypeScript: No errors after deletion of legacy components.
2. Pages render with identical prop values mapped to new preset props.
3. Wishlist still toggles (product preset only) via `useAppContext`.
4. No residual imports of deleted files (confirmed via grep before final removal).

## Possible Next Enhancements (Deferred)

- Extract common icon SVGs to a tiny `icons.tsx` module for reuse/testing.
- Optional preset registry pattern (`const PRESETS = { product: ProductPreset, ... }`).
- Add lightweight snapshot / visual regression test if a testing framework is introduced later.
- Provide theme tokens instead of hard-coded utility classes for easier design iteration.

---

If reverting is ever needed, recover deleted files from prior commit history, but future extensions should prefer adding a new preset branch.
