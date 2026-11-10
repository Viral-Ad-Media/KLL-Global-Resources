/** @type {import('next').NextConfig} */
const nextConfig = {
  // The site is fully static, so it exports to plain HTML in ./out and can be
  // hosted anywhere (Vercel, Netlify, cPanel, S3...).
  output: 'export',
  trailingSlash: true, // keeps the original WordPress URLs, e.g. /services/training/
  images: { unoptimized: true },
};
export default nextConfig;
