# AppOS Plugin SDK — docs site

Automated developer documentation for the AppOS Plugin SDK, built with
[Astro Starlight](https://starlight.astro.build) and
[TypeDoc](https://typedoc.org) (via
[starlight-typedoc](https://github.com/HiDeoo/starlight-typedoc)).

Deployed target: **https://docs.appos.space** (Cloudflare Pages — see
`.github/workflows/docs.yml`).

## Quick start

```bash
cd docs-site
npm install
npm run dev        # generate data pages + local dev server (localhost:4321)
```

## Commands

| Command | What it does |
|---------|--------------|
| `npm run dev` | Regenerates data pages, then starts the dev server |
| `npm run generate` | Regenerates the committed data-driven pages from `schemas/` + `packages/plugin-types/src/` |
| `npm run check-drift` | Drift gate — fails if committed generated pages are stale vs the sources (used in CI) |
| `npm run build` | Full production build: generate → astro build (incl. TypeDoc API reference) → `dist/llms.txt` + `dist/llms-full.txt` |
| `npm run preview` | Serves the last `dist/` build |

## How the pipeline fits together

1. **API Reference** — three `starlight-typedoc` instances (one per SDK
   package) run TypeDoc over `packages/*/src/index.ts` during `astro build`
   and write markdown into `src/content/docs/api/` (**gitignored** —
   regenerated every build; never edit or commit it).
2. **Data-driven pages** — `scripts/generate-docs-data.mjs` extracts the
   permission-scope catalog, manifest field reference, runtime limits,
   namespace map, and extension-point/contribution tables from
   `schemas/plugin-v1.json`, `schemas/constraints.json`,
   `packages/plugin-types/src/permissions.ts`, and
   `packages/plugin-types/src/core.ts`. Its outputs **are committed**; the
   `check-drift` mode is the CI gate that keeps them in sync with the
   sources (`generated-docs.hash` records the input hash).
3. **llms.txt** — `scripts/generate-llms-txt.mjs` runs after `astro build`
   and emits `dist/llms.txt` (index) and `dist/llms-full.txt` (full corpus:
   every docs page + the SDK type sources + the manifest schemas) per the
   [llms.txt convention](https://llmstxt.org).

## Editing content

- Hand-written pages live in `src/content/docs/` (everything except
  `api/` and the pages carrying a `GENERATED FILE` banner).
- Generated pages: edit the **sources** (`schemas/`,
  `packages/plugin-types/src/`) or the generator script, then run
  `npm run generate` and commit the result.

## Deployment

- The site deploys to **Cloudflare Pages** (project `appos-docs`, live at
  <https://docs.appos.space>) via the `deploy` job in
  `.github/workflows/docs.yml`, which runs on every push to `main` after
  the build job succeeds. The required repo secrets
  (`CLOUDFLARE_API_TOKEN` with "Cloudflare Pages: Edit" +
  `CLOUDFLARE_ACCOUNT_ID`) are configured on the repository.

## Known stubs / TODOs

- **Extension-point payload schemas** and the **host event-topic catalog**
  are owned by the AppOS host repo and are not machine-readable from this
  repo yet. The corresponding pages carry explicit TODO callouts and will
  grow generated tables once the host exports those catalogs.
