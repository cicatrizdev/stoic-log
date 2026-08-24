/** Crude but stable: strip code, JSX and markdown syntax, count words. */
export function readingMinutes(source: string): number {
  const text = source
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_[\]()`|-]/g, ' ')
  const words = text.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}
