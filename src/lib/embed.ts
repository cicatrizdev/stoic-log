export type SoundtrackEmbed =
  | { provider: 'spotify'; src: string }
  | { provider: 'youtube'; videoId: string }

/**
 * Spotify/YouTube page URL → what the header player needs. YouTube gets the
 * raw video id (the player drives it through the IFrame API, which is the
 * only route to a volume control); Spotify gets a plain embed src — its
 * embed exposes no volume API at all.
 */
export function parseSoundtrack(url: string): SoundtrackEmbed | null {
  const u = new URL(url)
  if (u.hostname === 'open.spotify.com') {
    const parts = u.pathname.split('/').filter(Boolean)
    const kinds = ['track', 'album', 'playlist', 'episode', 'show']
    const idx = parts.findIndex((p) => kinds.includes(p))
    if (idx < 0 || !parts[idx + 1]) return null
    return {
      provider: 'spotify',
      src: `https://open.spotify.com/embed/${parts[idx]}/${parts[idx + 1]}`,
    }
  }
  if (u.hostname === 'youtu.be' || u.hostname.endsWith('youtube.com')) {
    const parts = u.pathname.split('/').filter(Boolean)
    const id =
      u.hostname === 'youtu.be'
        ? parts[0]
        : parts[0] === 'live'
          ? parts[1]
          : u.searchParams.get('v')
    return id ? { provider: 'youtube', videoId: id } : null
  }
  return null
}
