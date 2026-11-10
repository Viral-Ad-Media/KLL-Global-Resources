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
| `components/Header.tsx`, `components/Footer.tsx` | Logo and mega menu; footer |
| `components/blocks/` | The building blocks pages are made of (see below) |
| `components/ElementorBehaviors.tsx` | Makes the tabs blocks interactive |
| `lib/blocks.ts` | The content model: what each block type holds |
| `content/pages.json` | List of pages (path, name, file key) |
| `content/seo.json` | Meta descriptions and title overrides for search engines |
| `lib/seo.ts` | Site URL, titles, Open Graph and structured data (JSON-LD) |
| `content/pages/*.json` | The content of each page, as a list of blocks |
| `content/css/*.css` | Page-specific styles (spacing, colours) keyed by block `id` |
| `content/redirects.json` | Old URLs of merged pages and where they now point |
| `content/nav.json` | Menu structure |
| `vercel.json` | 301 redirects for the merged pages |
| `public/css/wordpress.css` | Original theme styles (Astra + Elementor) |
| `public/wp-content/uploads/` | Images, at their original paths |
| `scripts/` | The one-off scripts that imported the WordPress backup (see "Notes on the migration") |

### Blocks

Every page is a list of blocks in `content/pages/<page>.json`, rendered by `components/blocks/Blocks.tsx`:

| Block | Component | Used for |
| --- | --- | --- |
| `hero` | `PageHero` | The banner at the top of 90 of the 96 pages: eyebrow, title and intro on a white card over a photo. `layout` is `split` (card on the left), `boxed` (card centred) or `plain` (no photo); `image` is the photo |
| `section` | `Section` | A row holding `columns`; each `Column` holds widgets or nested sections |
| `heading` | `Heading` | A title (`tag` h2 to h5) |
| `text` | `RichText` | Paragraphs, lists and links (HTML) |
| `image-box` | `ImageBox` | Card with an icon or image, title and description |
| `icon-box`, `icon-list` | `IconBox`, `IconList` | Font Awesome icon cards and lists |
| `button`, `image`, `spacer`, `tabs`, `html` | `Button`, `Image`, `Spacer`, `Tabs`, `HtmlEmbed` | As named; `html` holds the contact form embed |

Each block keeps the `id` it had on the WordPress site, because the page styles in `content/css/` refer to it.
A new block needs a new unique `id` (any short hex string).

## Editing content

- Text on a page: edit the matching file in `content/pages/` (look for the `text`, `title` or `html` fields).
- Banner photo: change `image` in the page's `hero` block.
- Page title or meta description for search results: edit `content/seo.json` (keyed by page path; a `title` there overrides the default "Page | KLL Global Resources, LLC").
- Menu: edit `content/nav.json`.
- New page: add a JSON file to `content/pages/` (copy a similar page) and an entry in `content/pages.json`.

## Merged pages

Nine pages were word-for-word copies of another page under a second menu. Each pair is now one page;
the old URL answers with a 301 redirect (`vercel.json`) and the menu links straight to the kept page.
The list is in `content/redirects.json`. On hosts other than Vercel the old URL serves a small
"this page has moved" page that forwards the visitor.

## Notes on the migration

- 105 pages were rebuilt from the page cache in the backup. The backup contained no database export.
  `scripts/convert-wordpress-backup.py` extracted each page's HTML, and `scripts/html-to-blocks.py`
  then turned that HTML into the block files in `content/pages/`. Re-running them would overwrite edits.
- Nine duplicate pages were merged (see "Merged pages"), leaving 96 pages.
- Left out on purpose: three attachment pages (`/1-1-jpg/`, `/image333-png/`, `/law-image15-7-free-img/`)
  and three unrelated affiliate landing pages (`/tai-lopez/`, `/bird-dog-bot/`, `/1000-pip-builder/`).
- `/services/digital-and-software/` had no page in the backup, so its two menu entries are plain labels.
- The contact form is the same embedded sign-up form the WordPress site used (an iframe from news.aplusmarketer.com).
- Some images inside page content are loaded from lr.org rather than from this site.
- Analytics and Facebook tracking scripts were not carried over.

## SEO

- Every page has its own title, meta description, canonical URL, Open Graph and X/Twitter tags, and
  JSON-LD structured data (Organization, WebSite, WebPage and BreadcrumbList).
- `/sitemap.xml` and `/robots.txt` are generated at build time from `content/pages.json`.
  Bump `LAST_MODIFIED` in `app/sitemap.ts` when content changes.
- The site address lives in `SITE_URL` in `lib/seo.ts`.
- Link previews use `public/og-image.png` (1200x630); the favicon is `public/icon.png`.
- Each page has one `<h1>`: the small uppercase page name at the top (the hero `eyebrow`, or a `text`
  block with `"as": "h1"` on pages without a hero). It keeps the eyebrow's look through `.kll-page-title`.
- Give every meaningful image an `alt` in the page JSON; use `"alt": ""` only for decorative icons.
- After launch, add the site to Google Search Console and Bing Webmaster Tools (verify through DNS)
  and submit `https://kllglobalresources.com/sitemap.xml`. Do not reuse the Google verification files
  from the old WordPress backup: they were planted when that site was compromised.
