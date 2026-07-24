---
title: Your first plugin
description: A minimal AppOS plugin — manifest, activate function, and a rendered view.
sidebar:
  order: 2
---

An AppOS plugin is a directory with two required files: a `plugin.json`
manifest and a compiled JS bundle.

## 1. The manifest

```json title="plugin.json"
{
  "$schema": "https://appos.space/schemas/plugin-v1.json",
  "id": "com.example.hello",
  "name": "Hello AppOS",
  "version": "1.0.0",
  "runtime": "javascript",
  "entrypoint": "dist/main.js",
  "activation": { "events": ["onStartup"] },
  "permissions": [
    { "scope": "ui.sidebar", "reason": "Show the file list panel" },
    { "scope": "filesystem.read", "reason": "List the current folder" }
  ]
}
```

- `id` is a reverse-domain identifier (`^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)+$`).
- `permissions` entries can be bare scope strings or `{ scope, reason }`
  objects — the `reason` shows up in the approval sheet. See the
  [permission scopes catalog](/manifest/permission-scopes/).
- The full field list is in the [manifest reference](/manifest/reference/).

## 2. The entrypoint

The host calls `globalThis.activate(context)` when the plugin activates. The
`context` object ([`PluginContext`](/reference/namespaces/)) carries every API
namespace.

```ts title="src/main.ts"
import type { PluginContext, PluginFileDescriptor } from "@appos.space/plugin-types";
import { vstack, section, listItem, button } from "@appos.space/view-builders";
import { formatSize } from "@appos.space/plugin-utils";

const PANEL_ID = "hello-panel";

function fileListView(files: PluginFileDescriptor[]) {
  return vstack([
    section("Current Folder", { icon: "folder" },
      files.map((f) =>
        listItem(f.name, {
          icon: f.isDirectory ? "folder" : "doc",
          trailing: f.size !== null ? formatSize(f.size) : undefined,
        }),
      ),
    ),
    button("Refresh", { action: "refresh" }),
  ]);
}

async function listActiveDirectory(ctx: PluginContext) {
  const dir = await ctx.fileOps.getActiveDirectory();
  return ctx.fileOps.listDirectory(dir);
}

export async function activate(ctx: PluginContext) {
  ctx.ui.registerPanel(PANEL_ID, {
    title: "Hello AppOS",
    icon: "folder",
    target: "sidebar",
    view: fileListView(await listActiveDirectory(ctx)),
    handler: async (action) => {
      if (action === "refresh") {
        ctx.ui.updatePanel(PANEL_ID, {
          view: fileListView(await listActiveDirectory(ctx)),
        });
      }
    },
  });
}

export function deactivate() {
  // optional cleanup — registrations are auto-cancelled on teardown
}

// The host looks for globals in an IIFE bundle. The cast is needed because
// `typeof globalThis` has no `activate`/`deactivate` properties under strict TS:
(globalThis as any).activate = activate;
(globalThis as any).deactivate = deactivate;
```

## 3. Build and validate

```bash
npx esbuild src/main.ts --bundle --format=iife --target=es2020 --outfile=dist/main.js
```

`npx` runs the esbuild binary you installed as a devDependency during
[installation](/getting-started/installation/) — no global install needed.

Validate your manifest against the schema shipped in this repo:

```bash
node scripts/validate-schema.mjs path/to/plugin.json
```

## Where to go next

- [API namespaces](/reference/namespaces/) — the full `context.*` surface
- [Manifest & permissions](/manifest/) — every manifest field and scope
- [Extension points](/extension-points/) — contributing to core plugins via `extensions[]`
