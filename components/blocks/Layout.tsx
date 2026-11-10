import type { CSSProperties, ReactNode } from 'react';
import type { ColumnBlock, SectionBlock } from '@/lib/blocks';
import { cx } from './Widget';

type SectionProps = Omit<SectionBlock, 'type' | 'columns'> & { style?: CSSProperties; children: ReactNode };

/** A full-width row. Holds columns; its width is boxed by the theme container. */
export function Section({ id, inner, background, overlay, contentMiddle, minHeight, gap = 'default', style, children }: SectionProps) {
  return (
    <section
      className={cx(
        'elementor-section',
        inner ? 'elementor-inner-section' : 'elementor-top-section',
        'elementor-element',
        `elementor-element-${id}`,
        minHeight && 'elementor-section-height-min-height',
        contentMiddle && 'elementor-section-content-middle',
        'elementor-section-boxed',
        'elementor-section-height-default',
        !minHeight && 'elementor-section-height-default',
      )}
      data-id={id}
      data-element_type="section"
      data-settings={background ? '{"background_background":"classic"}' : undefined}
      style={style}
    >
      {overlay && <div className="elementor-background-overlay" />}
      <div className={`elementor-container elementor-column-gap-${gap}`}>{children}</div>
    </section>
  );
}

type ColumnProps = Omit<ColumnBlock, 'type' | 'elements'> & { inner?: boolean; children?: ReactNode };

export function Column({ id, size, inner, background, overlay, children }: ColumnProps) {
  const hasContent = Boolean(overlay) || (Array.isArray(children) ? children.length > 0 : Boolean(children));
  return (
    <div
      className={cx(
        'elementor-column',
        `elementor-col-${size}`,
        inner ? 'elementor-inner-column' : 'elementor-top-column',
        'elementor-element',
        `elementor-element-${id}`,
      )}
      data-id={id}
      data-element_type="column"
      data-settings={background ? '{"background_background":"classic"}' : undefined}
    >
      <div className={cx('elementor-widget-wrap', hasContent && 'elementor-element-populated')}>
        {overlay && <div className="elementor-background-overlay" />}
        {children}
      </div>
    </div>
  );
}
