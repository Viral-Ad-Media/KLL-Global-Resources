import fs from 'node:fs';
import path from 'node:path';
import pagesJson from '@/content/pages.json';
import navJson from '@/content/nav.json';
import redirectsJson from '@/content/redirects.json';
import type { PageContent } from '@/lib/blocks';
import { addResponsiveCss } from './responsive';

export type PageMeta = {
  path: string; // '' for the home page, otherwise e.g. 'services/training'
  key: string; // file name in content/pages/ and content/css/
  title: string;
  description: string;
  elementorId: string | null;
};

export type Redirect = { from: string; to: string };

export type NavItem = { label?: string; href?: string; column?: boolean; children: NavItem[] };

export const pages = pagesJson as PageMeta[];

/** Old URLs of pages that were merged into another page. vercel.json sends a 301 for each. */
export const redirects = redirectsJson as Redirect[];

export const pageUrl = (p: string) => (p ? `/${p}/` : '/');

// Menu links to a merged page point at the page it was merged into. Targets the backup has no
// page for (e.g. /services/digital-and-software/) stay in the menu as plain labels.
const known = new Set(pages.map((p) => pageUrl(p.path)));
const moved = new Map(redirects.map((r) => [pageUrl(r.from), pageUrl(r.to)]));
const fixHref = (href?: string) => {
  if (!href || href === '#') return href;
  const target = moved.get(href) ?? href;
  return known.has(target) ? target : '#';
};
const prune = (items: NavItem[]): NavItem[] => items.map((i) => ({ ...i, href: fixHref(i.href), children: prune(i.children) }));
export const nav = prune(navJson as NavItem[]);

const dir = path.join(process.cwd(), 'content');

export function getPage(slug: string[] | undefined): PageMeta | undefined {
  const p = (slug ?? []).join('/');
  return pages.find((x) => x.path === p);
}

export function getRedirect(slug: string[] | undefined): Redirect | undefined {
  const p = (slug ?? []).join('/');
  return redirects.find((r) => r.from === p);
}

export function getPageContent(page: PageMeta): PageContent {
  return JSON.parse(fs.readFileSync(path.join(dir, 'pages', `${page.key}.json`), 'utf8'));
}

export function getPageCss(page: PageMeta): string {
  const file = path.join(dir, 'css', `${page.key}.css`);
  return fs.existsSync(file) ? addResponsiveCss(fs.readFileSync(file, 'utf8')) : '';
}
