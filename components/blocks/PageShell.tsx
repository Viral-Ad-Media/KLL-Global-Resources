import type { ReactNode } from 'react';

/** Theme wrapper around the page body (Astra page template, or the full-width template). */
export function PageShell({ elementorId, template, children }: { elementorId: string; template?: 'full-width'; children: ReactNode }) {
  const body = (
    <div className={`elementor elementor-${elementorId}`} data-elementor-id={elementorId} data-elementor-type="wp-page">
      {children}
    </div>
  );
  return (
    <div className="site-content" id="content">
      <div className="ast-container">
        {template === 'full-width' ? (
          body
        ) : (
          <div className="content-area primary" id="primary">
            <main className="site-main" id="main">
              <article
                className={`post-${elementorId} page type-page status-publish ast-article-single`}
                id={`post-${elementorId}`}
                itemScope
                itemType="https://schema.org/CreativeWork"
              >
                <header className="entry-header ast-no-title ast-header-without-markup" />
                <div className="entry-content clear" itemProp="text">
                  {body}
                </div>
              </article>
            </main>
          </div>
        )}
      </div>
    </div>
  );
}
