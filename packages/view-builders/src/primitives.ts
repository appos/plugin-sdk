import type {
  DividerDescriptor,
  SpacerDescriptor,
  TextFieldDescriptor,
  ProgressDescriptor,
  RemoteImageDescriptor,
} from "@appos/plugin-types";
import { stripUndefined } from "./util";

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
  const props = opts ? stripUndefined(opts) : {};
  return { type: "textField", properties: props };
}

export function progress(opts?: {
  value?: number;
  label?: string;
  style?: "bar" | "circular";
}): ProgressDescriptor {
  return { type: "progress", ...(opts && { properties: stripUndefined(opts) }) };
}

export function remoteImage(url: string, opts?: {
  width?: number;
  height?: number;
  cornerRadius?: number;
  maxDimension?: number;
}): RemoteImageDescriptor {
  return { type: "remoteImage", properties: stripUndefined({ url, ...opts }) };
}
