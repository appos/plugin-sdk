# AppOS Plugin SDK

Developer-facing packages for building plugins for **AppOS**. Type-safe,
ergonomic, zero runtime overhead where it matters.

## Packages

| Package | Purpose | Runtime |
|---------|---------|---------|
| [`@appos.space/plugin-types`](./packages/plugin-types) | TypeScript definitions for the full Plugin API (43 namespaces, 135 canonical permission scopes). | declaration-only |
| [`@appos.space/view-builders`](./packages/view-builders) | Typed builders for `ViewDescriptor` — `vstack()`, `section()`, `listItem()`, etc. | plain object literals (tree-shakeable) |
| [`@appos.space/plugin-utils`](./packages/plugin-utils) | Pure utility functions — path conversion, formatting, action routing, debounce. | pure functions |

## Install (for plugin authors)

```bash
npm install --save-dev @appos.space/plugin-types
npm install @appos.space/view-builders @appos.space/plugin-utils
```

> **Runtime support:** the runtime packages (`view-builders`, `plugin-utils`)
> ship ESM only. The standard plugin pipeline (esbuild IIFE bundle), `tsx`, and
> native ESM `import` work on any Node line. Plain CommonJS `require()` of these
> packages relies on native `require(esm)`, which needs Node
> `^20.19.0 || ^22.12.0 || >=23` — on older lines (e.g. Node 18, EOL since
> April 2025) use `import` or a bundler instead. This floor applies only to the
> `require()` path, so it is documented here rather than as a package `engines`
> constraint (which would block install for ESM/bundler consumers that work
> fine on older Node lines).

Minimal example:

```ts
import type { PluginContext } from "@appos.space/plugin-types";
import { vstack, section, listItem, button } from "@appos.space/view-builders";
import { formatSize } from "@appos.space/plugin-utils";

export async function activate(ctx: PluginContext) {
  const files = await ctx.fs.readDir(await ctx.fs.home());

  ctx.ui.render(
    vstack([
      section("Home", { icon: "house" },
        files.map((f) =>
          listItem(f.name, { badge: formatSize(f.size), action: `open:${f.name}` }),
        ),
      ),
      button("Refresh", { action: "refresh", style: "primary" }),
    ]),
  );
}
```

## Repo layout

```
plugin-sdk/
├── packages/
│   ├── plugin-types/     # @appos.space/plugin-types
│   ├── view-builders/    # @appos.space/view-builders
│   └── plugin-utils/     # @appos.space/plugin-utils
├── schemas/              # JSON Schema for plugin.json
└── scripts/              # build / sync / validate helpers
```

## Development

```bash
npm install          # install workspace deps
npm run build        # build all packages
npm test             # run all tests
npm run lint         # type-check all packages
```

Each package uses `files: ["dist"]` as its npm allowlist, so only compiled
declarations (and JS, where applicable) ship to consumers.

## Versioning

Package versions track the plugin API version. `3.0.x` of `plugin-types`
corresponds to the AppOS 1.0.0 host surface (waves fn-70 .. fn-101 + fn-118).
Earlier `2.4.x` releases cover only the pre-fn-70 legacy tier (22 namespaces).

## License

MIT © InstantlyEasy — see [LICENSE](./LICENSE).
