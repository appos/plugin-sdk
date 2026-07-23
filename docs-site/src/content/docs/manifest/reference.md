---
title: "Manifest field reference"
description: "Every plugin.json field, generated from schemas/plugin-v1.json."
sidebar:
  order: 2
---
<!--
  GENERATED FILE — do not edit by hand.
  Regenerate with: cd docs-site && npm run generate
  Drift gate:      cd docs-site && npm run check-drift
-->

Generated from
[`schemas/plugin-v1.json`](https://github.com/appos/plugin-sdk/blob/main/schemas/plugin-v1.json)
(`$id: https://appos.space/schemas/plugin-v1.json`). Unknown top-level fields are rejected
(`additionalProperties: false`).

**Always required:** `id`, `name`, `version`, `runtime`. Plugins with `"runtime": "javascript"` must also declare `entrypoint`.

## Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `$schema` | string | no | JSON Schema reference (optional, for editor autocomplete) |
| `id` | string | yes | Reverse-domain identifier (e.g. com.community.myplugin) — Pattern: `^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)+$` |
| `name` | string | yes | Human-readable display name — Max length: 64 |
| `version` | string | yes | Semantic version (MAJOR.MINOR.PATCH) — Pattern: `^\d+\.\d+\.\d+$` |
| `runtime` | `javascript` \| `core-swift` | yes | Plugin runtime. Third-party plugins use 'javascript'; 'core-swift' is reserved for host-bundled core plugins. |
| `entrypoint` | string | no | Path to the compiled JS bundle (e.g. dist/main.js). Required for 'javascript' runtime; absent for 'core-swift'. |
| `minHostVersion` | string | no | Minimum AppOS host version required — Pattern: `^\d+\.\d+\.\d+$` |
| `author` | string | no | Plugin author name |
| `description` | string | no | Brief description — Max length: 256 |
| `license` | string | no | SPDX license identifier (e.g. MIT, Apache-2.0) |
| `activation` | object | no |  |
| `permissions` | array | no | Required permission scopes. Each entry is a scope string (135 canonical scopes + legacy aliases + dynamic oauth.<provider>) or a {scope, reason} object. |
| `shellCommands` | array of string | no | Allowed shell command names for shell.execute |
| `shellDeniedPatterns` | array of string | no | Glob patterns denied from shell CWD |
| `networkDomains` | array of string | no | Allowed outbound domains for network.fetch |
| `settings` | array of object | no | User-configurable settings schema |
| `dependencies` | object | no | Declared dependencies on system binaries or other plugins |
| `oauth` | object | no | OAuth provider declarations |
| `menubar` | object | no | Menu bar NSStatusItem configuration |
| `homepage` | string | no | URL to the plugin's homepage or repository |
| `categories` | array of string | no | Plugin Store category tags |
| `keywords` | array of string | no | Search keywords for discoverability |
| `repository` | string | no | Repository URL |
| `capabilities` | object | no | Dynamic capabilities dictionary |
| `extensionPoints` | array of object | no | Extension points declared by this plugin |
| `dataContracts` | array of object | no | Data contracts declared by this plugin |
| `extensions` | array of object | no | Extension contributions (fn-12 typed array) — the manifest-declarative delivery vehicle for core-plugin extension points (actions.definition, views.savedView, surfaces.contribution, sidecars.definition, notifications.*, input.*, ledger.*, llm.*, recipes/sequences definitions, clipboard EPs, scheduler.triggerKind/condition, entities.*) |
| `shortcuts` | array of object | no | Manifest-declared keyboard shortcuts, auto-registered at activation (requires ui.shortcuts) |
| `scope` | `window` \| `app` | no | Plugin scope: 'window' (per-window instance) or 'app' (single shared instance, default) — Default: `"app"` |
| `isolation` | `jscontext` \| `xpc` | no | Isolation mechanism: 'jscontext' (in-process, default) or 'xpc' (reserved; parsed but not enforced) — Default: `"jscontext"` |
| `allowedShellCommands` | array of string | no | Allowed shell commands for core-plugin shellExecute enforcement (core-swift only; absent/empty = deny-all) |

### `activation`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `events` | array of `onStartup` | yes | When to activate (currently only onStartup) |

### `settings` (array items)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `key` | string | yes |  |
| `label` | string | yes |  |
| `type` | `bool` \| `number` \| `enum` \| `string` | yes |  |
| `default` | any | no |  |
| `options` | array | no |  |
| `min` | number | no |  |
| `max` | number | no |  |

### `dependencies`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `system` | array of object | no | System binary dependencies |
| `plugins` | array of object | no | Plugin-to-plugin dependencies |

#### `dependencies.system` (array items)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | yes | Human-readable tool name (e.g. yt-dlp) |
| `check` | object | yes |  |
| `minVersion` | string | no | Minimum required version string |
| `required` | boolean | no | If false, plugin activates without this dep — Default: `true` |
| `installHint` | string | no | Suggested install command (e.g. brew install yt-dlp) |
| `installUrl` | string | no | Link to installation documentation |
| `description` | string | no | What this dependency enables |

##### `dependencies.system.check`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `command` | string | yes | Binary name to invoke (resolved via PATH) |
| `args` | array of string | no | Arguments passed to the command — Default: `[]` |
| `versionPattern` | string | no | Regex with one capture group for version extraction (optional — runtime uses fallback extraction when absent) |

#### `dependencies.plugins` (array items)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes | Dependency plugin ID (reverse-domain, allows hyphens) — Pattern: `^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)+$` |
| `minVersion` | string | no | Minimum version (semver) — Pattern: `^\d+\.\d+\.\d+$` |
| `required` | boolean | no | Default: `true` |

### `oauth`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `providers` | array of object | yes |  |

#### `oauth.providers` (array items)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | yes |  |
| `scopes` | array of string | yes |  |
| `reason` | string | no |  |

### `menubar`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `icon` | string | yes | SF Symbol name |
| `label` | string | no |  |
| `globalShortcut` | string | no | Global keyboard shortcut |

### `extensions` (array items)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `extensionPoint` | string | yes | Qualified extension point id (e.g. 'space.appos.core.notifications:channel') |

### `shortcuts` (array items)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `commandId` | string | yes | Short command ID (auto-prefixed with '{pluginId}.') |
| `keys` | string | yes | Shortcut key string (e.g. 'cmd+shift+t') |
| `when` | string | no | Optional condition string |

## Permissions

The `permissions` array accepts bare scope strings or `{ scope, reason }`
objects (the optional `reason`, max 120 chars, is shown in the approval
sheet). The full scope catalog is on the
[permission scopes page](/manifest/permission-scopes/).
