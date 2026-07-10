# CommonForge SPARC — UI Prototype

A code prototype of the SPARC dashboard and its component library, built as a
standalone React app. The library is assembled bottom-up (a shared `list-base`
primitive up through the full sidebar and dashboard) and matched to the Figma
design.

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check and build for production
npm run preview  # preview the production build
```

## What is here

- **Dashboard** — the default view: the navigation rail, the KPI cards, and the
  forecast worker-need chart.
- **Component showcase** — open the app and add `#showcase` to the URL to see
  every component and its states rendered flat.

## Sizing

The whole UI scales from a single knob: the root `font-size` in
`src/index.css`. Everything is authored in `rem`, so changing that one value
enlarges or shrinks the entire app uniformly. It is a fixed value and is never
tied to the viewport, so resizing the browser only reflows the layout, it never
rescales the elements.

## Stack

- React 19 + Vite + TypeScript
- Tailwind CSS v4 (CSS-first `@theme`) with a warm-neutral + crimson token layer
- class-variance-authority for component variants
- @untitledui/icons

## Structure

```
src/
  components/     one folder per component (component + variants + index)
  showcase/       the #showcase reference page
  lib/            shared helpers (the cn class-merge util)
  assets/         static assets
  index.css       design tokens + the root font-size knob
  App.tsx         the dashboard entry
```
