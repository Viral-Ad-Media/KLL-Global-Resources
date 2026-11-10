import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Page not found | KLL Global Resources, LLC' };

export default function NotFound() {
  return (
    <div id="content" className="site-content">
      <div className="kll-404">
        <h1>Page not found</h1>
        <p>The page you are looking for doesn&rsquo;t exist or has moved.</p>
        <Link className="elementor-button" href="/">Back to home</Link>
      </div>
    </div>
  );
}
