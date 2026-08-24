/** Spotify/YouTube page URL → embeddable iframe src. Null for unknown hosts. */
export function embedSrc(url: string): string | null {
  const u = new URL(url)
  if (u.hostname === 'open.spotify.com') {
    const parts = u.pathname.split('/').filter(Boolean)
    const kinds = ['track', 'album', 'playlist', 'episode', 'show']
    const idx = parts.findIndex((p) => kinds.includes(p))
    if (idx < 0 || !parts[idx + 1]) return null
    return `https://open.spotify.com/embed/${parts[idx]}/${parts[idx + 1]}`
  }
  if (u.hostname === 'youtu.be' || u.hostname.endsWith('youtube.com')) {
    const id =
      u.hostname === 'youtu.be'
        ? u.pathname.split('/').filter(Boolean)[0]
        : u.searchParams.get('v')
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : null
  }
  return null
}
