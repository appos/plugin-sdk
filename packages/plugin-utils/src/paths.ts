/**
 * Canonical file URL ↔ path conversion.
 * Handles encoding edge cases that vary across community plugins.
 */

/** Convert a file:// URL to a filesystem path. */
export function urlToPath(url: string): string {
  if (!url.startsWith("file://")) return url;
  // Strip the file:// prefix (7 chars)
  let raw = url.slice(7);
  // Strip query string and fragment before decoding
  const qIdx = raw.indexOf("?");
  if (qIdx !== -1) raw = raw.slice(0, qIdx);
  const hIdx = raw.indexOf("#");
  if (hIdx !== -1) raw = raw.slice(0, hIdx);
  // file:///path → raw is "/path" (absolute), file://host/path → raw is "host/path"
  const path = decodeURIComponent(raw);
  // Handle file:///path (raw starts with /) — already correct
  // Handle file://localhost/path — strip the authority
  if (!path.startsWith("/")) {
    const slashIdx = path.indexOf("/");
    return slashIdx === -1 ? "/" : path.slice(slashIdx);
  }
  return path;
}

/** Convert a filesystem path to a file:// URL. */
export function pathToUrl(path: string): string {
  if (path.startsWith("file://")) return path;
  // Encode each path component individually to preserve slashes
  const encoded = path
    .split("/")
    .map((component) => encodeURIComponent(component))
    .join("/");
  return `file://${encoded}`;
}

/**
 * Extract lowercase extension without dot. Returns null for no extension.
 * Handles dotfiles (returns null), URLs with query strings/fragments.
 */
export function fileExtension(urlOrPath: string): string | null {
  // Strip query string and fragment
  let cleaned = urlOrPath;
  const qIdx = cleaned.indexOf("?");
  if (qIdx !== -1) cleaned = cleaned.slice(0, qIdx);
  const hIdx = cleaned.indexOf("#");
  if (hIdx !== -1) cleaned = cleaned.slice(0, hIdx);

  const name = cleaned.split("/").pop() ?? "";
  // Decode percent-encoding so "file.%74xt" → "file.txt"
  let decoded: string;
  try {
    decoded = decodeURIComponent(name);
  } catch {
    decoded = name;
  }
  const dot = decoded.lastIndexOf(".");
  if (dot <= 0 || dot === decoded.length - 1) return null;
  return decoded.slice(dot + 1).toLowerCase();
}

/** Curated set of text file extensions. */
const TEXT_EXTENSIONS = new Set([
  "txt", "md", "markdown", "json", "yaml", "yml", "toml",
  "xml", "html", "htm", "css", "scss", "less",
  "js", "jsx", "ts", "tsx", "mjs", "cjs",
  "py", "rb", "rs", "go", "java", "kt", "swift", "c", "cpp", "h", "hpp",
  "sh", "bash", "zsh", "fish", "ps1",
  "sql", "graphql", "csv", "tsv",
  "env", "gitignore", "dockerfile", "makefile",
  "log", "conf", "ini", "cfg",
  "lock", "svg", "plist", "strings",
]);

/** Check if a file URL/path is likely a text file by extension. */
export function isTextFile(urlOrPath: string): boolean {
  const ext = fileExtension(urlOrPath);
  return ext !== null && TEXT_EXTENSIONS.has(ext);
}
