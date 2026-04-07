/**
 * Typed action router — replaces if/else startsWith chains.
 *
 * Usage:
 *   const router = createActionRouter({
 *     "open": (arg) => openFile(arg),
 *     "delete": (arg) => deleteFile(arg),
 *     "toggle": () => toggleSetting(),
 *   });
 *   router("open:file:///readme.md"); // calls open("file:///readme.md")
 */

export type ActionHandler = (arg: string) => void | Promise<void>;

export interface ActionRouterOptions {
  /** Handler for unmatched actions. Defaults to console.warn. */
  fallback?: ActionHandler;
  /** Separator between prefix and argument. Default: ":" */
  separator?: string;
}

export function createActionRouter(
  handlers: Record<string, ActionHandler>,
  options?: ActionRouterOptions,
): (action: string) => void | Promise<void> {
  const sep = options?.separator ?? ":";
  const fallback = options?.fallback ?? ((a) => console.warn(`Unhandled action: ${a}`));

  return (action: string) => {
    const idx = action.indexOf(sep);
    if (idx === -1) {
      const handler = handlers[action];
      return handler ? handler("") : fallback(action);
    }
    const prefix = action.slice(0, idx);
    const arg = action.slice(idx + sep.length);
    const handler = handlers[prefix];
    return handler ? handler(arg) : fallback(action);
  };
}
