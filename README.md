# Craniofacial Growth web app

Static, client-side craniofacial growth percentile calculator. The built
site has no server component: `dist/index.html` can be opened directly
from disk, served from GitHub Pages, or embedded in Google Sites.

This public repository holds only the web app. The percentile models, the
original Shiny app, and the R scripts that generate the data files live in
a separate private repository (`CF_Percentiles_App`).

## Layout

- `src/` Svelte 5 + TypeScript source. `src/lib/percentiles.ts` holds the
  calculations ported from `includes.R`.
- `data/` Percentile tables as JSON, one file per sex and trait, plus
  `traits.json` (trait list, abbreviations, landmark coordinates).
  Generated in the private repository by `scripts/convert_percentiles.R`
  and copied here. These files are read directly by the tests.
- `scripts/prepare-static.mjs` Runs automatically before `npm run dev`
  and `npm run build`. Wraps each `data/*.json` into `public/data/*.js`
  (a script that calls `cfData(key, payload)`) and copies Plotly into
  `public/vendor/plotly.min.js`. Both output folders are gitignored.
- `tests/` Vitest suite checked against fixtures produced by
  `scripts/generate_test_fixtures.R` in the private repository.

## Why script tags instead of fetch

When a page is opened from disk (`file://`), browsers block module
scripts, `fetch()`, and dynamic `import()`, but still allow classic
`<script src>` tags. The build therefore emits a single classic script for
the app, and data files and Plotly are loaded on demand through
`src/lib/loadScript.ts`. The same output works unchanged over HTTP.

## Commands

```
npm ci              # install (once)
npm run dev         # dev server with hot reload
npm run check       # svelte-check + tsc
npx vitest run      # tests
npm run build       # production build into dist/
npm run preview     # serve dist/ over HTTP
```

To update the data after the percentile tables change, run in the
private repository:

```
Rscript scripts/convert_percentiles.R
Rscript scripts/generate_test_fixtures.R
```

then copy `webapp/data/` and `webapp/tests/fixtures/` from there into this
repository.

## Opening locally

After `npm run build`, open `dist/index.html` in a browser. The whole
`dist/` folder must stay together (it holds the images, data, Plotly, and
the Terms of Service page).

## Deploying to GitHub Pages

`.github/workflows/deploy.yml` builds and deploys on every push to
`main`, and can also be run by hand from the Actions tab. The first run creates the Pages site; if that step is
refused, enable Pages once under Settings > Pages with Source set to
"GitHub Actions". The site URL is shown on the workflow's deploy job.

## Embedding in Google Sites

Google Sites cannot host files, so it embeds the GitHub Pages site. In the
Sites editor choose Insert > Embed > By URL, paste the Pages URL, and
choose "Whole page". The theme choice and disclaimer acknowledgment are
stored in the browser and persist inside the embed.
