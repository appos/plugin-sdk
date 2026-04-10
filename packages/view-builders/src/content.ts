import type {
  TextDescriptor,
  LabelDescriptor,
  ImageDescriptor,
  BadgeDescriptor,
  ButtonDescriptor,
  ListItemDescriptor,
  ViewDescriptor,
  PluginFont,
  PluginColor,
  SFSymbolName,
} from "@appos.space/plugin-types";
import { stripUndefined } from "./util.js";

export function text(content: string, opts?: {
  font?: PluginFont;
  width?: number;
  align?: "leading" | "trailing" | "center";
  mono?: boolean;
  tooltip?: string;
}): TextDescriptor {
  return { type: "text", properties: stripUndefined({ content, ...opts }) };
}

export function label(title: string, opts?: {
  icon?: SFSymbolName;
  font?: PluginFont;
}): LabelDescriptor {
  return { type: "label", properties: stripUndefined({ title, ...opts }) };
}

export function image(systemName: SFSymbolName): ImageDescriptor {
  return { type: "image", properties: { systemName } };
}

export function badge(textOrContent: string, opts?: {
  color?: PluginColor;
}): BadgeDescriptor {
  return { type: "badge", properties: stripUndefined({ text: textOrContent, ...opts }) };
}

export function button(title: string, opts: {
  action: string;
  tooltip?: string;
  width?: number;
}): ButtonDescriptor {
  return { type: "button", properties: stripUndefined({ title, ...opts }) };
}

export function listItem(title: string, opts?: {
  subtitle?: string;
  icon?: SFSymbolName;
  iconColor?: PluginColor;
  action?: string;
  trailing?: string;
  menuActions?: string;
}, children?: ViewDescriptor[]): ListItemDescriptor {
  return {
    type: "listItem",
    properties: stripUndefined({ title, ...opts }),
    ...(children && { children }),
  };
}
