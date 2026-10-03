// Hold the theme constants shared by the inline script and the composable.
// Keeping them here stops the storage key and the attribute name from drifting apart.

export const THEME_STORAGE_KEY = "theme";

export const THEME_ATTRIBUTE = "data-theme";

// Apply the stored theme while the browser parses the page, before first paint.
// Fall back to the operating system setting when nothing valid is stored.
export const THEME_SCRIPT = `(function(){try{var t=null;try{t=localStorage.getItem("${THEME_STORAGE_KEY}")}catch(e){}if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.setAttribute("${THEME_ATTRIBUTE}",t)}catch(e){}})()`;
