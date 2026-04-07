/**
 * ViewDescriptor system — typed UI tree definitions.
 *
 * The discriminated union on `type` ensures compile-time validation
 * of widget types and their required properties.
 */

import type { PluginColor } from "./colors";
import type { PluginFont } from "./fonts";

// ─── Base ───────────────────────────────────────────

export interface ViewDescriptorBase {
  id?: string;
}

// ─── Container types ────────────────────────────────

export interface VStackDescriptor extends ViewDescriptorBase {
  type: "vstack";
  children: ViewDescriptor[];
  properties?: { spacing?: number };
}

export interface HStackDescriptor extends ViewDescriptorBase {
  type: "hstack";
  children: ViewDescriptor[];
  properties?: { spacing?: number };
}

export interface ScrollDescriptor extends ViewDescriptorBase {
  type: "scroll";
  children: ViewDescriptor[];
  properties?: { axes?: "horizontal" | "vertical" };
}

export interface ListDescriptor extends ViewDescriptorBase {
  type: "list";
  children: ViewDescriptor[];
}

export interface GridDescriptor extends ViewDescriptorBase {
  type: "grid";
  children: ViewDescriptor[];
  properties?: { columns?: number; spacing?: number };
}

export interface SectionDescriptor extends ViewDescriptorBase {
  type: "section";
  children: ViewDescriptor[];
  properties: {
    title: string;
    icon?: string;
    badge?: string;
    isExpanded?: boolean;
    id?: string;
  };
}

// ─── Content types ──────────────────────────────────

export interface TextDescriptor extends ViewDescriptorBase {
  type: "text";
  properties: {
    content: string;
    font?: PluginFont;
    width?: number;
    align?: "leading" | "trailing" | "center";
    mono?: boolean;
    tooltip?: string;
  };
}

export interface LabelDescriptor extends ViewDescriptorBase {
  type: "label";
  properties: {
    title: string;
    icon?: string;
    font?: PluginFont;
  };
}

export interface ImageDescriptor extends ViewDescriptorBase {
  type: "image";
  properties: {
    systemName: string;
  };
}

export interface BadgeDescriptor extends ViewDescriptorBase {
  type: "badge";
  properties: {
    text?: string;
    content?: string;
    color?: PluginColor;
  };
}

export interface ButtonDescriptor extends ViewDescriptorBase {
  type: "button";
  properties: {
    title: string;
    action: string;
    tooltip?: string;
    width?: number;
  };
}

export interface ListItemDescriptor extends ViewDescriptorBase {
  type: "listItem";
  children?: ViewDescriptor[];
  properties: {
    title: string;
    subtitle?: string;
    icon?: string;
    iconColor?: PluginColor;
    action?: string;
    menuActions?: string; // JSON-encoded MenuAction[]
  };
}

export interface MenuAction {
  title: string;
  icon?: string;
  action?: string;
  destructive?: boolean;
}

// ─── Layout primitives ──────────────────────────────

export interface DividerDescriptor extends ViewDescriptorBase {
  type: "divider";
}

export interface SpacerDescriptor extends ViewDescriptorBase {
  type: "spacer";
  properties?: { minLength?: number };
}

// ─── fn-48 types ────────────────────────────────────

export interface TextFieldDescriptor extends ViewDescriptorBase {
  type: "textField";
  properties: {
    placeholder?: string;
    text?: string;
    action?: string;
  };
}

export interface ProgressDescriptor extends ViewDescriptorBase {
  type: "progress";
  properties?: {
    value?: number; // 0–1, omit for indeterminate
    label?: string;
  };
}

export interface RemoteImageDescriptor extends ViewDescriptorBase {
  type: "remoteImage";
  properties: {
    url: string;
    width?: number;
    height?: number;
    cornerRadius?: number;
  };
}

// ─── Discriminated union ────────────────────────────

export type ViewDescriptor =
  | VStackDescriptor
  | HStackDescriptor
  | ScrollDescriptor
  | ListDescriptor
  | GridDescriptor
  | SectionDescriptor
  | TextDescriptor
  | LabelDescriptor
  | ImageDescriptor
  | BadgeDescriptor
  | ButtonDescriptor
  | ListItemDescriptor
  | DividerDescriptor
  | SpacerDescriptor
  | TextFieldDescriptor
  | ProgressDescriptor
  | RemoteImageDescriptor;

export type ViewDescriptorType = ViewDescriptor["type"];
