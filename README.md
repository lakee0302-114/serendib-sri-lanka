# SERENDIB — Sri Lanka Travel Atlas & Bespoke Journeys

An editorial Sri Lanka tourism website designed for both mobile phones and laptops, featuring dual Light/Dark themes, 9 world languages (including RTL Arabic), and modern CSS engineering.

## Architecture Highlights

- **CSS Cascade Layers & Design Tokens**: `@layer reset, base, components, utilities` in [main.css](styles/main.css) backed by [tokens.css](styles/tokens.css) using `color-mix(in oklab, ...)`, `@container` card queries, scroll-driven reading progress (`animation-timeline: scroll()`), and logical properties (`margin-inline`, `inset-inline`) for seamless RTL mirroring.
- **Dual Light & Dark Themes**: Daylight ("Limestone Dawn") and Night ("Obsidian Tea & Brass") modes with zero-flash initial hydration, `prefers-color-scheme` detection, `localStorage` persistence, and View Transitions API circular reveal.
- **14 Dynamic Languages**: Modular script locales under `scripts/locales/` (`en`, `ta`, `hi`, `fr`, `de`, `es`, `it`, `nl`, `pt`, `ru`, `ja`, `ko`, `zh`, `ar` with automatic `dir="rtl"`), complete with script-matched Noto fonts.

## Local Preview

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

Then open `http://127.0.0.1:8765/`.
