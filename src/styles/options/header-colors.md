# Header Color Options

A quick reference for recent header background color choices and how to apply them.

## Current choices

- 9CEAEF — Soft aqua (current)
- C4FFF9 — Light minty cyan (previous)
- 5BC0BE — Teal (original, semi-transparent variants used)

## Usage

In `src/components/Header.tsx`, the background is set via a Tailwind arbitrary color class:

- Solid: `bg-[#9CEAEF]`
- With translucency: `bg-[#9CEAEF]/80` (adds 80% opacity)

You can combine with backdrop blur and border styling, for example:

- `backdrop-blur` for subtle glass effect
- `supports-[backdrop-filter]:bg-[color]/70` for Safari-friendly fallback if reintroducing conditional classes
- Border suggestion: `border-b border-[#6FFFE9]/60`

## Notes

- Keep sufficient contrast for nav text/icons. With brighter backgrounds, prefer darker text (e.g., `text-[#0B132B]`).
- If enabling translucency, ensure the header remains legible over varying page backgrounds.
