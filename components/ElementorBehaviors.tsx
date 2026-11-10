'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Small replacement for the Elementor front-end script: makes the tabs and
 * accordion widgets in the imported page content interactive.
 */
export default function ElementorBehaviors() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.getElementById('content');
    if (!root) return;

    const showTab = (widget: Element, tab: string) => {
      widget.querySelectorAll<HTMLElement>('.elementor-tab-title').forEach((t) => {
        const on = t.dataset.tab === tab;
        t.classList.toggle('elementor-active', on);
        t.setAttribute('aria-selected', String(on));
      });
      widget.querySelectorAll<HTMLElement>('.elementor-tab-content').forEach((c) => {
        const on = c.dataset.tab === tab;
        c.classList.toggle('elementor-active', on);
        c.style.display = on ? 'block' : 'none';
        c.hidden = !on;
      });
    };

    root.querySelectorAll('.elementor-widget-tabs').forEach((w) => showTab(w, '1'));
    root.querySelectorAll('.elementor-widget-accordion').forEach((w) => {
      const first = w.querySelector<HTMLElement>('.elementor-tab-title');
      const content = w.querySelector<HTMLElement>('.elementor-tab-content');
      first?.classList.add('elementor-active');
      if (content) content.style.display = 'block';
    });

    const onClick = (e: Event) => {
      const title = (e.target as Element).closest<HTMLElement>('.elementor-tab-title');
      if (!title || !root.contains(title)) return;
      const tabs = title.closest('.elementor-widget-tabs');
      if (tabs && title.dataset.tab) {
        e.preventDefault();
        showTab(tabs, title.dataset.tab);
        return;
      }
      const acc = title.closest('.elementor-widget-accordion');
      if (acc) {
        e.preventDefault();
        const wasOpen = title.classList.contains('elementor-active');
        acc.querySelectorAll<HTMLElement>('.elementor-tab-title').forEach((t) => t.classList.remove('elementor-active'));
        acc.querySelectorAll<HTMLElement>('.elementor-tab-content').forEach((c) => (c.style.display = 'none'));
        if (!wasOpen) {
          title.classList.add('elementor-active');
          const c = title.parentElement?.querySelector<HTMLElement>('.elementor-tab-content');
          if (c) c.style.display = 'block';
        }
      }
    };
    root.addEventListener('click', onClick);
    return () => root.removeEventListener('click', onClick);
  }, [pathname]);

  return null;
}
