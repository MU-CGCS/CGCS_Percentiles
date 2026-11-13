/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// The built page must work when index.html is opened directly from disk
// (file://), where browsers block module scripts, crossorigin
// stylesheets, fetch() and dynamic import(). So the app is bundled as a
// single classic script and the generated HTML tags are rewritten to
// plain <script defer> / <link> tags. Data and Plotly are loaded at run
// time as classic scripts too (see src/lib/loadScript.ts).
function classicScriptHtml(): Plugin {
  return {
    name: 'cf-classic-script-html',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html) {
        return html
          .replace(
            /<script type="module" crossorigin src="([^"]+)"><\/script>/g,
            '<script defer src="$1"></script>',
          )
          .replace(
            /<link rel="stylesheet" crossorigin href="([^"]+)">/g,
            '<link rel="stylesheet" href="$1">',
          )
      },
    },
  }
}

// base './' so the same build works on GitHub Pages subpaths and from
// file:// (both need relative asset paths).
export default defineConfig({
  base: './',
  plugins: [svelte(), classicScriptHtml()],
  build: {
    modulePreload: false,
    cssCodeSplit: false,
    rolldownOptions: {
      output: {
        format: 'iife',
      },
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
})
