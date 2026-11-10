/**
 * Content model for a page. Each page in content/pages/<key>.json is a list of blocks.
 *
 * The layout follows the Elementor page builder the site was designed with (sections that hold
 * columns that hold widgets), so the original theme CSS keeps applying. `id` is the element id
 * from the original site; page-specific styles in content/css/<key>.css target it.
 */

export type ImageAttrs = {
  src: string;
  alt?: string;
  width?: string;
  height?: string;
  srcset?: string;
  sizes?: string;
  class?: string;
  loading?: string;
  decoding?: string;
  fetchpriority?: string;
};

type Base = { id: string; classes?: string[] };

export type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export type HeadingBlock = Base & { type: 'heading'; tag: HeadingTag; size?: string; text: string };
export type TextBlock = Base & { type: 'text'; html: string };
export type SpacerBlock = Base & { type: 'spacer' };
export type HtmlBlock = Base & { type: 'html'; html: string };
export type ButtonBlock = Base & { type: 'button'; text: string; href: string; size: string };
export type ImageBlock = Base & { type: 'image'; image: ImageAttrs };
export type ImageBoxBlock = Base & {
  type: 'image-box';
  image?: ImageAttrs;
  titleTag: HeadingTag;
  title: string;
  description: string | null;
};
export type IconBoxBlock = Base & { type: 'icon-box'; icon: string; titleTag: HeadingTag; title: string; description: string };
export type IconListBlock = Base & { type: 'icon-list'; items: { icon: string; text: string }[] };
export type TabsBlock = Base & { type: 'tabs'; tabIdBase: string; tabs: { title: string; html: string }[] };

export type WidgetBlock =
  | HeadingBlock
  | TextBlock
  | SpacerBlock
  | HtmlBlock
  | ButtonBlock
  | ImageBlock
  | ImageBoxBlock
  | IconBoxBlock
  | IconListBlock
  | TabsBlock;

export type ColumnBlock = {
  type: 'column';
  id: string;
  size: string; // '100', '50', '33', '66', ...
  background?: boolean;
  overlay?: boolean;
  elements: (WidgetBlock | SectionBlock)[];
};

export type SectionBlock = {
  type: 'section';
  id: string;
  inner?: boolean;
  background?: boolean;
  overlay?: boolean;
  contentMiddle?: boolean;
  minHeight?: boolean;
  gap?: string;
  columns: ColumnBlock[];
};

/** The banner at the top of most pages: eyebrow, title and intro, usually on a white card over a photo. */
export type HeroBlock = {
  type: 'hero';
  layout: 'split' | 'boxed' | 'plain';
  id: string;
  ids: { card: string; eyebrow: string; title: string; intro?: string; side?: string; column?: string; inner?: string; spacer?: string };
  eyebrow: string;
  title: string;
  intro?: string;
  image?: string;
};

export type Block = HeroBlock | SectionBlock;

export type PageContent = {
  elementorId: string;
  template?: 'full-width';
  blocks: Block[];
};
