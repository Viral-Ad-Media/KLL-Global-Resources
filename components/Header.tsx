'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { NavItem } from '@/lib/content';

const LOGO = '/wp-content/uploads/2020/04/cropped-KLL-Logo_Artboard-2-1.png';
const LOGO_2X = '/wp-content/uploads/2020/04/KLL-Logo_Artboard-2.png';

function SubList({ items, depth }: { items: NavItem[]; depth: number }) {
  return (
    <ul className={`kll-sub kll-sub-${depth}`}>
      {items.map((item, i) => (
        <li key={i}>
          {item.href && item.href !== '#' ? (
            <Link href={item.href}>{item.label}</Link>
          ) : (
            <span>{item.label}</span>
          )}
          {item.children.length > 0 && <SubList items={item.children} depth={depth + 1} />}
        </li>
      ))}
    </ul>
  );
}

export default function Header({ nav }: { nav: NavItem[] }) {
  const pathname = usePathname() || '/';
  const [menuOpen, setMenuOpen] = useState(false);
  const [openItem, setOpenItem] = useState<number | null>(null);

  // Close everything after navigating.
  useEffect(() => {
    setMenuOpen(false);
    setOpenItem(null);
  }, [pathname]);

  const isCurrent = (href?: string) =>
    !!href && (href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href));

  return (
    <header id="masthead" className="kll-header">
      <div className="kll-header-inner">
        <Link href="/" className="kll-logo" aria-label="KLL Global Resources, LLC">
          <img src={LOGO} srcSet={`${LOGO} 1x, ${LOGO_2X} 2x`} width={164} height={74} alt="KLL Global Resources, LLC" />
        </Link>

        <nav className={`kll-nav${menuOpen ? ' is-open' : ''}`} aria-label="Site Navigation">
          <button
            type="button"
            className="kll-toggle"
            aria-expanded={menuOpen}
            aria-controls="kll-menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span>MENU</span>
            <span className="kll-toggle-icon" aria-hidden="true" />
          </button>

          <ul id="kll-menu" className="kll-menu">
            {nav.map((item, i) => {
              const hasPanel = item.children.length > 0;
              const open = openItem === i;
              return (
                <li
                  key={i}
                  className={[
                    'kll-item',
                    hasPanel ? 'has-panel' : '',
                    isCurrent(item.href) ? 'is-current' : '',
                    open ? 'is-open' : '',
                  ].join(' ').trim()}
                >
                  <Link href={item.href || '/'} className="kll-link">
                    {item.label}
                    {hasPanel && <span className="kll-caret" aria-hidden="true" />}
                  </Link>
                  {hasPanel && (
                    <>
                      <button
                        type="button"
                        className="kll-expand"
                        aria-label={`${open ? 'Collapse' : 'Expand'} ${item.label}`}
                        aria-expanded={open}
                        onClick={() => setOpenItem(open ? null : i)}
                      />
                      <div className="kll-panel">
                        <div className="kll-panel-inner" style={{ ['--cols' as string]: item.children.length }}>
                          {item.children.map((col, c) => (
                            <div className="kll-col" key={c}>
                              <SubList items={col.children} depth={1} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
