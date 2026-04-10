# @appos.space/view-builders

Typed builder helpers for `ViewDescriptor` — the declarative UI format for
AppOS plugins.

Produces plain object literals, so it's **zero runtime overhead** and fully
tree-shakeable. Use it to get autocomplete, type checking, and readable code
instead of hand-writing nested object trees.

## Install

```bash
npm install @appos.space/view-builders
```

## Usage

```ts
import {
  vstack,
  hstack,
  section,
  listItem,
  text,
  button,
  badge,
} from "@appos.space/view-builders";

const view = vstack([
  section("Files", { icon: "doc.on.doc", badge: "3" }, [
    listItem("readme.md", { icon: "doc", action: "open:readme" }),
    listItem("package.json", { icon: "shippingbox", action: "open:pkg" }),
  ]),
  hstack([
    button("Add", { action: "add-file", style: "primary" }),
    button("Refresh", { action: "refresh" }),
  ]),
]);
```

Each helper returns a plain `ViewDescriptor` object, so you can mix calls with
raw literals freely, and the result ships with no runtime dependency on this
package.

## What's included

| Category | Helpers |
|---|---|
| Containers | `vstack`, `hstack`, `scroll`, `list`, `grid`, `section` |
| Content | `text`, `label`, `image`, `badge`, `button`, `listItem` |
| Primitives | `divider`, `spacer`, `textField`, `progress`, `remoteImage` |
| Menus | `menuAction`, `menuDivider`, `encodeMenuActions` |

## Types

Depends on [`@appos.space/plugin-types`](https://www.npmjs.com/package/@appos.space/plugin-types)
for `ViewDescriptor` and related types.

## License

MIT © InstantlyEasy
