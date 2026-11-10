import fs from 'node:fs';
import path from 'node:path';
import pagesJson from '@/content/pages.json';
import navJson from '@/content/nav.json';

export type PageMeta = {
  path: string; // '' for the home page, otherwise e.g. 'services/training'
  key: string;
  title: string;
  description: string;
  css: boolean;
  elementorId: string | null;
};

export type NavItem = { label?: string; href?: string; column?: boolean; children: NavItem[] };

export const pages = pagesJson as PageMeta[];

// The backup has no page for a couple of menu targets (e.g. /services/digital-and-software/).
// Those entries stay in the menu as plain labels so the site never links to a 404.
const known = new Set(pages.map((p) => (p.path ? `/${p.path}/` : '/')));
const prune = (items: NavItem[]): NavItem[] =>
  items.map((i) => ({
    ...i,
    href: i.href && i.href !== '#' && !known.has(i.href) ? '#' : i.href,
    children: prune(i.children),
  }));
export const nav = prune(navJson as NavItem[]);

const dir = path.join(process.cwd(), 'content');

export function getPage(slug: string[] | undefined): PageMeta | undefined {
  const p = (slug ?? []).join('/');
  return pages.find((x) => x.path === p);
}

export function getPageHtml(page: PageMeta): string {
  return fs.readFileSync(path.join(dir, 'html', `${page.key}.html`), 'utf8');
}

export function getPageCss(page: PageMeta): string {
  return page.css ? fs.readFileSync(path.join(dir, 'css', `${page.key}.css`), 'utf8') : '';
}
