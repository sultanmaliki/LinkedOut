import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Brand marks (mark.svg, logo.svg, logo-dark.svg) are local, trusted
    // files under our own /public, not user-supplied — safe to opt into
    // SVG support with Next's recommended CSP/sandbox mitigations.
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
