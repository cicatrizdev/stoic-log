import type { NextConfig } from 'next'

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://giscus.app https://www.youtube.com https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "frame-src https://giscus.app https://www.youtube.com https://open.spotify.com",
  "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
]

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: { root: process.cwd() },
  experimental: { globalNotFound: true },
  poweredByHeader: false,
  async redirects() {
    // `/` → locale. Order matters: explicit choice (cookie) wins, then the
    // browser's first preferred language, then English. All temporary (307)
    // because the destination varies per visitor.
    return [
      {
        source: '/',
        has: [{ type: 'cookie', key: 'locale', value: 'pt' }],
        destination: '/pt',
        permanent: false,
      },
      {
        source: '/',
        has: [{ type: 'cookie', key: 'locale', value: 'en' }],
        destination: '/en',
        permanent: false,
      },
      {
        source: '/',
        has: [{ type: 'header', key: 'accept-language', value: 'pt.*' }],
        destination: '/pt',
        permanent: false,
      },
      { source: '/', destination: '/en', permanent: false },
    ]
  },
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
}

export default nextConfig
