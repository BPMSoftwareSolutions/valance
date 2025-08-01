#!/usr/bin/env node

/**
 * Bundle the React plugin into a self-contained ESM file
 * This will fix the "module is not defined" issue
 */

import { build } from "vite";
import { promises as fs } from "fs";
import path from "path";

async function bundleReactPlugin() {
  console.log("🔗 Bundling React plugin...");

  try {
    const pluginDir = "public/plugins/react-plugin";

    // Create Vite config for bundling
    const config = {
      root: pluginDir,
      build: {
        lib: {
          entry: "index.ts",
          formats: ["es"],
          fileName: "plugin",
        },
        outDir: "dist",
        emptyOutDir: true,
        ssr: false,
        rollupOptions: {
          // Bundle everything - no externals for self-contained plugin
          external: [],
          output: {
            format: "cjs", // Force CommonJS to reproduce RenderX issue
            entryFileNames: "plugin.js",
            exports: "named",
          },
        },
        target: "es2020",
        minify: false, // Keep readable for debugging
      },
      esbuild: {
        jsx: "automatic",
        jsxImportSource: "react",
      },
      resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx"],
      },
      define: {
        "process.env.NODE_ENV": '"production"',
        process: "{}",
      },
    };

    // Build the plugin
    await build(config);

    console.log("✅ React plugin bundled successfully!");
    console.log("📦 Output: public/plugins/react-plugin/dist/plugin.js");
  } catch (error) {
    console.error("❌ Failed to bundle React plugin:", error);
    process.exit(1);
  }
}

bundleReactPlugin();
