#!/usr/bin/env node

/**
 * Build script to transform TypeScript plugin files to JavaScript
 * This ensures plugins can be loaded at runtime without TypeScript compilation issues
 */

import { promises as fs } from "fs";
import path from "path";
import { build, transformSync } from "esbuild";
import { glob } from "glob";

const PLUGINS_DIR = "public/plugins";
const EXTENSIONS = [".ts", ".tsx"];

async function buildPlugins() {
  console.log("🔨 Building TypeScript and JavaScript plugins...");

  try {
    // Find all TypeScript and JavaScript files in plugins directory
    const sourceFiles = await glob(`${PLUGINS_DIR}/**/*.{ts,tsx,js,jsx}`);
    console.log(`Found ${sourceFiles.length} source files to transform`);

    let transformedCount = 0;
    let errorCount = 0;

    for (const sourceFile of sourceFiles) {
      try {
        // Read the source file
        const content = await fs.readFile(sourceFile, "utf-8");

        // Determine the loader based on file extension
        let loader;
        if (sourceFile.endsWith(".tsx")) {
          loader = "tsx";
        } else if (sourceFile.endsWith(".ts")) {
          loader = "ts";
        } else if (sourceFile.endsWith(".jsx")) {
          loader = "jsx";
        } else {
          loader = "js";
        }

        // Check if file has external imports that need bundling
        const hasExternalImports = content.includes("../../../src/");

        let result;
        if (hasExternalImports) {
          // Use build API for bundling external dependencies
          console.log(`🔗 Bundling external dependencies for: ${sourceFile}`);

          const buildResult = await build({
            stdin: {
              contents: content,
              loader: loader,
              resolveDir: path.dirname(sourceFile),
            },
            format: "cjs",
            target: "es2020",
            jsx: "automatic",
            jsxImportSource: "react",
            bundle: true,
            external: ["react", "react-dom"],
            write: false,
            outdir: ".",
          });

          result = { code: buildResult.outputFiles[0].text };
        } else {
          // Use transformSync for simple transformation
          result = transformSync(content, {
            loader: loader,
            format: "cjs", // Use CommonJS to avoid ES module imports
            target: "es2020",
            jsx: "automatic",
            jsxImportSource: "react",
          });
        }

        // Write the JavaScript file (replace .ts/.tsx with .js, keep .js/.jsx as .js)
        const jsFile = sourceFile.replace(/\.(tsx?|jsx?)$/, ".js");
        await fs.writeFile(jsFile, result.code, "utf-8");

        console.log(`✅ Transformed: ${sourceFile} -> ${jsFile}`);
        transformedCount++;
      } catch (error) {
        console.error(`❌ Failed to transform ${sourceFile}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n🎉 Plugin build complete!`);
    console.log(`✅ Transformed: ${transformedCount} files`);
    if (errorCount > 0) {
      console.log(`❌ Errors: ${errorCount} files`);
    }
  } catch (error) {
    console.error("❌ Plugin build failed:", error);
    process.exit(1);
  }
}

// Run the build
buildPlugins();
