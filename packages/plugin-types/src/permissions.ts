/**
 * All valid permission scopes (33 scopes).
 */
export type PermissionScope =
  // UI
  | "ui.sidebar"
  | "ui.statusBar"
  | "ui.contextMenu"
  | "ui.notifications"
  | "ui.sheets"
  | "ui.shortcuts"
  | "ui.themes"
  | "ui.preview"
  | "ui.aiChat"
  | "ui.webPanel"
  // Filesystem
  | "filesystem.read"
  | "filesystem.write"
  | "filesystem.watch"
  | "filesystem.readAll"
  | "filesystem.writeAll"
  // Shell
  | "shell.execute"
  | "shell.uncontained"
  // Clipboard
  | "clipboard.read"
  | "clipboard.write"
  // Network
  | "network"
  | "network.outbound"
  | "network.fetch"
  | "network.unrestricted"
  // Keychain
  | "keychain.plugin"
  // Inter-plugin
  | "interPlugin.declare"
  | "interPlugin.contribute"
  | "interPlugin.query"
  | "interPlugin.emit"
  // Feature namespaces
  | "workspaces"
  | "cache"
  | "feedback"
  | "feedback.confirm"
  | "oauth"
  | `oauth.${string}`
  | "menubar"
  | "menubar.globalShortcut"
  | "smartFolders"
  // WebView
  | "webview";
