/**
 * API namespace interfaces — all 22 namespaces.
 * Each maps to a property on PluginContext.
 */

import type { ViewDescriptor } from "./views";
import type { PluginFileDescriptor } from "./core";
import type { SFSymbolName } from "./icons";
import type { PermissionScope } from "./permissions";

// ─── commands ───────────────────────────────────────

export interface CommandOptions {
  title: string;
  icon?: SFSymbolName;
  handler: (...args: unknown[]) => void | Promise<void>;
}

export interface CommandsAPI {
  register(id: string, options: CommandOptions): void;
  execute(id: string, args?: unknown): Promise<void>;
  getRegistered(): string[];
  onCommandExecuted(id: string, handler: () => void): string;
}

// ─── fileOps ────────────────────────────────────────

export interface BatchOperation {
  type: "copy" | "move" | "delete" | "rename";
  sources?: string[];
  destination?: string;
  url?: string;
  newName?: string;
  trash?: boolean;
}

export interface BatchResult {
  index: number;
  success: boolean;
  error?: string;
}

export interface WatchOptions {
  debounceMs?: number; // 100–5000, default 500
  recursive?: boolean; // default true
}

export interface FileOpsAPI {
  // Reading
  getActiveDirectory(): Promise<string>;
  getPaneDirectory(paneId: string): Promise<string>;
  getSelectedFiles(): Promise<PluginFileDescriptor[]>;
  listDirectory(url: string): Promise<PluginFileDescriptor[]>;
  getFileInfo(url: string): Promise<PluginFileDescriptor>;
  readFile(url: string, encoding?: string): Promise<string>;
  readFileData(url: string): Promise<string>;

  // Writing
  copy(sources: string[], dest: string): Promise<void>;
  move(sources: string[], dest: string): Promise<void>;
  delete(urls: string[], trash?: boolean): Promise<void>;
  rename(url: string, newName: string): Promise<string>;
  createDirectory(parentUrl: string, name: string): Promise<string>;
  createFile(parentUrl: string, name: string, contents?: string): Promise<string>;
  writeFile(url: string, contents: string, encoding?: string): Promise<void>;
  batch(operations: BatchOperation[]): Promise<BatchResult[]>;

  // Watching
  watchDirectory(url: string, handler: (event: unknown) => void): string;
  watchDirectoryWithOptions(url: string, options: WatchOptions, handler: (event: unknown) => void): string;
  unwatchDirectory(subscriptionId: string): void;

  // Hooks
  onBeforeOperation(type: string, handler: (info: unknown) => { reason: string } | void): string;
  onAfterOperation(type: string, handler: (info: unknown) => void): string;
  removeBeforeHook(subscriptionId: string): void;
  removeAfterHook(subscriptionId: string): void;
}

// ─── ui ─────────────────────────────────────────────

export interface PanelOptions {
  title: string;
  icon?: SFSymbolName;
  view?: ViewDescriptor;
  target?: "sidebar" | "pane";
  badge?: string;
  handler?: (action: string) => void | Promise<void>;
  autoShow?: boolean;
}

export interface ActivityViewOptions {
  title: string;
  icon: SFSymbolName;
  view?: ViewDescriptor;
  linkedPanel?: string;
  handler?: (action: string) => void | Promise<void>;
}

export interface WebPanelOptions {
  title: string;
  icon?: SFSymbolName;
  htmlPath: string;
  width?: number;
  allowNavigation?: boolean;
}

export interface WebPanelMessage {
  data: unknown;
  instanceId: string;
  windowId: string;
  paneId: string;
}

export interface NotificationOptions {
  kind?: "info" | "success" | "warning" | "error";
  duration?: number;
}

export interface SheetOptions {
  title: string;
  view: ViewDescriptor;
  handler?: (action: string) => void | Promise<void>;
}

export interface UIAPI {
  // Panels
  registerPanel(id: string, options: PanelOptions): string;
  updatePanel(id: string, options: Partial<PanelOptions>): string;
  registerActivityView(id: string, options: ActivityViewOptions): string;
  registerActivityBarItem(id: string, options: unknown): string;
  showPanel(id: string, options?: unknown): string;
  unregister(tokenId: string): void;

  // Pane tabs
  showPaneTab(id: string, options?: { title?: string; pane?: "left" | "right" }): string;
  hidePaneTab(id: string): string;

  // Viewers
  openInPane(url: string, options?: { pane?: "left" | "right" }): void;
  openTerminal(workingDirectory: string, options?: { pane?: "left" | "right" }): void;
  openEditor(url: string, options?: { pane?: "left" | "right" }): void;
  openWebView(url: string, options?: { pane?: "left" | "right" }): void;
  openMarkdownPreview(url: string, options?: { pane?: "left" | "right" }): void;
  openAIChat(options?: { connector?: string; systemPrompt?: string; context?: string[] }): void;

