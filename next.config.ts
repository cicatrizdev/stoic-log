import type { NextConfig } from 'next'

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
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
