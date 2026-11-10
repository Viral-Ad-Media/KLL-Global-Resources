import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPage, getPageCss, getPageHtml, pages } from '@/lib/content';
import { OG_IMAGE, ROBOTS, SITE_NAME, jsonLdString, pageDescription, pageJsonLd, pageTitle, pageUrl } from '@/lib/seo';

type Props = { params: Promise<{ slug?: string[] }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return pages.map((p) => ({ slug: p.path ? p.path.split('/') : [] }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = getPage((await params).slug);
  if (!page) return {};
  const url = pageUrl(page.path);
  const title = pageTitle(page);
  const description = pageDescription(page);
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    robots: ROBOTS,
    openGraph: { title, description, url, type: 'website', siteName: SITE_NAME, locale: 'en_US', images: [OG_IMAGE] },
    twitter: { card: 'summary_large_image', title, description, images: [OG_IMAGE.url] },
  };
}

export default async function Page({ params }: Props) {
  const page = getPage((await params).slug);
  if (!page) notFound();
  const css = getPageCss(page);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(pageJsonLd(page)) }} />
      {css && <style dangerouslySetInnerHTML={{ __html: css }} />}
      <div dangerouslySetInnerHTML={{ __html: getPageHtml(page) }} />
    </>
  );
}
