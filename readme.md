# Athryn Creative Industries — Company Profile Website

Static single-page website. HTML5, CSS3, vanilla JavaScript. No build step, no backend.

## Run locally
Open `index.html` in a browser.

## Deploy to GitHub Pages
1. Push the project to a GitHub repository (files at the repo root).
2. Settings → Pages → Source: "Deploy from a branch" → branch `main`, folder `/ (root)`.
3. Wait for the site URL, then update `og:url`, `og:image` (absolute URL), and canonical in `index.html`.

Note: GitHub Pages is case-sensitive. Keep file names and paths exactly as referenced.

## Structure
index.html
css/style.css
js/script.js
assets/{logo,images,icons}

## Assets to replace
- [ ] Logo (navbar + footer wordmark) → `assets/logo/`
- [ ] Favicon → `assets/logo/favicon.png`, then replace the temporary data-URI favicon in `<head>`
- [ ] Open Graph image, 1200×630 → `assets/images/og-image.jpg`
- [ ] Hero photo → `assets/images/hero.jpg` (currently a hotlinked Pexels image, representative only)
- [ ] Product photos → replace the icon placeholders in `#products`
- [ ] Portfolio photos → replace the icon placeholders in `#portfolio` (remove the "representative" note once real)
- [ ] Brand colors → `:root` in `css/style.css` (current hex values are placeholders)

## Content rules
Only information from the PRD is used. Do not add client names, statistics, certifications, testimonials, or production capacity unless confirmed.