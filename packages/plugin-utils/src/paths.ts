/**
 * Canonical file URL ↔ path conversion.
 * Handles encoding edge cases that vary across community plugins.
 */

/** Convert a file:// URL to a filesystem path. */
export function urlToPath(url: string): string {
  if (!url.startsWith("file://")) return url;
  // Remove file:// prefix and decode percent-encoding
  const path = decodeURIComponent(url.slice(7));
  // Handle file:///path (3 slashes = absolute path)
  return path.startsWith("//") ? path.slice(1) : path;
}

/** Convert a filesystem path to a file:// URL. */
export function pathToUrl(path: string): string {
  if (path.startsWith("file://")) return path;
  // Encode path components but preserve slashes
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  return `file://${encoded}`;
}

/** Extract lowercase extension without dot. Returns null for no extension. */
export function fileExtension(urlOrPath: string): string | null {
  const name = urlOrPath.split("/").pop() ?? "";
  const dot = name.lastIndexOf(".");
  if (dot <= 0 || dot === name.length - 1) return null;
  return name.slice(dot + 1).toLowerCase();
}

const TEXT_EXTENSIONS = new Set([
  "txt", "md", "markdown", "json", "yaml", "yml", "toml",
  "xml", "html", "htm", "css", "scss", "less",
  "js", "jsx", "ts", "tsx", "mjs", "cjs",
  "py", "rb", "rs", "go", "java", "kt", "swift", "c", "cpp", "h",
  "sh", "bash", "zsh", "fish", "ps1",
  "sql", "graphql", "csv", "tsv",
  "env", "gitignore", "dockerfile", "makefile",
  "log", "conf", "ini", "cfg",
]);

/** Check if a file URL/path is likely a text file by extension. */
export function isTextFile(urlOrPath: string): boolean {
  const ext = fileExtension(urlOrPath);
  return ext !== null && TEXT_EXTENSIONS.has(ext);
}
