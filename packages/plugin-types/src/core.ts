/**
 * Core plugin types — lifecycle, context, manifest.
 */

import type { PermissionScope } from "./permissions";
import type { CommandsAPI } from "./namespaces";
import type { FileOpsAPI } from "./namespaces";
import type { UIAPI } from "./namespaces";
import type { StorageAPI } from "./namespaces";
import type { SettingsAPI } from "./namespaces";
import type { EventsAPI } from "./namespaces";
import type { ShellAPI } from "./namespaces";
import type { ClipboardAPI } from "./namespaces";
import type { NetworkAPI } from "./namespaces";
import type { ShortcutsAPI } from "./namespaces";
import type { ThemesAPI } from "./namespaces";
import type { SmartFoldersAPI } from "./namespaces";
import type { PreviewAPI } from "./namespaces";
import type { ExtensionPointsAPI } from "./namespaces";
import type { DataContractsAPI } from "./namespaces";
import type { InterPluginEventsAPI } from "./namespaces";
import type { LifecycleAPI } from "./namespaces";
import type { WorkspacesAPI } from "./namespaces";
import type { CacheAPI } from "./namespaces";
import type { FeedbackAPI } from "./namespaces";
import type { OAuthAPI } from "./namespaces";
import type { MenubarAPI } from "./namespaces";

/**
 * The context object passed to `activate()`. Provides access to all 22 API namespaces.
 */
export interface PluginContext {
  readonly pluginId: string;
  readonly pluginVersion: string;
  readonly hostVersion: string;

  readonly commands: CommandsAPI;
  readonly fileOps: FileOpsAPI;
  readonly ui: UIAPI;
  readonly storage: StorageAPI;
  readonly settings: SettingsAPI;
  readonly events: EventsAPI;
  readonly shell: ShellAPI;
  readonly clipboard: ClipboardAPI;
  readonly network: NetworkAPI;
  readonly shortcuts: ShortcutsAPI;
  readonly themes: ThemesAPI;
  readonly smartFolders: SmartFoldersAPI;
  readonly preview: PreviewAPI;
  readonly extensionPoints: ExtensionPointsAPI;
  readonly dataContracts: DataContractsAPI;
  readonly interPluginEvents: InterPluginEventsAPI;
  readonly lifecycle: LifecycleAPI;
  readonly workspaces: WorkspacesAPI;
  readonly cache: CacheAPI;
  readonly feedback: FeedbackAPI;
  readonly oauth: OAuthAPI;
  readonly menubar: MenubarAPI;
}

/**
 * Plugin manifest (plugin.json) shape.
 */
export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  runtime: "javascript";
  entrypoint: string;
  minHostVersion?: string;
  author?: string;
  description?: string;
  license?: string;
  activation?: { events: ActivationEvent[] };
  permissions?: PermissionScope[];
  shellCommands?: string[];
  shellDeniedPatterns?: string[];
  networkDomains?: string[];
  settings?: SettingDefinition[];
  oauth?: { providers: OAuthProviderDeclaration[] };
  menubar?: { icon: string; label?: string; globalShortcut?: string };
}

export type ActivationEvent = "onStartup";

export interface SettingDefinition {
  key: string;
  label: string;
  type: "bool" | "number" | "enum" | "string";
  default?: unknown;
  options?: unknown[];
  min?: number;
  max?: number;
}

export interface OAuthProviderDeclaration {
  id: string;
  scopes: string[];
  reason?: string;
}

/**
 * File descriptor returned by fileOps methods.
 */
export interface PluginFileDescriptor {
  url: string;
  name: string;
  isDirectory: boolean;
  size: number | null;
  modificationDate: string | null;
  isHidden: boolean;
  fileExtension: string | null;
}
