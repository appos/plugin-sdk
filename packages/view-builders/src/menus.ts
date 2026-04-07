import type { MenuAction, SFSymbolName } from "@appos/plugin-types";
import { stripUndefined } from "./util.js";

/**
 * Create a typed menu action for context menus.
 */
export function menuAction(title: string, opts: {
  icon?: SFSymbolName;
  action: string;
  destructive?: boolean;
}): MenuAction {
  return stripUndefined({ title, ...opts });
}

/**
 * Create a menu divider.
 */
export function menuDivider(): MenuAction {
  return { title: "---" };
}

/**
 * Encode menu actions array to the JSON string format
 * expected by listItem's menuActions property.
 */
export function encodeMenuActions(actions: MenuAction[]): string {
  return JSON.stringify(actions);
}
