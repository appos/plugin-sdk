/**
 * @appos.space/plugin-utils — Battle-tested utility functions for 2Panez plugins.
 *
 * Eliminates duplicated helpers across plugins. All functions are pure
 * and tree-shakeable.
 */

export { urlToPath, pathToUrl, fileExtension, isTextFile } from "./paths.js";
export { formatSize, formatDate, truncate } from "./format.js";
export { generateId, simpleHash } from "./ids.js";
export { createActionRouter, type ActionHandler, type ActionRouterOptions } from "./actions.js";
export { debounce, throttle } from "./timing.js";
