import type { Block, ColumnBlock, SectionBlock, WidgetBlock } from '@/lib/blocks';
import { Column, Section } from './Layout';
import { PageHero } from './PageHero';
import { Button, Heading, HtmlEmbed, IconBox, IconList, Image, ImageBox, RichText, Spacer, Tabs } from './widgets';

function renderWidget(w: WidgetBlock) {
  switch (w.type) {
    case 'heading':
      return <Heading key={w.id} {...w} />;
    case 'text':
      return <RichText key={w.id} {...w} />;
    case 'spacer':
      return <Spacer key={w.id} {...w} />;
    case 'html':
      return <HtmlEmbed key={w.id} {...w} />;
    case 'button':
      return <Button key={w.id} {...w} />;
    case 'image':
      return <Image key={w.id} {...w} />;
    case 'image-box':
      return <ImageBox key={w.id} {...w} />;
    case 'icon-box':
      return <IconBox key={w.id} {...w} />;
    case 'icon-list':
      return <IconList key={w.id} {...w} />;
    case 'tabs':
      return <Tabs key={w.id} {...w} />;
  }
}

function renderColumn(c: ColumnBlock, inner: boolean) {
  const { elements, type: _type, ...props } = c;
  return (
    <Column key={c.id} {...props} inner={inner}>
      {elements.map((e) => (e.type === 'section' ? renderSection(e) : renderWidget(e)))}
    </Column>
  );
}

function renderSection(s: SectionBlock) {
  const { columns, type: _type, ...props } = s;
  return (
    <Section key={s.id} {...props}>
      {columns.map((c) => renderColumn(c, Boolean(s.inner)))}
    </Section>
  );
}

/** Renders a page's list of blocks (see lib/blocks.ts for the content model). */
export function Blocks({ blocks }: { blocks: Block[] }) {
  return <>{blocks.map((b) => (b.type === 'hero' ? <PageHero key={b.id} {...b} /> : renderSection(b)))}</>;
}
