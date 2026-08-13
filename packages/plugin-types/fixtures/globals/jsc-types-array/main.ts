/**
 * Fixture: the tsconfig `types` array form of the opt-in —
 * `"types": ["@appos.space/plugin-types/globals"]` — with NO triple-slash
 * reference line in the source.
 *
 * MUST COMPILE CLEANLY (same guarded usage as `jsc-with-globals`).
 */
export function hostOf(raw: string): string | null {
  if (typeof URL !== "function") return null;
  if (!URL.canParse(raw)) return null;
  return new URL(raw).hostname;
}
