import type { MetadataRoute } from 'next';
import { pages } from '@/lib/content';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map((p) => ({ url: `https://kllglobalresources.com/${p.path ? p.path + '/' : ''}` }));
}
