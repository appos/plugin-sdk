# @appos.space/plugin-utils

Pure utility functions for AppOS plugins. Host-agnostic, side-effect free,
tree-shakeable.

Eliminates the duplicated helper functions that tend to accumulate across
plugins — path conversion, formatting, ID generation, debouncing, and an
action router for dispatching view events.

## Install

```bash
npm install @appos.space/plugin-utils
```

## Usage

```ts
import {
  urlToPath,
  pathToUrl,
  fileExtension,
  isTextFile,
  formatSize,
  formatDate,
  truncate,
  generateId,
  createActionRouter,
  debounce,
  throttle,
} from "@appos.space/plugin-utils";

// Paths
urlToPath("file:///Users/foo/my%20file.txt"); // "/Users/foo/my file.txt"
pathToUrl("/tmp/x.log");                      // "file:///tmp/x.log"
fileExtension("README.md");                   // "md"
isTextFile("notes.txt");                      // true

// Formatting
formatSize(1_536);                            // "1.5 KB"
formatDate(new Date());                       // "just now"
truncate("a very long string", 10);           // "a very lo…"

// IDs
generateId();                                 // short random id

// Action router
const router = createActionRouter({
  "open:readme": () => ctx.ui.openFile("readme.md"),
  "add-file":    () => ctx.ui.prompt({ title: "New file" }),
});
router.dispatch("open:readme");

// Timing
const save = debounce(doSave, 300);
const log  = throttle(doLog, 1000);
```

## What's included

| Module | Exports |
|---|---|
| `paths` | `urlToPath`, `pathToUrl`, `fileExtension`, `isTextFile` |
| `format` | `formatSize`, `formatDate`, `truncate` |
| `ids` | `generateId`, `simpleHash` |
| `actions` | `createActionRouter`, `ActionHandler`, `ActionRouterOptions` |
| `timing` | `debounce`, `throttle` |

Every function is pure — no state, no side effects, no dependency on the
plugin host.

## License

MIT © InstantlyEasy
