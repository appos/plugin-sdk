/**
 * @appos/view-builders — Typed ViewDescriptor builder helpers.
 *
 * Zero runtime cost: esbuild tree-shakes these to plain object literals.
 *
 * Usage:
 *   import { vstack, text, listItem, section, button } from "@appos/view-builders";
 *
 *   const view = vstack([
 *     section("Files", { icon: "doc.on.doc", badge: "3" }, [
 *       listItem("readme.md", { icon: "doc", action: "open:readme" }),
 *     ]),
 *     button("Add", { action: "add-file" }),
 *   ]);
 */

export { vstack, hstack, scroll, list, grid, section } from "./containers";
export { text, label, image, badge, button, listItem } from "./content";
export { divider, spacer, textField, progress, remoteImage } from "./primitives";
export { menuAction, menuDivider, encodeMenuActions } from "./menus";
