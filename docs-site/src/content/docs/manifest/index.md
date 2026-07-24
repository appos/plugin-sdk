---
title: Manifest overview
description: The plugin.json manifest — identity, activation, permissions, and dependencies.
sidebar:
  order: 1
---

Every AppOS plugin ships a `plugin.json` manifest at its root. The manifest
declares the plugin's identity, when it activates, which permissions it needs,
and any system or plugin dependencies.

The manifest is validated against the JSON Schema at
[`schemas/plugin-v1.json`](https://github.com/appos/plugin-sdk/blob/main/schemas/plugin-v1.json).
Add a `$schema` reference for editor autocomplete:

```json title="plugin.json"
{
  "$schema": "https://appos.space/schemas/plugin-v1.json",
  "id": "com.example.my-plugin",
  "name": "My Plugin",
  "version": "1.0.0",
  "runtime": "javascript",
  "entrypoint": "dist/main.js"
}
```

## Required fields

`id`, `name`, `version`, and `runtime` are always required. Plugins with
`"runtime": "javascript"` (all third-party plugins) must also declare
`entrypoint`. `"core-swift"` is reserved for host-bundled core plugins.

## Key sections

- **[Field reference](/manifest/reference/)** — every manifest field, generated
  from the JSON Schema.
- **[Permission scopes](/manifest/permission-scopes/)** — the full catalog of
  scopes accepted in `permissions`, generated from the SDK's machine-readable
  constraints.
- **[Limits](/manifest/limits/)** — host-enforced runtime quotas (storage,
  shell, network, and more).
- **[Extension points](/extension-points/)** — the `extensions[]` array for
  contributing to core-plugin extension points.

## Validation

This repo ships a validator you can run locally against any manifest:

```bash
node scripts/validate-schema.mjs path/to/plugin.json
```
