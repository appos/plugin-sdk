/** Format byte count to human-readable string. */
export function formatSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, i);
  const formatted = value < 10 ? value.toFixed(1).replace(/\.0$/, "") : String(Math.round(value));
  return `${formatted} ${units[i]}`;
}

/** Format ISO 8601 date to relative or short display string. */
export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  const diffWeek = Math.floor(diffDay / 7);
  if (diffDay < 30) return `${diffWeek}w ago`;

  // Same year: "Mar 15", different year: "Mar 15, 2023"
  const sameYear = date.getFullYear() === now.getFullYear();
  const month = date.toLocaleDateString("en-US", { month: "short" });
  const day = date.getDate();
  return sameYear ? `${month} ${day}` : `${month} ${day}, ${date.getFullYear()}`;
}

/** Truncate string with ellipsis. */
export function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max - 1) + "…";
}
