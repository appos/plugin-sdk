// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import { createStarlightTypeDocPlugin } from "starlight-typedoc";

// One starlight-typedoc instance per SDK package. Single-entry-point mode is
// used deliberately: in multi-entry-point mode starlight-typedoc deletes the
// per-module index pages, which leaves broken "Modules" links on the API
// index. One instance per package gives each package a working index page.
const [typesPlugin, typesSidebarGroup] = createStarlightTypeDocPlugin();
const [buildersPlugin, buildersSidebarGroup] = createStarlightTypeDocPlugin();
const [utilsPlugin, utilsSidebarGroup] = createStarlightTypeDocPlugin();

/** Shared TypeDoc options for all three instances. */
const sharedTypeDoc = {
  readme: "none",
  excludeInternal: true,
  excludePrivate: true,
  excludeProtected: true,
  sort: ["source-order"],
};

// https://astro.build/config
export default defineConfig({
  site: "https://docs.appos.space",
  // Friendly alias for the API reference landing page.
  redirects: {
    "/api": "/api/plugin-types/readme",
  },
  integrations: [
    starlight({
      title: "AppOS Plugin SDK",
      description:
        "Developer documentation for the AppOS Plugin SDK — plugin-types, view-builders, plugin-utils, manifest schema, and permission scopes.",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/appos/plugin-sdk",
        },
      ],
      editLink: {
        baseUrl: "https://github.com/appos/plugin-sdk/edit/main/docs-site/",
      },
      plugins: [
        // API Reference generated from the SDK's TypeScript source of truth.
        // Output lands in src/content/docs/api/ at build time (gitignored).
        typesPlugin({
          entryPoints: ["../packages/plugin-types/src/index.ts"],
          tsconfig: "./tsconfig.typedoc.json",
          output: "api/plugin-types",
          sidebar: { label: "plugin-types", collapsed: true },
          typeDoc: sharedTypeDoc,
        }),
        buildersPlugin({
          entryPoints: ["../packages/view-builders/src/index.ts"],
          tsconfig: "./tsconfig.typedoc.json",
          output: "api/view-builders",
          sidebar: { label: "view-builders", collapsed: true },
          typeDoc: sharedTypeDoc,
        }),
        utilsPlugin({
          entryPoints: ["../packages/plugin-utils/src/index.ts"],
          tsconfig: "./tsconfig.typedoc.json",
          output: "api/plugin-utils",
          sidebar: { label: "plugin-utils", collapsed: true },
          typeDoc: sharedTypeDoc,
        }),
      ],
      sidebar: [
        {
          label: "Getting Started",
          items: [
            { slug: "getting-started/installation" },
            { slug: "getting-started/first-plugin" },
            { slug: "getting-started/packages" },
          ],
        },
        {
          label: "API Reference",
          items: [
            { slug: "reference/namespaces" },
            typesSidebarGroup,
            buildersSidebarGroup,
            utilsSidebarGroup,
          ],
        },
        {
          label: "Manifest & Permissions",
          items: [
            { slug: "manifest" },
            { slug: "manifest/reference" },
            { slug: "manifest/permission-scopes" },
            { slug: "manifest/limits" },
          ],
        },
        {
          label: "Extension Points",
          items: [
            { slug: "extension-points" },
            { slug: "extension-points/event-topics" },
          ],
        },
      ],
    }),
  ],
});
