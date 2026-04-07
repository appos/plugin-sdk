import type {
  ViewDescriptor,
  VStackDescriptor,
  HStackDescriptor,
  ScrollDescriptor,
  ListDescriptor,
  GridDescriptor,
  SectionDescriptor,
} from "@twopanez/plugin-types";

export function vstack(children: ViewDescriptor[], opts?: { spacing?: number }): VStackDescriptor {
  return { type: "vstack", children, ...(opts && { properties: opts }) };
}

export function hstack(children: ViewDescriptor[], opts?: { spacing?: number }): HStackDescriptor {
  return { type: "hstack", children, ...(opts && { properties: opts }) };
}

export function scroll(children: ViewDescriptor[], opts?: { axes?: "horizontal" | "vertical" }): ScrollDescriptor {
  return { type: "scroll", children, ...(opts && { properties: opts }) };
}

export function list(children: ViewDescriptor[]): ListDescriptor {
  return { type: "list", children };
}

export function grid(children: ViewDescriptor[], opts?: { columns?: number; spacing?: number }): GridDescriptor {
  return { type: "grid", children, ...(opts && { properties: opts }) };
}

export function section(
  title: string,
  opts: { icon?: string; badge?: string; isExpanded?: boolean; id?: string },
  children: ViewDescriptor[],
): SectionDescriptor {
  return { type: "section", children, properties: { title, ...opts } };
}
