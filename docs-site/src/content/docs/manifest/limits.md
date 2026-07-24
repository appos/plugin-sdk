---
title: "Runtime limits & build constraints"
description: "Host-enforced quotas and required build configuration, generated from schemas/constraints.json."
sidebar:
  order: 4
---
<!--
  GENERATED FILE — do not edit by hand.
  Regenerate with: cd docs-site && npm run generate
  Drift gate:      cd docs-site && npm run check-drift
-->

Generated from
[`schemas/constraints.json`](https://github.com/appos/plugin-sdk/blob/main/schemas/constraints.json)
— the machine-readable constraints file intended for AI agents and validation
tools.

## Build constraints

| Setting | Value |
|---------|-------|
| `format` | `iife` |
| `target` | `es2020` |
| `entrypoint` | `dist/main.js` |
| `noExternalDependencies` | `true` |
| `bundler` | `esbuild` |

## Code requirements

| Requirement | Value |
|-------------|-------|
| `requiredExports` | `globalThis.activate`, `globalThis.deactivate` |
| `contextVariableName` | `context` |
| `menuActionsSerialization` | `JSON.stringify` |

## Runtime limits

| Limit | Value |
|-------|-------|
| `storageSizePerValue` | `1MB` |
| `storageSizePerPlugin` | `10MB` |
| `cacheSizePerPlugin` | `50MB` |
| `cacheSizeGlobal` | `200MB` |
| `shellConcurrentPerPlugin` | `5` |
| `shellStdoutMaxBytes` | `10MB` |
| `shellTimeoutMaxSeconds` | `120` |
| `networkConcurrentPerPlugin` | `10` |
| `webPanelsPerPlugin` | `2` |
| `webPanelsGlobal` | `6` |
| `themesPerPlugin` | `10` |
| `batchOperationsMax` | `1000` |
| `watchDebounceMin` | `0` |
| `watchDebounceMax` | `5000` |
| `watchDebounceDefault` | `500` |
| `actionsInvokeRateLimitPerPluginPerHour` | `100` |
| `clipboardInlineBlobMaxBytes` | `716800` |
| `eventsReplayBoundedDefault` | `50` |
| `inputRecentHardCeiling` | `1000` |
| `notificationsWebhookAttachmentInlineMaxBytes` | `102400` |

## View descriptor tokens

- **View types**: `vstack`, `hstack`, `scroll`, `list`, `grid`, `section`, `text`, `label`, `image`, `badge`, `button`, `listItem`, `divider`, `spacer`, `textField`, `progress`, `remoteImage`
- **Fonts**: `largeTitle`, `title`, `title2`, `title3`, `headline`, `subheadline`, `body`, `callout`, `footnote`, `caption`, `caption2`
- **System colors**: `systemRed`, `systemOrange`, `systemYellow`, `systemGreen`, `systemBlue`, `systemPurple`, `systemPink`, `systemTeal`, `systemIndigo`, `systemBrown`, `systemMint`, `systemCyan`, `red`, `orange`, `yellow`, `green`, `blue`, `purple`
- **Semantic colors**: `primary`, `secondary`, `tertiary`
- **Design-token colors**: `ux_synapse`, `ux_cortex`, `ux_pulse`, `ux_signal`, `ux_warning`, `ux_error`, `ux_success`, `ux_info`
- **Hex colors**: pattern `^#[0-9A-Fa-f]{6}$`
