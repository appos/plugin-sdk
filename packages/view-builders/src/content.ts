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
} from "@twopanez/plugin-types";

export function text(content: string, opts?: {
  font?: PluginFont;
  width?: number;
  align?: "leading" | "trailing" | "center";
  mono?: boolean;
  tooltip?: string;
}): TextDescriptor {
  return { type: "text", properties: { content, ...opts } };
}

export function label(title: string, opts?: {
  icon?: string;
  font?: PluginFont;
}): LabelDescriptor {
  return { type: "label", properties: { title, ...opts } };
}

export function image(systemName: string): ImageDescriptor {
  return { type: "image", properties: { systemName } };
}

export function badge(textOrContent: string, opts?: {
  color?: PluginColor;
}): BadgeDescriptor {
  return { type: "badge", properties: { text: textOrContent, ...opts } };
}

export function button(title: string, opts: {
  action: string;
  tooltip?: string;
  width?: number;
}): ButtonDescriptor {
  return { type: "button", properties: { title, ...opts } };
}

export function listItem(title: string, opts?: {
  subtitle?: string;
  icon?: string;
  iconColor?: PluginColor;
  action?: string;
  menuActions?: string;
}, children?: ViewDescriptor[]): ListItemDescriptor {
  return {
    type: "listItem",
    properties: { title, ...opts },
    ...(children && { children }),
  };
}
