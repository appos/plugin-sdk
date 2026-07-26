# @appos.space/plugin-types

TypeScript type definitions for the **AppOS Plugin API**.

Declaration-only package — zero runtime, zero bundle impact. Gives you full
autocomplete and type checking for all 22 plugin namespaces and 33 permissions
when authoring plugins for AppOS.

## Install

```bash
npm install --save-dev @appos.space/plugin-types
```

## Usage

Import the types you need (the package ships module exports only — no
ambient globals):

```ts
import type {
  PluginContext,
  PluginManifest,
  ViewDescriptor,
  Permission,
} from "@appos.space/plugin-types";

export async function activate(ctx: PluginContext) {
  const home = await ctx.fs.home();
  ctx.ui.notify({ title: "Hello", body: home });
}
```

## What's included

- **Core** — `PluginContext`, `PluginManifest`, activation lifecycle
- **Views** — `ViewDescriptor` union for declarative UI
- **Namespaces** — typed APIs for `fs`, `ui`, `shell`, `http`, `kv`, `secrets`, and 16 more
- **Permissions** — the 33 permission literals you can request in `plugin.json`
- **Colors / Fonts / Icons** — design tokens matching the host app

## Version

Tracks the plugin API version. `2.4.x` of this package ↔ plugin API `2.4.x`.

## Related packages

- [`@appos.space/view-builders`](https://www.npmjs.com/package/@appos.space/view-builders) — ergonomic `vstack()` / `listItem()` / `section()` helpers for `ViewDescriptor`
- [`@appos.space/plugin-utils`](https://www.npmjs.com/package/@appos.space/plugin-utils) — shared pure utilities (path conversion, formatting, action routing)

## License

MIT © InstantlyEasy