  // WebView Panels (fn-48)
  registerWebPanel(id: string, options: WebPanelOptions): Promise<string>;
  postToWebPanel(id: string, message: unknown): Promise<true>;
  onWebPanelMessage(id: string, handler: (msg: WebPanelMessage) => void): string;
  onWebPanelRequest(id: string, handler: (msg: WebPanelMessage) => unknown | Promise<unknown>): string;
  pipeShellToWebPanel(shellOptions: ShellExecuteOptions, panelId: string): Promise<ShellResult>;

  // Status bar, toolbar, context menu, annotations
  registerStatusBarItem(id: string, options: unknown): string;
  registerToolbarItem(id: string, options: unknown): string;
  registerContextMenuItem(id: string, options: unknown): string;
  registerFileRowAnnotation(id: string, options: unknown): string;

  // Notifications, sheets, filtering
  showNotification(options: NotificationOptions & { title?: string; message?: string }): void;
  showSheet(options: SheetOptions): void;
  setQuickFilter(text: string): void;
}

// ─── storage ────────────────────────────────────────

export interface StorageAPI {
  get(key: string): unknown | null;
  set(key: string, value: unknown): void;
  getSecure(key: string): string | null;
  setSecure(key: string, value: string): void;
  deleteSecure(key: string): true | undefined;
}

// ─── settings ───────────────────────────────────────

export interface SettingsAPI {
  get(key: string): unknown | null;
  set(key: string, value: unknown): void;
  getAll(): Record<string, unknown>;
  onChange(handler: (key: string, newVal: unknown, oldVal: unknown) => void): string;
  onKeyChange(key: string, handler: (newVal: unknown, oldVal: unknown) => void): string;
  offChange(token: string): void;
  openUI(): void;
}

// ─── events ─────────────────────────────────────────

export interface EventsAPI {
  subscribe(eventName: string, handler: (payload: unknown) => void): string;
  unsubscribe(token: string): void;
}

// ─── shell ──────────────────────────────────────────

export interface ShellDataChunk {
  stream: "stdout" | "stderr";
  data: string;
  bytesTotal: number;
}

export interface ShellExecuteOptions {
  command: string;
  args?: string[];
  cwd?: string;
  timeout?: number;
  env?: Record<string, string>;
  onData?: (chunk: ShellDataChunk) => void;
}

export interface ShellResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

export interface ShellAPI {
  execute(options: ShellExecuteOptions): Promise<ShellResult>;
}

// ─── clipboard ──────────────────────────────────────

export interface ClipboardAPI {
  read(): Promise<string | null>;
  write(text: string): Promise<boolean>;
}

// ─── network ────────────────────────────────────────

export interface FetchOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

export interface FetchResult {
  status: number;
  headers: Record<string, string>;
  body: string;
}

export interface NetworkAPI {
  fetch(url: string, options?: FetchOptions): Promise<FetchResult>;
  download(url: string, destPath: string): Promise<string>;
}

// ─── shortcuts ──────────────────────────────────────

export interface ShortcutOptions {
  commandId: string;
  keys: string;
  when?: string;
}

export interface ShortcutInfo {
  id: string;
  commandId: string;
  keys: string;
  pluginId: string;
}

export interface ShortcutsAPI {
  register(options: ShortcutOptions): Promise<string>;
  unregister(shortcutId: string): Promise<void>;
  getAll(): Promise<ShortcutInfo[]>;
}

// ─── themes ─────────────────────────────────────────

export interface ThemeOptions {
  id: string;
  name: string;
  tokens: Record<string, string>;
}

export interface ThemeInfo {
  id: string;
  name: string;
  pluginId: string;
}

export interface ThemesAPI {
  registerTheme(options: ThemeOptions): Promise<void>;
  getActiveTheme(): Promise<string | null>;
  setActiveTheme(themeId: string | null): Promise<void>;
  getThemeList(): Promise<ThemeInfo[]>;
  onThemeChanged(callback: (themeId: string | null) => void): Promise<string>;
  offThemeChanged(token: string): Promise<void>;
}

// ─── smartFolders ───────────────────────────────────

export interface SmartFolderDescriptor {
  id: string;
  name: string;
  icon?: SFSymbolName;
}

export interface FilterEvalResult {
  url: string;
  matched: boolean;
}

export interface SmartFoldersAPI {
  registerFilterType(options: {
    id: string;
    label: string;
    evaluate: (item: { url: string; metadata: unknown }) => boolean;
  }): Promise<string>;
  getSmartFolders(): Promise<SmartFolderDescriptor[]>;
  evaluateFilter(folderId: string, items: { url: string; metadata?: unknown }[]): Promise<FilterEvalResult[]>;
  onSmartFolderEvaluated(callback: (info: { folderId: string; resultCount: number }) => void): Promise<string>;
  offSmartFolderEvaluated(token: string): Promise<void>;
}

// ─── preview ────────────────────────────────────────

export interface PreviewAPI {
  canPreview(filePath: string): Promise<boolean>;
  showPreview(filePath: string): Promise<void>;
  getRegisteredTypes(): Promise<string[]>;
  registerProvider(options: unknown): Promise<void>; // CorePlugin-only in v1
}

