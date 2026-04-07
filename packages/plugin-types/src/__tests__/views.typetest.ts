/**
 * Compile-time type tests for ViewDescriptor discriminated union.
 *
 * This file is NOT executed — it only needs to compile (or fail to compile)
 * to verify type correctness. Lines marked @ts-expect-error MUST produce
 * a type error; if they don't, the build will fail.
 */

import type {
  ViewDescriptor,
  ViewDescriptorType,
  MenuAction,
  VStackDescriptor,
  HStackDescriptor,
  ScrollDescriptor,
  ListDescriptor,
  GridDescriptor,
  SectionDescriptor,
  TextDescriptor,
  LabelDescriptor,
  ImageDescriptor,
  BadgeDescriptor,
  ButtonDescriptor,
  ListItemDescriptor,
  DividerDescriptor,
  SpacerDescriptor,
  TextFieldDescriptor,
  ProgressDescriptor,
  RemoteImageDescriptor,
} from "../views";

// ── ViewDescriptorType is the union of all `type` literals ──

const _allTypes: ViewDescriptorType[] = [
  "vstack",
  "hstack",
  "scroll",
  "list",
  "grid",
  "section",
  "text",
  "label",
  "image",
  "badge",
  "button",
  "listItem",
  "divider",
  "spacer",
  "textField",
  "progress",
  "remoteImage",
];

// ── Typo detection — the key acceptance criterion ──

// @ts-expect-error "lisItem" is not a valid type (typo for "listItem")
const _typo: ViewDescriptor = { type: "lisItem", properties: { title: "x" } };

// @ts-expect-error "vStack" is not a valid type (wrong case)
const _wrongCase: ViewDescriptor = { type: "vStack", children: [] };

// @ts-expect-error unknown type
const _unknown: ViewDescriptor = { type: "foobar" };

// ── Valid descriptors compile without error ──

const _text: ViewDescriptor = {
  type: "text",
  properties: { content: "hello" },
};

const _vstack: ViewDescriptor = {
  type: "vstack",
  children: [{ type: "text", properties: { content: "child" } }],
};

const _listItem: ViewDescriptor = {
  type: "listItem",
  properties: {
    title: "Item",
    menuActions: JSON.stringify([
      { title: "Delete", icon: "trash", action: "delete", destructive: true },
    ] satisfies MenuAction[]),
  },
};

const _progress: ViewDescriptor = {
  type: "progress",
  properties: { value: 0.5, label: "Loading", style: "circular" },
};

const _remoteImage: ViewDescriptor = {
  type: "remoteImage",
  properties: { url: "https://example.com/img.png", maxDimension: 256 },
};

// ── Container types require children ──

// @ts-expect-error vstack requires children
const _noChildren: VStackDescriptor = { type: "vstack" };

// ── MenuAction shape ──

const _action: MenuAction = { title: "Copy", icon: "doc.on.doc", action: "copy" };
const _destructive: MenuAction = { title: "Delete", destructive: true };

// Suppress unused variable warnings — these are type tests only
void _allTypes;
void _typo;
void _wrongCase;
void _unknown;
void _text;
void _vstack;
void _listItem;
void _progress;
void _remoteImage;
void _noChildren;
void _action;
void _destructive;
