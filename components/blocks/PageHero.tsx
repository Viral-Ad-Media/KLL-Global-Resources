import type { HeroBlock } from '@/lib/blocks';
import { Column, Section } from './Layout';
import { Heading, RichText, Spacer } from './widgets';

/**
 * Banner at the top of a page: small uppercase eyebrow, title and intro text on a white card,
 * over a darkened photo.
 *
 * - split: card in the left half of the photo
 * - boxed: card centred across the photo, with breathing room below
 * - plain: the same text with no photo
 */
export function PageHero({ layout, id, ids, eyebrow, title, intro, image }: HeroBlock) {
  const text = (
    <>
      <RichText type="text" id={ids.eyebrow} html={eyebrow} as="h1" />
      <Heading type="heading" id={ids.title} tag="h2" text={title} />
      {intro != null && ids.intro && <RichText type="text" id={ids.intro} html={intro} />}
    </>
  );
  const photo = layout !== 'plain';
  const style = image ? { backgroundImage: `url(${image})` } : undefined;
  const className = `kll-hero kll-hero-${layout}`;

  if (layout === 'split') {
    return (
      <Section id={id} className={className} background overlay style={style}>
        <Column id={ids.card} size="50" background>
          {text}
        </Column>
        <Column id={ids.side!} size="50" />
      </Section>
    );
  }
  if (layout === 'boxed') {
    return (
      <Section id={id} className={className} background overlay style={style}>
        <Column id={ids.column!} size="100">
          <Section id={ids.inner!} inner background>
            <Column id={ids.card} size="100" inner>
              {text}
            </Column>
          </Section>
          <Spacer type="spacer" id={ids.spacer!} />
        </Column>
      </Section>
    );
  }
  return (
    <Section id={id} className={className} background={photo} style={style}>
      <Column id={ids.card} size="100">
        {text}
      </Column>
    </Section>
  );
}
