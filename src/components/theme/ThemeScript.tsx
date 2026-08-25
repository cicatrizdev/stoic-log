/**
 * Inline, render-blocking script that applies the stored or OS theme before
 * first paint so there is no flash. Kept tiny and dependency-free on purpose.
 */
const script = `(function(){try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark'){document.documentElement.dataset.theme=t}}catch(e){}})()`

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
