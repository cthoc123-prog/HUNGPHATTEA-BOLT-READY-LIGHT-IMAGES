// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import path from "node:path";

import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const appSrc = path.resolve(process.cwd(), "src");
const localizedRuntime = path.resolve(appSrc, "lib/i18n-jsx/jsx-runtime.ts");

/**
 * Routes the JSX runtime of app source files through the locale-aware runtime,
 * so English pages reuse the existing components instead of duplicating them.
 */
function localizedJsxRuntime() {
  return {
    name: "hung-phat-localized-jsx-runtime",
    enforce: "pre" as const,
    resolveId(source: string, importer: string | undefined) {
      if (source !== "react/jsx-runtime" && source !== "react/jsx-dev-runtime") return null;
      if (!importer) return null;
      const normalized = importer.split("?")[0] ?? "";
      if (!normalized.startsWith(appSrc)) return null;
      if (normalized.startsWith(path.resolve(appSrc, "lib/i18n-jsx"))) return null;
      return localizedRuntime;
    },
  };
}

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    plugins: [localizedJsxRuntime()],
  },
});
