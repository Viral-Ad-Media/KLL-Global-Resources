import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ElementorBehaviors from '@/components/ElementorBehaviors';
import { nav } from '@/lib/content';
import { OG_IMAGE, SITE_NAME, SITE_URL } from '@/lib/seo';
import './site.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_NAME,
  applicationName: SITE_NAME,
  formatDetection: { telephone: false, email: false, address: false },
  icons: {
    icon: [{ url: '/icon.png', type: 'image/png', sizes: '512x512' }],
    apple: '/apple-icon.png',
  },
  openGraph: { siteName: SITE_NAME, locale: 'en_US', type: 'website', images: [OG_IMAGE] },
  twitter: { card: 'summary_large_image' },
};

// Body classes carried over from the WordPress (Astra + Elementor) theme so the
// original stylesheet keeps applying to the page content.
const BODY_CLASS =
  'page wp-custom-logo ast-desktop ast-page-builder-template ast-no-sidebar ast-single-post elementor-default elementor-kit-890 elementor-page';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-US">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Lato:400|Lora:400|Roboto:300,400,500,600,700|Roboto+Slab:400,700&display=swap"
        />
        {/* Original theme + page-builder styles, extracted from the WordPress backup */}
        <link rel="stylesheet" href="/css/wordpress.css" />
      </head>
      <body className={BODY_CLASS}>
        <a className="skip-link screen-reader-text" href="#content">Skip to content</a>
        <div id="page" className="hfeed site">
          <Header nav={nav} />
          {children}
          <Footer />
        </div>
        <ElementorBehaviors />
      </body>
    </html>
  );
}
