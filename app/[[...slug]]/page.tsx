import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPage, getPageCss, getPageHtml, pages } from '@/lib/content';

type Props = { params: Promise<{ slug?: string[] }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return pages.map((p) => ({ slug: p.path ? p.path.split('/') : [] }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = getPage((await params).slug);
  if (!page) return {};
  const url = page.path ? `/${page.path}/` : '/';
  return {
    title: { absolute: page.title },
    description: page.description || undefined,
    alternates: { canonical: url },
    openGraph: { title: page.title, description: page.description || undefined, url, type: 'website' },
  };
}

export default async function Page({ params }: Props) {
  const page = getPage((await params).slug);
  if (!page) notFound();
  const css = getPageCss(page);
  return (
    <>
      {css && <style dangerouslySetInnerHTML={{ __html: css }} />}
      <div dangerouslySetInnerHTML={{ __html: getPageHtml(page) }} />
    </>
  );
}
