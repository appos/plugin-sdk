# @appos.space/plugin-types

TypeScript type definitions for the **AppOS Plugin API**.

Declaration-only package — zero runtime, zero bundle impact. Gives you full
autocomplete and type checking for all 43 plugin namespaces and the full
`PermissionScope` union when authoring plugins for AppOS.

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
  PermissionScope,
} from "@appos.space/plugin-types";

export async function activate(ctx: PluginContext) {
  const dir = await ctx.fileOps.getActiveDirectory();
  ctx.ui.showNotification({ message: `Hello from ${dir}` });
}
```

## What's included

- **Core** — `PluginContext`, `PluginManifest`, activation lifecycle
- **Views** — `ViewDescriptor` union for declarative UI
- **Namespaces** — typed APIs for `fileOps`, `ui`, `shell`, `network`, `storage`, `actions`, and 37 more (the 22 host-core namespaces plus the 21 core-plugin namespaces)
- **Permissions** — `PermissionScope`: the 135 canonical permission scopes you can request in `plugin.json`, plus the dynamic `` oauth.${string} `` family for provider-specific OAuth scopes (e.g. `oauth.github`), plus 5 deprecated legacy aliases kept in the type union for compile-time compatibility only — of those, only `network.fetch` is recognized by the host (normalized to `network.outbound`); `network`, `smartFolders`, and `webview` have no host-side entry, and `shell.uncontained` is never declarable (the uncontained shell tier is inferred from `filesystem.readAll`)
- **Colors / Fonts / Icons** — design tokens matching the host app

## Version

Tracks the plugin API version — the package's `major.minor` matches the plugin API's `major.minor` (e.g. `3.0.x` of this package ↔ plugin API `3.0.x`).

## Related packages

- [`@appos.space/view-builders`](https://www.npmjs.com/package/@appos.space/view-builders) — ergonomic `vstack()` / `listItem()` / `section()` helpers for `ViewDescriptor`
- [`@appos.space/plugin-utils`](https://www.npmjs.com/package/@appos.space/plugin-utils) — shared pure utilities (path conversion, formatting, action routing)

## License

MIT © InstantlyEasy
