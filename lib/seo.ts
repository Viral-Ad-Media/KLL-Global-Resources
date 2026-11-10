import seoJson from '@/content/seo.json';
import { pages, type PageMeta } from '@/lib/content';

// Production address of the site. Canonical URLs, the sitemap, robots.txt and
// structured data are all built from this, so change it here if the domain changes.
export const SITE_URL = 'https://kllglobalresources.com';
export const SITE_NAME = 'KLL Global Resources, LLC';
const SHORT_NAME = 'KLL Global Resources';

// 1200x630 share image used for link previews (Facebook, LinkedIn, X, WhatsApp...).
export const OG_IMAGE = { url: '/og-image.png', width: 1200, height: 630, alt: SITE_NAME };

// Indexing hints for real pages (the 404 page gets Next's own noindex instead).
export const ROBOTS = { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } as const;

type SeoEntry = { title?: string; description: string };
const seo = seoJson as Record<string, SeoEntry>;

const SUFFIX = ` | ${SITE_NAME}`;
const MAX_TITLE = 60; // roughly what Google shows before truncating

/** Page name without the site suffix, e.g. "Solar". */
export function pageName(page: PageMeta): string {
  return page.title.endsWith(SUFFIX) ? page.title.slice(0, -SUFFIX.length) : page.title;
}

/** Title for <title>: a hand-written one from seo.json, or "Name | Brand" kept under ~60 characters. */
export function pageTitle(page: PageMeta): string {
  const custom = seo[page.path]?.title;
  if (custom) return custom;
  const name = pageName(page);
  for (const brand of [SITE_NAME, SHORT_NAME, 'KLL Global']) {
    const t = `${name} | ${brand}`;
    if (t.length <= MAX_TITLE) return t;
  }
  return name;
}

/** Meta description: from seo.json, falling back to the one carried over from WordPress. */
export function pageDescription(page: PageMeta): string {
  return seo[page.path]?.description || page.description;
}

export function pageUrl(path: string): string {
  return path ? `/${path}/` : '/';
}

export const absoluteUrl = (path: string) => `${SITE_URL}${pageUrl(path)}`;

const byPath = new Map(pages.map((p) => [p.path, p]));

/** Home > Section > ... > Page, skipping ancestors that have no page of their own. */
export function breadcrumbs(page: PageMeta): { name: string; url: string }[] {
  const crumbs = [{ name: 'Home', url: absoluteUrl('') }];
  if (!page.path) return crumbs;
  const parts = page.path.split('/');
  for (let i = 1; i <= parts.length; i++) {
    const p = byPath.get(parts.slice(0, i).join('/'));
    if (p) crumbs.push({ name: pageName(p), url: absoluteUrl(p.path) });
  }
  return crumbs;
}

export const organizationJsonLd = {
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/wp-content/uploads/2020/04/KLL-Logo_Artboard-2.png`,
  email: 'aziz@kllglobalresources.com',
  telephone: '+1-877-646-4339',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '1700 South Highway 6 #240',
    addressLocality: 'Houston',
    addressRegion: 'TX',
    postalCode: '77083',
    addressCountry: 'US',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+1-877-646-4339',
    email: 'aziz@kllglobalresources.com',
    contactType: 'customer service',
  },
};

export const websiteJsonLd = {
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: `${SITE_URL}/`,
  name: SITE_NAME,
  publisher: { '@id': `${SITE_URL}/#organization` },
  inLanguage: 'en-US',
};

/** Structured data for one page: the organisation, the site, the page itself and its breadcrumb trail. */
export function pageJsonLd(page: PageMeta) {
  const url = absoluteUrl(page.path);
  const crumbs = breadcrumbs(page);
  const graph: object[] = [
    organizationJsonLd,
    websiteJsonLd,
    {
      '@type': page.path === 'contact' ? 'ContactPage' : 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: pageTitle(page),
      description: pageDescription(page),
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@id': `${SITE_URL}/#organization` },
      inLanguage: 'en-US',
      ...(crumbs.length > 1 ? { breadcrumb: { '@id': `${url}#breadcrumb` } } : {}),
    },
  ];
  if (crumbs.length > 1) {
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: c.url })),
    });
  }
  return { '@context': 'https://schema.org', '@graph': graph };
}

/** Serialise JSON-LD for a <script> tag; escapes "<" so content can never close the tag. */
export const jsonLdString = (data: object) => JSON.stringify(data).replace(/</g, '\\u003c');
