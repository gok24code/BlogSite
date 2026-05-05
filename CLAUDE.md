# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A static HTML blog site focused on Turkish culture, language, and identity (Türklük ve Türk Şuuru). The site is deployed on Vercel with clean URL configuration.

## Architecture

### Directory Structure

```
BlogSite/
├── index.html                              # Homepage with featured blog posts
├── yazilar.html                            # All posts listing page
├── kultur-ve-dil-farkindaligi.html         # Blog post pages
├── turk-kimligi.html
├── turk-mimarisi.html
├── divanu-lugatit-turk.html
├── assets/
│   ├── styles.css                          # Single stylesheet with CSS variables
│   ├── script.js                           # Vanilla JS (no frameworks)
│   └── blog-data.json                      # Post metadata: titles, featured images
├── vercel.json                             # Vercel config: cleanUrls enabled
└── README.md
```

### Technology Stack

- **HTML5**: Semantic markup, no templating engine
- **CSS3**: Custom properties (CSS variables), no preprocessor; dark theme with Turkish red primary color (#B31B1B)
- **Vanilla JavaScript**: ES6+ (no frameworks); handles smooth scrolling, Intersection Observer animations, and dynamic image loading from JSON
- **Deployment**: Vercel with clean URLs (no .html extensions)

### How Data Works

Blog post metadata is centralized in `assets/blog-data.json`:
- Stores post IDs (slugs), titles, and featured image URLs (Unsplash)
- `script.js` fetches this JSON on page load and populates images in blog cards and article pages
- Each HTML page uses `data-post-id` attributes to match against the JSON data
- Changing an image URL only requires updating JSON, not touching HTML

### Page Structure

Each blog post HTML page:
- Includes `data-post-id` on the `<body>` tag
- Has a `.blog-card-image` element where the featured image will be inserted
- Hardcoded content in HTML; only the featured image is dynamic

## Development

### Testing Locally

**Option 1: Direct browser** (minimal testing)
```powershell
# Open in browser directly
Start-Process index.html
```

**Option 2: Vercel CLI** (recommended; respects vercel.json clean URL rules)
```powershell
npm install -g vercel  # One-time install if needed
vercel dev
# Opens http://localhost:3000
```

### Editing Content

1. **Blog post HTML**: Edit the post file directly (e.g., `kultur-ve-dil-farkindaligi.html`)
2. **Featured images**: Update the post entry in `assets/blog-data.json`
3. **Navigation/layout**: Modify `assets/styles.css` and `assets/script.js`

### Adding a New Blog Post

1. Create a new `.html` file (e.g., `my-post.html`)
2. Use an existing post file as template
3. Set `data-post-id="my-post"` on the `<body>` tag
4. Add entry to `assets/blog-data.json`:
   ```json
   "my-post": {
       "image": "https://images.unsplash.com/...",
       "title": "Post Title"
   }
   ```
5. Add link to `index.html` and `yazilar.html` blog card sections

### CSS Customization

Edit `assets/styles.css` root variables to change the theme:
- `--primary-color`: Brand color (Turkish red #B31B1B by default)
- `--text-dark`, `--text-light`, `--bg-light`: Text and background colors
- `--shadow`, `--shadow-lg`: Box shadow effects

All color and spacing uses CSS variables for consistency.

### JavaScript Features

- **Smooth scrolling**: `a[href^="#"]` links scroll to targets
- **Scroll animations**: `.blog-card` elements fade in with Intersection Observer when scrolled into view
- **Dynamic image loading**: `loadDynamicImages()` fetches `blog-data.json` and populates featured images

## Deployment

Site is deployed to Vercel. When a commit is pushed to the main branch:
1. Vercel automatically detects the push
2. Builds and deploys (no build step; just copies static files)
3. Live at https://proje-adi.vercel.app (or configured domain)

`vercel.json` enforces:
- Clean URLs: `/post` instead of `/post.html`
- No trailing slashes

## Vercel CLI Commands

```powershell
# Local development server
vercel dev

# Deploy to production
vercel

# Link current folder to Vercel project (if not already linked)
vercel link
```

## SEO and Meta Tags

- Each page has `<meta name="description">` for search results
- Open Graph meta tags (image, title, description) in HTML for social sharing
- Favicon is inline SVG (moon emoji)
- Language tag: `<html lang="tr">` for Turkish

## Notes for Future Work

- **No build process**: Changes to HTML, CSS, or JS are instant; just refresh the browser or `vercel dev`
- **No client-side routing**: Each URL maps to a static HTML file; navigation is traditional page loads
- **Image hosting**: Featured images are external (Unsplash); ensure URLs remain valid
- **Framework-free**: Intentionally minimal JavaScript; avoid adding heavy dependencies
