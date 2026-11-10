import type { ElementType } from 'react';

/** Renders a trusted HTML fragment from the page content files. */
export function Html({ html, as: Tag = 'div', className }: { html: string; as?: ElementType; className?: string }) {
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
