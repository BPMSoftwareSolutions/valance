#!/usr/bin/env node

/**
 * Bundle script to create single ESM output files for each plugin
 * This bundles all internal imports while keeping external dependencies external
 */

import { promises as fs } from "fs";
import path from "path";
import { build } from "vite";
import { glob } from "glob";

const PLUGINS_DIR = "public/plugins";

/**
 * Create a temporary Vite config for each plugin
 */
function createViteConfig(pluginDir, pluginName) {
  return {
    root: pluginDir,
    build: {
      lib: {
        entry: "index.ts",
        formats: ["es"],
        fileName: "plugin",
      },
      ssr: false,
      outDir: "dist",
      emptyOutDir: true,
      rollupOptions: {
        // Bundle everything - no externals for fully self-contained plugins
        external: [],
        output: {
          format: "es",
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
}

/**
 * Bundle a single plugin
 */
async function bundlePlugin(pluginDir, pluginName) {
  try {
    console.log(`🔗 Bundling plugin: ${pluginName}`);

    // Check if plugin has index.ts entry point
    const entryPath = path.join(pluginDir, "index.ts");
    const entryExists = await fs
      .access(entryPath)
      .then(() => true)
      .catch(() => false);

    if (!entryExists) {
      console.log(`⚠️ Skipping ${pluginName}: No index.ts entry point found`);
      return false;
    }

    // Create Vite config for this plugin
    const config = createViteConfig(pluginDir, pluginName);

    // Build the plugin
    await build(config);

    console.log(`✅ Bundled: ${pluginName} -> dist/plugin.js`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to bundle plugin ${pluginName}:`, error.message);
    return false;
  }
}

/**
 * Main bundling function
 */
async function bundleAllPlugins() {
  console.log("🔗 Bundling all plugins into single ESM files...");

  try {
    // Find all plugin directories
    const pluginDirs = await glob(`${PLUGINS_DIR}/*/`, {
      onlyDirectories: true,
    });
    console.log(`Found ${pluginDirs.length} plugin directories`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    // Bundle each plugin
    for (const pluginDir of pluginDirs) {
      const pluginName = path.basename(pluginDir);
      const result = await bundlePlugin(pluginDir, pluginName);

      if (result === true) {
        successCount++;
      } else if (result === false) {
        skipCount++;
      } else {
        errorCount++;
      }
    }

    console.log("\n🎉 Plugin bundling complete!");
    console.log(`✅ Bundled: ${successCount} plugins`);
    console.log(`⚠️ Skipped: ${skipCount} plugins (no index.ts)`);
    console.log(`❌ Failed: ${errorCount} plugins`);
  } catch (error) {
    console.error("❌ Plugin bundling failed:", error);
    process.exit(1);
  }
}

// Run the bundling
bundleAllPlugins();
