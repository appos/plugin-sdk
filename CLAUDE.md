# CLAUDE.md — plugin-sdk

## What This Is

Monorepo for the 2Panez Plugin SDK — developer-facing packages that make plugin authoring type-safe and ergonomic.

## Packages

| Package | Purpose | npm name |
|---------|---------|----------|
| `packages/plugin-types` | TypeScript type definitions for the full Plugin API (22 namespaces, 33 permissions). Platform-level — shared across all AppOS host apps. | `@appos/plugin-types` |
| `packages/view-builders` | Typed ViewDescriptor builder helpers (`vstack()`, `listItem()`, etc.) | `@appos/view-builders` |
| `packages/plugin-utils` | Shared utilities (path conversion, formatting, action routing). Host-agnostic. | `@appos/plugin-utils` |
| `schemas/` | JSON Schema for plugin.json + machine-readable constraints | — |

## Source of Truth & Related Repos

| Resource | Path | Purpose |
|----------|------|---------|
| **plugin-api.d.ts** | `~/Documents/GitHub/_90-percent-done/2Panes/Bifocal/Sources/TwoPanez/Services/Plugins/plugin-api.d.ts` | Canonical type definitions (2778 lines, v2.3.0-fn48). ALL types in this SDK must match. |
| **DX Report** | `~/Documents/GitHub/AppOS/community-plugins/PLUGIN-DX-REPORT.md` | Assessment that motivated this SDK — P0 items are what this repo delivers |
| **Community Plugins** | `~/Documents/GitHub/AppOS/community-plugins/plugins/` | 12 reference plugins with plugin.json manifests — use for schema validation testing |
| **yt-dlp Plugin** | `~/Documents/GitHub/AppOS/appos-plugin-ytdlp/` | Flagship plugin that will import from this SDK — use for integration testing |
| **extension-api.md** | `~/Documents/GitHub/AppOS/appos-claude-code-plugin/skills/twopanez-plugin-dev/reference/extension-api.md` | Human-readable API docs (v2.3.0-fn48) — types here should be consistent |

Run `node scripts/sync-types.mjs` to pull the latest .d.ts into `plugin-api.d.ts.reference` for diffing.

## Commands

```bash
npm install          # Install workspace dependencies
npm run build        # Build all packages
npm run lint         # Type-check all packages
npm run sync-types   # Pull latest plugin-api.d.ts for reference
```

## Key Conventions

- Types are declaration-only (`.d.ts`) — no runtime code in plugin-types
- View builders produce plain objects — zero runtime overhead, tree-shakeable
- Plugin utils are pure functions — no side effects, no state
- Versions track the plugin API version (currently 2.3.0)

<!-- BEGIN FLOW-NEXT -->
## Flow-Next

This project uses Flow-Next for task tracking. Use `.flow/bin/flowctl` instead of markdown TODOs or TodoWrite.

**Quick commands:**
```bash
.flow/bin/flowctl list                # List all epics + tasks
.flow/bin/flowctl epics               # List all epics
.flow/bin/flowctl tasks --epic fn-N   # List tasks for epic
.flow/bin/flowctl ready --epic fn-N   # What's ready
.flow/bin/flowctl show fn-N.M         # View task
.flow/bin/flowctl start fn-N.M        # Claim task
.flow/bin/flowctl done fn-N.M --summary-file s.md --evidence-json e.json
```

**Creating a spec** ("create a spec", "spec out X", "write a spec for X"):

A spec = an epic. Create one directly — do NOT use `/flow-next:plan` (that breaks specs into tasks).

```bash
.flow/bin/flowctl epic create --title "Short title" --json
.flow/bin/flowctl epic set-plan <epic-id> --file - --json <<'EOF'
# Title

## Goal & Context
Why this exists, what problem it solves.

## Architecture & Data Models
System design, data flow, key components.

## API Contracts
Endpoints, interfaces, input/output shapes.

## Edge Cases & Constraints
Failure modes, limits, performance requirements.

## Acceptance Criteria
- [ ] Testable criterion 1
- [ ] Testable criterion 2

## Boundaries
What's explicitly out of scope.

## Decision Context
Why this approach over alternatives.
EOF
```

After creating a spec, choose next step:
- `/flow-next:plan <epic-id>` — research + break into tasks
- `/flow-next:interview <epic-id>` — deep Q&A to refine the spec

**Rules:**
- Use `.flow/bin/flowctl` for ALL task tracking
- Do NOT create markdown TODOs or use TodoWrite
- Re-anchor (re-read spec + status) before every task

**More info:** `.flow/bin/flowctl --help` or read `.flow/usage.md`
<!-- END FLOW-NEXT -->
