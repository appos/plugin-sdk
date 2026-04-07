/**
 * Remove keys whose value is `undefined` from a plain object.
 * This ensures builder output never contains `undefined` property values,
 * keeping the JSON representation clean.
 */
export function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  const result = {} as Record<string, unknown>;
  for (const key of Object.keys(obj)) {
    if (obj[key] !== undefined) {
      result[key] = obj[key];
    }
  }
  return result as T;
}
