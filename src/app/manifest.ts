import type { MetadataRoute } from 'next'
import { site } from '@/content'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: site.name,
    description: `${site.name} — Stoicism × software, by ${site.author}`,
    start_url: '/',
    display: 'minimal-ui',
    background_color: '#12130f',
    theme_color: '#12130f',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
