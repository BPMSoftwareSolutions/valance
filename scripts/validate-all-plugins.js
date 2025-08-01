#!/usr/bin/env node

/**
 * Comprehensive Plugin Directory Validation Script
 *
 * This script validates entire plugin directories as architectural units,
 * addressing the fundamental flaw of validating individual files.
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const PLUGINS_DIR = "testdata/RenderX/public/plugins";
const VALIDATOR = "CIA/spa-plugin-export-compliance";

async function validateAllPlugins() {
  console.log("🔍 Comprehensive Plugin Directory Validation");
  console.log("=".repeat(50));

  // Find all plugin directories
  const pluginDirs = fs.readdirSync(PLUGINS_DIR).filter((dir) => {
    const fullPath = path.join(PLUGINS_DIR, dir);
    return fs.statSync(fullPath).isDirectory() && dir.includes("symphony");
  });

  console.log(`Found ${pluginDirs.length} plugin directories:`);
  pluginDirs.forEach((dir) => console.log(`  - ${dir}`));
  console.log();

  let totalPassed = 0;
  let totalFailed = 0;
  const results = [];

  for (const pluginDir of pluginDirs) {
    const pluginPath = path.join(PLUGINS_DIR, pluginDir);
    console.log(`🔍 Validating Plugin: ${pluginDir}`);
    console.log("-".repeat(40));

    const pluginResult = await validatePluginDirectory(pluginPath, pluginDir);
    results.push(pluginResult);

    if (pluginResult.passed) {
      totalPassed++;
      console.log(`✅ ${pluginDir}: PASSED`);
    } else {
      totalFailed++;
      console.log(`❌ ${pluginDir}: FAILED`);
      console.log(`   Issues: ${pluginResult.issues.join(", ")}`);
    }
    console.log();
  }

  // Summary
  console.log("📊 VALIDATION SUMMARY");
  console.log("=".repeat(50));
  console.log(`Total Plugins: ${pluginDirs.length}`);
  console.log(`✅ Passed: ${totalPassed}`);
  console.log(`❌ Failed: ${totalFailed}`);
  console.log();

  if (totalFailed > 0) {
    console.log("❌ FAILED PLUGINS:");
    results
      .filter((r) => !r.passed)
      .forEach((result) => {
        console.log(`  - ${result.pluginName}:`);
        result.issues.forEach((issue) => console.log(`    * ${issue}`));
      });
    process.exit(1);
  } else {
    console.log("🎉 ALL PLUGINS PASSED VALIDATION!");
    process.exit(0);
  }
}

async function validatePluginDirectory(pluginPath, pluginName) {
  const issues = [];
  let passed = true;

  // 1. Check for forbidden TypeScript files
  const forbiddenFiles = ["index.ts", "sequence.ts"];
  for (const file of forbiddenFiles) {
    const filePath = path.join(pluginPath, file);
    if (fs.existsSync(filePath)) {
      issues.push(`Forbidden TypeScript file: ${file}`);
      passed = false;
    }
  }

  // 2. Check for required files
  const requiredFiles = ["index.js", "sequence.js", "manifest.json"];
  for (const file of requiredFiles) {
    const filePath = path.join(pluginPath, file);
    if (!fs.existsSync(filePath)) {
      issues.push(`Missing required file: ${file}`);
      passed = false;
    }
  }

  // 3. Validate index.js with existing validator (if it exists)
  const indexJsPath = path.join(pluginPath, "index.js");
  if (fs.existsSync(indexJsPath)) {
    try {
      const validatorCmd = `node cli/cli.js --validator ${VALIDATOR} --files "${indexJsPath}"`;
      const output = execSync(validatorCmd, {
        encoding: "utf8",
        cwd: process.cwd(),
      });

      if (!output.includes("✅ PASS")) {
        issues.push("index.js failed CIA export compliance validation");
        passed = false;
      }
    } catch (error) {
      issues.push("index.js validation error");
      passed = false;
    }
  }

  // 4. Check directory structure recursively
  const allFiles = getAllFilesRecursively(pluginPath);
  const jsFiles = allFiles.filter((f) => f.endsWith(".js"));
  const tsFiles = allFiles.filter((f) => f.endsWith(".ts"));

  if (tsFiles.length > 0) {
    issues.push(
      `${
        tsFiles.length
      } TypeScript files found recursively (should be 0): ${tsFiles
        .map((f) => path.relative(pluginPath, f))
        .join(", ")}`
    );
    passed = false;
  }

  return {
    pluginName,
    pluginPath,
    passed,
    issues,
    metadata: {
      totalFiles: allFiles.length,
      jsFiles: jsFiles.length,
      tsFiles: tsFiles.length,
      hasRequiredFiles: requiredFiles.every((f) =>
        fs.existsSync(path.join(pluginPath, f))
      ),
    },
  };
}

// Helper function to recursively get all files
function getAllFilesRecursively(dir) {
  const files = [];

  function scanDirectory(currentDir) {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else {
        files.push(fullPath);
      }
    }
  }

  scanDirectory(dir);
  return files;
}

// Run validation
validateAllPlugins().catch((error) => {
  console.error("❌ Validation script error:", error);
  process.exit(1);
});
