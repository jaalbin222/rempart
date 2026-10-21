# Rempart: landing page

A static, bilingual (FR/EN) landing page for **Rempart**, a Québec-first company that protects basements before pluvial floods and restores them after.

- No build step: plain HTML, CSS and JS. Every path is relative, so the site works at a GitHub Pages subpath like `/rempart/`.
- `index.html`: page markup. Each string has a `data-i18n` key.
- `assets/i18n.js`: every user-facing string, in English and Québec French.
- `assets/app.js`: language toggle, hero rain, scroll reveals and the interactive platform demo (dashboard, subsidy calculator, storm simulation, home record), plus the waitlist form.
- `assets/styles.css`: design system and responsive layout.
- `assets/favicon.svg`: logo mark.
- `.nojekyll`: tells GitHub Pages to serve the files as they are.

## Language
The page starts in French when `navigator.language` begins with `fr`. Otherwise it starts in English. A visitor's choice is saved in `localStorage` (`rempart-lang`), and `<html lang>` updates to match.

## Waitlist
The early-access form works in the browser only. It checks the inputs and shows a thank-you message, but **nothing is sent or stored**. To collect sign-ups, point the form at a service such as Formspree or Netlify Forms, or use a `mailto:`.

## Run locally
```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy to GitHub Pages
Push these files to a repo (for example `rempart`). Then go to Settings → Pages → Deploy from branch → `main` / root.

## Content notes
The demo uses sample data and is labelled as illustrative. Subsidy figures are public program maximums (Rénoclimat–Adaptation, RénoPlex, Toronto Basement Flooding Protection Subsidy). Problem statistics cite public sources in the small print.
