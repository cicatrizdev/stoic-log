/**
 * Inline, render-blocking script that applies the stored or OS theme before
 * first paint so there is no flash. Kept tiny and dependency-free on purpose.
 */
const script = `(function(){var t;try{t=localStorage.getItem('theme')}catch(e){}if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t})()`

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
