import fs from "fs/promises";
import path from "path";

export const operator = "validateSpaDirectoryStructure";

export async function evaluate(files, rule, context) {
  try {
    // For structure validation, files is an array of file paths
    if (!Array.isArray(files) || files.length === 0) {
      return {
        passed: false,
        message: "No files provided for SPA directory structure validation",
      };
    }

    // Group files by their plugin directory
    const pluginDirs = new Map();

    // First pass: identify plugin directories by manifest.json
    const manifestDirs = new Set();
    for (const file of files) {
      const dir = path.dirname(file);
      const fileName = path.basename(file);

      if (fileName === "manifest.json") {
        manifestDirs.add(dir);
      }
    }

    // Second pass: collect all files for identified plugin directories
    for (const file of files) {
      const dir = path.dirname(file);
      const fileName = path.basename(file);

      // Only process files in directories that have manifest.json
      if (manifestDirs.has(dir)) {
        if (!pluginDirs.has(dir)) {
          pluginDirs.set(dir, new Set());
        }
        pluginDirs.get(dir).add(file);
      }
    }

    if (pluginDirs.size === 0) {
      return {
        passed: true,
        message: "No SPA plugin directories detected",
      };
    }

    const errors = [];
    const warnings = [];

    // Validate each detected plugin directory
    for (const [pluginDir, pluginFiles] of pluginDirs) {
      const validation = await validateSinglePlugin(
        pluginDir,
        pluginFiles,
        files
      );

      if (!validation.passed) {
        errors.push(`${pluginDir}: ${validation.message}`);
      }

      if (validation.warnings) {
        warnings.push(...validation.warnings.map((w) => `${pluginDir}: ${w}`));
      }
    }

    const result = {
      passed: errors.length === 0,
      message:
        errors.length === 0
          ? `Validated ${pluginDirs.size} SPA plugin(s) successfully`
          : `SPA directory structure validation failed: ${errors.join("; ")}`,
    };

    if (warnings.length > 0 && rule.verbose) {
      result.warnings = warnings;
    }

    return result;
  } catch (error) {
    return {
      passed: false,
      message: `SPA directory structure validation error: ${error.message}`,
    };
  }
}

async function validateSinglePlugin(pluginDir, pluginFiles, allFiles) {
  const errors = [];
  const warnings = [];

  // Required files check
  const requiredFiles = ["manifest.json", "sequence.js", "index.js"];
  const fileNames = Array.from(pluginFiles).map((f) => path.basename(f));

  for (const required of requiredFiles) {
    if (!fileNames.includes(required)) {
      errors.push(`Missing required file: ${required}`);
    }
  }

  // Required directories check
  const handlersDir = path.join(pluginDir, "handlers");
  const hasHandlersDir = allFiles.some((f) =>
    f.startsWith(handlersDir + path.sep)
  );

  if (!hasHandlersDir) {
    errors.push("Missing required directory: handlers/");
  } else {
    // Check if handlers directory is non-empty
    const handlerFiles = allFiles.filter((f) =>
      f.startsWith(handlersDir + path.sep)
    );
    if (handlerFiles.length === 0) {
      errors.push("handlers/ directory exists but is empty");
    }
  }

  // Optional directories recognition
  const optionalDirs = ["hooks", "logic", "visuals", "tests"];
  const foundOptionalDirs = [];

  for (const optDir of optionalDirs) {
    const optDirPath = path.join(pluginDir, optDir);
    const hasOptDir = allFiles.some((f) => f.startsWith(optDirPath + path.sep));
    if (hasOptDir) {
      foundOptionalDirs.push(optDir);
    }
  }

  if (foundOptionalDirs.length > 0) {
    warnings.push(
      `Found optional directories: ${foundOptionalDirs.join(", ")}`
    );
  }

  // Plugin naming convention check
  const pluginName = path.basename(pluginDir);
  if (!pluginName.match(/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/)) {
    warnings.push(
      `Plugin directory name '${pluginName}' should follow kebab-case convention`
    );
  }

  return {
    passed: errors.length === 0,
    message:
      errors.length === 0 ? "Directory structure valid" : errors.join(", "),
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}
