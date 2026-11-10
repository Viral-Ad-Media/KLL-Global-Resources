import type { ImageAttrs } from '@/lib/blocks';

/** A plain <img> from the content files (static export, so no next/image optimisation). */
export function Img({ image }: { image: ImageAttrs }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={image.src}
      alt={image.alt ?? ''}
      width={image.width}
      height={image.height}
      srcSet={image.srcset}
      sizes={image.sizes}
      className={image.class}
      loading={(image.loading as 'lazy' | 'eager' | undefined) ?? 'lazy'}
      decoding={(image.decoding as 'async' | undefined) ?? 'async'}
    />
  );
}
