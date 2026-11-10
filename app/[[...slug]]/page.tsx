import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Blocks } from '@/components/blocks/Blocks';
import { PageShell } from '@/components/blocks/PageShell';
import { getPage, getPageContent, getPageCss, getRedirect, pages, pageUrl, redirects } from '@/lib/content';

type Props = { params: Promise<{ slug?: string[] }> };

export const dynamicParams = false;

const toSlug = (p: string) => ({ slug: p ? p.split('/') : [] });

export function generateStaticParams() {
  return [...pages.map((p) => toSlug(p.path)), ...redirects.map((r) => toSlug(r.from))];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug;
  const redirect = getRedirect(slug);
  if (redirect) {
    return { alternates: { canonical: pageUrl(redirect.to) }, robots: { index: false, follow: true } };
  }
  const page = getPage(slug);
  if (!page) return {};
  const url = pageUrl(page.path);
  return {
    title: { absolute: page.title },
    description: page.description || undefined,
    alternates: { canonical: url },
    openGraph: { title: page.title, description: page.description || undefined, url, type: 'website' },
  };
}

export default async function Page({ params }: Props) {
  const slug = (await params).slug;

  // Merged page. On Vercel, vercel.json answers this URL with a 301 before this file is served;
  // this page is the fallback for hosts that only serve static files.
  const redirect = getRedirect(slug);
  if (redirect) {
    const to = pageUrl(redirect.to);
    return (
      <div className="site-content" id="content">
        <meta httpEquiv="refresh" content={`0; url=${to}`} />
        <div className="ast-container kll-moved">
          <p>
            This page has moved to <a href={to}>{to}</a>.
          </p>
        </div>
      </div>
    );
  }

  const page = getPage(slug);
  if (!page) notFound();
  const content = getPageContent(page);
  const css = getPageCss(page);
  return (
    <>
      {css && <style dangerouslySetInnerHTML={{ __html: css }} />}
      <PageShell elementorId={content.elementorId} template={content.template}>
        <Blocks blocks={content.blocks} />
      </PageShell>
    </>
  );
}
