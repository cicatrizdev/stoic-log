import type { ComponentPropsWithoutRef } from 'react'
import type { MDXComponents } from 'mdx/types'
import Link from 'next/link'
import { Callout } from './Callout'
import { Epigraph } from './Epigraph'

function Anchor({ href = '', ...rest }: ComponentPropsWithoutRef<'a'>) {
  if (href.startsWith('/') || href.startsWith('#')) {
    return <Link href={href} {...rest} />
  }
  return <a href={href} target="_blank" rel="noopener noreferrer" {...rest} />
}

/**
 * The fixed component contract available inside posts. MDX files cannot import
 * arbitrary code — anything an essay needs must be registered here.
 */
export const mdxComponents: MDXComponents = {
  a: Anchor,
  Callout,
  Epigraph,
}
