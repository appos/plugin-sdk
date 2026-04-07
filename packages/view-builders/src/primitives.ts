import type {
  DividerDescriptor,
  SpacerDescriptor,
  TextFieldDescriptor,
  ProgressDescriptor,
  RemoteImageDescriptor,
} from "@appos/plugin-types";

export function divider(): DividerDescriptor {
  return { type: "divider" };
}

export function spacer(minLength?: number): SpacerDescriptor {
  return { type: "spacer", ...(minLength != null && { properties: { minLength } }) };
}

export function textField(opts?: {
  placeholder?: string;
  text?: string;
  action?: string;
}): TextFieldDescriptor {
  return { type: "textField", properties: { ...opts } };
}

export function progress(opts?: {
  value?: number;
  label?: string;
}): ProgressDescriptor {
  return { type: "progress", ...(opts && { properties: opts }) };
}

export function remoteImage(url: string, opts?: {
  width?: number;
  height?: number;
  cornerRadius?: number;
}): RemoteImageDescriptor {
  return { type: "remoteImage", properties: { url, ...opts } };
}