// ─── extensionPoints ────────────────────────────────

export interface ExtensionPointsAPI {
  declare(id: string, options: { schema?: object; description?: string }): Promise<string>;
  contribute(targetId: string, contribution: unknown, options?: { priority?: number }): Promise<string>;
  discover(pointId: string): Promise<{ id: string; pluginId: string; data: unknown; priority: number }[]>;
  removeContribution(targetId: string, contributionId: string): Promise<void>;
}

// ─── dataContracts ──────────────────────────────────

export interface DataContractsAPI {
  expose(contractId: string, version: number, options: {
    description?: string;
    provider: (args?: unknown) => unknown | Promise<unknown>;
  }): Promise<string>;
  query(qualifiedContractId: string, version: number, args?: unknown): Promise<unknown>;
  unexpose(contractId: string, version?: number): Promise<void>;
  getAvailableContracts(): Promise<string[]>;
}

// ─── interPluginEvents ──────────────────────────────

export interface InterPluginEventsAPI {
  declareEvent(eventName: string, schema?: object): Promise<string>;
  emit(eventName: string, payload: unknown): Promise<void>;
  subscribe(qualifiedEventName: string, handler: (payload: unknown) => void): Promise<string>;
  unsubscribe(token: string): Promise<void>;
}

// ─── lifecycle ──────────────────────────────────────

export interface LifecycleAPI {
  onDependencyAvailable(depId: string, handler: () => void): void;
  onDependencyUnavailable(depId: string, handler: () => void): void;
}

// ─── workspaces (fn-40) ─────────────────────────────

export interface WorkspaceTabDescriptor {
  type: "fileBrowser" | "terminal" | "editor" | "webView" | "markdown" | "pluginPanel";
  path?: string;
  cwd?: string;
  url?: string;
  panelId?: string;
}

export interface WorkspaceTemplate {
  id: string;
  name: string;
  icon?: SFSymbolName;
  leftPane?: { tabs: WorkspaceTabDescriptor[]; activeTab?: number };
  rightPane?: { tabs: WorkspaceTabDescriptor[]; activeTab?: number };
  source?: { type: string; pluginId?: string };
}

export interface WorkspacesAPI {
  register(template: WorkspaceTemplate): Promise<string>;
  list(): Promise<WorkspaceTemplate[]>;
  apply(workspaceId: string): Promise<boolean>;
  getActive(): Promise<string | null>;
  onChange(callback: (workspaceId: string | null) => void): Promise<string>;
}

// ─── cache (fn-41) ──────────────────────────────────

export interface CacheSetOptions {
  ttl?: number;
  persist?: boolean;
}

export interface CacheAPI {
  get(key: string): Promise<unknown | null>;
  set(key: string, value: unknown, options?: CacheSetOptions): Promise<true>;
  remove(key: string): Promise<true>;
  clear(): Promise<true>;
  has(key: string): Promise<boolean>;
  keys(): Promise<string[]>;
}

// ─── feedback (fn-41) ───────────────────────────────

export interface FeedbackAPI {
  toast(message: string, options?: { kind?: "info" | "success" | "warning" | "error"; duration?: number }): Promise<boolean>;
  hud(message: string, options?: { kind?: "info" | "success" | "warning" | "error"; progress?: number }): Promise<string>;
  updateHud(id: string, options: { progress?: number; message?: string }): Promise<true>;
  dismissHud(id: string): Promise<true>;
  alert(message: string, options?: { informativeText?: string; buttons?: string[]; style?: "informational" | "warning" | "critical" }): Promise<number>;
  systemNotification(title: string, message: string, options?: unknown): Promise<true>;
  notify(message: string, options?: { kind?: "info" | "success" | "warning" | "error"; duration?: number }): Promise<true>;
}

// ─── oauth (fn-41) ──────────────────────────────────

export interface OAuthTokenResult {
  accessToken: string;
  tokenType: string;
  expiresAt: string | null;
  scopes: string[];
}

export interface OAuthAPI {
  authorize(provider: string, options: { clientId: string; scopes?: string[] }): Promise<OAuthTokenResult>;
  getToken(provider: string): Promise<OAuthTokenResult | null>;
  revoke(provider: string): Promise<true>;
  isAuthorized(provider: string): Promise<boolean>;
}

// ─── menubar (fn-41) ────────────────────────────────

export interface MenuBarRenderContext {
  pluginId: string;
  setContent(descriptor: ViewDescriptor): void;
  close(): void;
  cache?: Pick<CacheAPI, "get" | "set" | "remove">;
}

export interface MenubarAPI {
  register(options: { icon: SFSymbolName; label?: string }): Promise<true>;
  update(options: { icon?: SFSymbolName; label?: string }): Promise<true>;
  setBadge(count: number): Promise<true>;
  setContent(descriptor: ViewDescriptor): Promise<true>;
  remove(): Promise<true>;
}
