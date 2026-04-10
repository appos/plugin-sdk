# AppOS Plugin SDK

Developer-facing packages for building plugins for **AppOS**. Type-safe,
ergonomic, zero runtime overhead where it matters.

## Packages

| Package | Purpose | Runtime |
|---------|---------|---------|
| [`@appos.space/plugin-types`](./packages/plugin-types) | TypeScript definitions for the full Plugin API (22 namespaces, 33 permissions). | declaration-only |
| [`@appos.space/view-builders`](./packages/view-builders) | Typed builders for `ViewDescriptor` — `vstack()`, `section()`, `listItem()`, etc. | plain object literals (tree-shakeable) |
| [`@appos.space/plugin-utils`](./packages/plugin-utils) | Pure utility functions — path conversion, formatting, action routing, debounce. | pure functions |

## Install (for plugin authors)

```bash
npm install --save-dev @appos.space/plugin-types
npm install @appos.space/view-builders @appos.space/plugin-utils
```

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

Package versions track the plugin API version. `2.4.x` of any package
corresponds to plugin API `2.4.x`.

## License

MIT © InstantlyEasy — see [LICENSE](./LICENSE).
