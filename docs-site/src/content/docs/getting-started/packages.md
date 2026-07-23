---
title: SDK packages
description: What each of the three SDK packages provides.
sidebar:
  order: 3
---

## @appos.space/plugin-types

TypeScript type definitions for the **AppOS Plugin API**. Declaration-only —
zero runtime, zero bundle impact.

- **Core** — `PluginContext`, `PluginManifest`, activation lifecycle,
  dependency management types
- **Views** — the `ViewDescriptor` union for declarative UI
- **Namespaces** — typed APIs for all 43 `context.*` namespaces (legacy tier
  `commands` / `fileOps` / `ui` / `shell` / … plus the core-plugin tier
  `store` / `vault` / `actions` / `scheduler` / `resources` / `entities` /
  `notifications` / `llm` / …)
- **Permissions** — all 135 canonical permission scopes plus legacy aliases
- **Colors / Fonts / Icons** — design tokens matching the host app

```bash
npm install --save-dev @appos.space/plugin-types
```

Versioning: `3.0.x` corresponds to the AppOS 1.0.0 host surface (waves
fn-70 … fn-101 + fn-118). Earlier `2.4.x` releases cover only the pre-fn-70
legacy tier (22 namespaces).

## @appos.space/view-builders

Typed builder helpers for `ViewDescriptor`. Produces plain object literals —
**zero runtime overhead**, fully tree-shakeable.

```ts
import { vstack, section, listItem, button } from "@appos.space/view-builders";

const view = vstack([
  section("Files", { icon: "doc.on.doc", badge: "3" }, [
    listItem("readme.md", { icon: "doc", action: "open:readme" }),
  ]),
  button("Add", { action: "add-file", style: "primary" }),
]);
```

| Category | Helpers |
|---|---|
| Containers | `vstack`, `hstack`, `scroll`, `list`, `grid`, `section` |
| Content | `text`, `label`, `image`, `badge`, `button`, `listItem` |
| Primitives | `divider`, `spacer`, `textField`, `progress`, `remoteImage` |
| Menus | `menuAction`, `menuDivider`, `encodeMenuActions` |

## @appos.space/plugin-utils

Pure utility functions — host-agnostic, side-effect free, tree-shakeable.

```ts
import { formatSize, urlToPath, createActionRouter, debounce } from "@appos.space/plugin-utils";

urlToPath("file:///Users/foo/my%20file.txt"); // "/Users/foo/my file.txt"
formatSize(1_536);                            // "1.5 KB"

const router = createActionRouter({
  "open:readme": () => ctx.ui.openFile("readme.md"),
});
router.dispatch("open:readme");
```

| Module | Exports |
|---|---|
| `paths` | `urlToPath`, `pathToUrl`, `fileExtension`, `isTextFile` |
| `format` | `formatSize`, `formatDate`, `truncate` |
| `ids` | `generateId`, `simpleHash` |
| `actions` | `createActionRouter`, `ActionHandler`, `ActionRouterOptions` |
| `timing` | `debounce`, `throttle` |

The full symbol-level documentation for all three packages lives in the
generated [API Reference](/api/).
