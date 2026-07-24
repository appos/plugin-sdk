---
title: "Extension points"
description: "Contributing to core-plugin extension points via the manifest extensions[] array."
sidebar:
  order: 1
---
<!--
  GENERATED FILE — do not edit by hand.
  Regenerate with: cd docs-site && npm run generate
  Drift gate:      cd docs-site && npm run check-drift
-->

Core plugins expose **extension points** that third-party plugins contribute
to declaratively through the manifest's `extensions[]` array. Each entry
names a qualified extension point id and carries the contribution payload:

```json title="plugin.json (excerpt)"
{
  "extensions": [
    {
      "extensionPoint": "space.appos.core.notifications:channel",
      "...": "contribution payload fields (schema owned by the core plugin)"
    }
  ]
}
```

From the manifest schema (`schemas/plugin-v1.json`):

> Extension contributions (fn-12 typed array) — the manifest-declarative delivery vehicle for core-plugin extension points (actions.definition, views.savedView, surfaces.contribution, sidecars.definition, notifications.*, input.*, ledger.*, llm.*, recipes/sequences definitions, clipboard EPs, scheduler.triggerKind/condition, entities.*)

Only `extensionPoint` is required per entry; the remaining fields are
validated by the owning core plugin at replay time. Contributions are
re-ingested on plugin activation, so manifest-declarative contributions
behave identically to runtime-registered ones once bound.

Plugins can also declare their **own** extension points (`extensionPoints`
manifest field + `context.extensionPoints` API) for other plugins to
contribute to — see `ExtensionPointsAPI` in the [API Reference](/api/).

## Contribution surfaces

Contributing to an extension point requires the matching contributor
permission scope. The scope catalog is the machine-readable signal for which
contribution surfaces exist, grouped here by family:

| Family | Contributor scopes |
|--------|--------------------|
| `clipboard` | `clipboard.contentType.register`, `clipboard.source.register`, `clipboard.transform.register`, `clipboard.destination.register`, `clipboard.rule.register`, `clipboard.retention.predicate.register` |
| `interPlugin` | `interPlugin.contribute` |
| `events` | `events.serializer.register`, `events.sink.register` |
| `store` | `store.backend.register`, `store.migrator.register`, `store.indexer.register` |
| `vault` | `vault.type.register`, `vault.bridge.register`, `vault.rotator.register`, `vault.policy.contribute` |
| `actions` | `actions.register` |
| `palette` | `palette.contribute.scope` |
| `scheduler` | `scheduler.trigger.register`, `scheduler.condition.register`, `scheduler.action.register` |
| `resources` | `resources.provider.register` |
| `tokens` | `tokens.provider.register` |
| `entities` | `entities.type.register`, `entities.computedField.provide` |
| `views` | `views.register`, `views.layoutRenderer.register` |
| `surfaces` | `surfaces.contribute.sidebar.top`, `surfaces.contribute.sidebar.bottom`, `surfaces.contribute.pane.dashboard`, `surfaces.contribute.status.left` |
| `sidecars` | `sidecars.definition.register` |
| `notifications` | `notifications.channel.register`, `notifications.filter.register`, `notifications.action.register` |
| `input` | `input.channel.register`, `input.parser.register`, `input.intent.register`, `input.auth.register` |
| `webhook` | `webhook.route.register`, `webhook.route.register.unsigned`, `webhook.tunnel.register`, `webhook.signer.register` |
| `llm` | `llm.provider.register`, `llm.preprocessor.register`, `llm.postprocessor.register`, `llm.router.register` |
| `recipes` | `recipes.register` |
| `sequences` | `sequences.register` |

:::note[TODO — canonical extension-point catalog]
The authoritative extension-point catalog — qualified ids
(`<corePluginId>:<point>`), per-contribution payload schemas, and validation
rules — is owned by the core plugins in the AppOS host repo and is **not
machine-readable from this SDK repo yet**. The table above is derived from
contributor permission scopes; per-point payload documentation will be
generated once the host exports a machine-readable extension-point catalog.
:::
