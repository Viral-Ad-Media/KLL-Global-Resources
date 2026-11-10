import type { ReactNode } from 'react';

const cx = (...parts: (string | false | undefined)[]) => parts.filter(Boolean).join(' ');

/** Outer markup shared by every widget (heading, text, button, ...), as the theme CSS expects it. */
export function Widget({ id, type, classes, children }: { id: string; type: string; classes?: string[]; children?: ReactNode }) {
  return (
    <div
      className={cx('elementor-element', `elementor-element-${id}`, ...(classes ?? []), 'elementor-widget', `elementor-widget-${type}`)}
      data-id={id}
      data-element_type="widget"
      data-widget_type={`${type}.default`}
    >
      <div className="elementor-widget-container">{children}</div>
    </div>
  );
}

export { cx };
