// Load a file as a classic <script src> tag. Unlike fetch() and dynamic
// import(), classic scripts are allowed when the page is opened directly
// from disk (file://), so this is how the static build loads its data
// files and the Plotly bundle.

const cache = new Map<string, Promise<void>>();

export function loadScript(url: string): Promise<void> {
  let promise = cache.get(url);
  if (!promise) {
    promise = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        cache.delete(url);
        script.remove();
        reject(new Error(`Failed to load script: ${url}`));
      };
      document.head.appendChild(script);
    });
    cache.set(url, promise);
  }
  return promise;
}
