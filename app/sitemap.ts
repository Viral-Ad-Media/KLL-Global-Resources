import type { MetadataRoute } from 'next';
import { pages } from '@/lib/content';
import { absoluteUrl } from '@/lib/seo';

export const dynamic = 'force-static';

// Date of the last content update, shown to search engines as <lastmod>.
// Bump it when page content changes.
const LAST_MODIFIED = '2026-11-10';

export default function sitemap(): MetadataRoute.Sitemap {
  return [...pages].sort((a, b) => a.path.localeCompare(b.path)).map((p) => {
    const depth = p.path ? p.path.split('/').length : 0;
    return {
      url: absoluteUrl(p.path),
      lastModified: LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: depth === 0 ? 1 : depth === 1 ? 0.8 : depth === 2 ? 0.6 : 0.5,
    };
  });
}
