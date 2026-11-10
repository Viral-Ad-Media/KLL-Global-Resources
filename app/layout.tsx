import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ElementorBehaviors from '@/components/ElementorBehaviors';
import { nav } from '@/lib/content';
import './site.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://kllglobalresources.com'),
  title: 'KLL Global Resources, LLC',
  icons: { icon: '/wp-content/uploads/2020/04/cropped-KLL-Logo_Artboard-2-1.png' },
  openGraph: {
    siteName: 'KLL Global Resources, LLC',
    images: ['/wp-content/uploads/2020/04/cropped-KLL-Logo_Artboard-2-1.png'],
  },
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
