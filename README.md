# KLL Global Resources website (Next.js)

A Next.js rebuild of kllglobalresources.com, generated from the WordPress backup dated 2026-10-19.
The site is fully static: `next build` writes plain HTML, CSS and images to `out/`, which can be
hosted anywhere.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static site in ./out
npm run start    # preview ./out locally
```

Requires Node 18.18 or newer.

## Deploy

- **Vercel / Netlify**: import the project; the defaults work (build command `npm run build`, output `out`).
- **Any web host (cPanel, S3, etc.)**: run `npm run build` and upload the contents of `out/`.

URLs are the same as on the WordPress site (for example `/services/consulting/risk-management/`),
so existing links and search results keep working.

## How it is organised

| Path | What it is |
| --- | --- |
| `app/[[...slug]]/page.tsx` | One route that renders every page from `content/` |
| `app/layout.tsx`, `app/site.css` | Shared layout, header and menu styles |
| `components/Header.tsx` | Logo and mega menu (desktop hover panels, mobile accordion) |
| `components/Footer.tsx` | Footer |
| `components/ElementorBehaviors.tsx` | Makes the tabs/accordion blocks in page content interactive |
| `content/pages.json` | List of pages with title and meta description |
| `content/html/*.html` | Body content of each page |
| `content/css/*.css` | Page-specific styles |
| `content/nav.json` | Menu structure |
| `public/css/wordpress.css` | Original theme styles (Astra + Elementor) |
| `public/wp-content/uploads/` | Images, at their original paths |
| `scripts/convert-wordpress-backup.py` | The script that generated `content/` and `public/` from the backup |

## Editing content

- Text on a page: edit the matching file in `content/html/`.
- Page title or description: edit `content/pages.json`.
- Menu: edit `content/nav.json`.
- New page: add an HTML file to `content/html/` and an entry in `content/pages.json`.

## Notes on the migration

- 105 pages were rebuilt from the page cache in the backup. The backup contained no database export.
- Left out on purpose: three attachment pages (`/1-1-jpg/`, `/image333-png/`, `/law-image15-7-free-img/`)
  and three unrelated affiliate landing pages (`/tai-lopez/`, `/bird-dog-bot/`, `/1000-pip-builder/`).
- `/services/digital-and-software/` had no page in the backup, so its two menu entries are plain labels.
- The contact form is the same embedded sign-up form the WordPress site used (an iframe from news.aplusmarketer.com).
- Some images inside page content are loaded from lr.org rather than from this site.
- Analytics and Facebook tracking scripts were not carried over.
