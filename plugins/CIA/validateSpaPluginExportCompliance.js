export const operator = "validateSpaPluginExportCompliance";

export async function evaluate(content, rule, context) {
  try {
    const filePath = context.filePath;

    // Check if this is a SPA plugin index file
    if (!filePath.includes("symphony") || !filePath.includes("index.")) {
      return {
        passed: true,
        message: "Not a SPA plugin index file, skipping validation",
      };
    }

    const errors = [];
    const warnings = [];
    const suggestions = [];

    // CRITICAL: Check if this is a .ts file (should not exist in production)
    if (filePath.endsWith(".ts")) {
      errors.push(
        "CRITICAL: TypeScript source file detected - runtime cannot load .ts files"
      );
      suggestions.push(
        "Remove .ts files from plugin directory - only compiled .js files should be present"
      );

      return {
        passed: false,
        confidence: 0.95,
        message:
          "TypeScript source files must be removed - runtime loads .js files only",
        suggestions: suggestions,
        metadata: {
          pluginPath: filePath,
          fileType: "typescript-source",
          runtimeCompatible: false,
          architecturalViolation: "typescript-files-in-runtime-directory",
        },
      };
    }

    // 1. Check for required sequence export
    const sequenceExportValidation = validateSequenceExport(content, filePath);
    if (!sequenceExportValidation.passed) {
      errors.push(sequenceExportValidation.message);
      if (sequenceExportValidation.suggestion) {
        suggestions.push(sequenceExportValidation.suggestion);
      }
    }

    // 2. Check for CIA plugin default export
    const ciaPluginValidation = validateCiaPluginExport(content);
    if (!ciaPluginValidation.passed) {
      errors.push(ciaPluginValidation.message);
      if (ciaPluginValidation.suggestion) {
        suggestions.push(ciaPluginValidation.suggestion);
      }
    }

    // 3. Check handlers export (optional but validate if present)
    const handlersValidation = validateHandlersExport(content);
    if (!handlersValidation.passed) {
      warnings.push(handlersValidation.message);
      if (handlersValidation.suggestion) {
        suggestions.push(handlersValidation.suggestion);
      }
    }

    // 4. Check import resolution patterns
    const importValidation = validateImportResolution(content);
    if (!importValidation.passed) {
      errors.push(importValidation.message);
      if (importValidation.suggestion) {
        suggestions.push(importValidation.suggestion);
      }
    }

    // 5. Check export structure consistency
    const exportStructureValidation = validateExportStructure(content);
    if (!exportStructureValidation.passed) {
      warnings.push(exportStructureValidation.message);
    }

    const result = {
      passed: errors.length === 0,
      confidence: errors.length === 0 ? 0.95 : 0.8,
      message:
        errors.length === 0
          ? "SPA plugin export compliance validation passed"
          : `SPA plugin export compliance failed: ${errors.join("; ")}`,
    };

    if (warnings.length > 0) {
      result.warnings = warnings;
    }

    if (suggestions.length > 0) {
      result.suggestions = suggestions;
    }

    // Add detailed metadata for reporting
    result.metadata = {
      pluginPath: filePath,
      hasSequenceExport: sequenceExportValidation.hasSequenceExport,
      hasCiaPlugin: ciaPluginValidation.hasCiaPlugin,
      hasHandlersExport: handlersValidation.hasHandlersExport,
      importIssues: importValidation.issues || [],
      exportStructure: exportStructureValidation.structure || {},
    };

    return result;
  } catch (error) {
    return {
      passed: false,
      confidence: 0.5,
      message: `SPA plugin export validation error: ${error.message}`,
    };
  }
}

function validateSequenceExport(content, filePath) {
  // Check for sequence export patterns (both ES6 and CommonJS)
  const sequenceExportPatterns = [
    /export\s+\{\s*[^}]*sequence[^}]*\}/,
    /export\s+const\s+sequence\s*=/,
    /export\s+\{\s*\w+\s+as\s+sequence\s*\}/,
    // CommonJS patterns
    /sequence:\s*\(\)\s*=>\s*\w+\.sequence/,
    /__export\([^)]*,\s*\{[^}]*sequence:/,
  ];

  const hasSequenceExport = sequenceExportPatterns.some((pattern) =>
    pattern.test(content)
  );

  if (!hasSequenceExport) {
    // Check if there's a sequence import that could be re-exported
    const hasSequenceImport =
      /import\s+\{[^}]*\w+_SEQUENCE[^}]*\}\s+from\s+['"]\.\/sequence/.test(
        content
      );

    return {
      passed: false,
      hasSequenceExport: false,
      message:
        "CRITICAL: Missing required 'sequence' export - conductor cannot mount plugin",
      suggestion: hasSequenceImport
        ? 'Add: export { SEQUENCE_NAME as sequence } from "./sequence.ts"'
        : "Import sequence from sequence.ts and re-export as 'sequence'",
    };
  }

  return {
    passed: true,
    hasSequenceExport: true,
    message: "Sequence export found",
  };
}

function validateCiaPluginExport(content) {
  // Check for CIA plugin default export (both ES6 and CommonJS)
  const ciaPluginPatterns = [
    /export\s+default\s+\w*Plugin/,
    /export\s+default\s+\{[^}]*mount[^}]*\}/,
    /const\s+\w*Plugin\s*=\s*\{[^}]*mount[^}]*\}/,
    // CommonJS patterns
    /var\s+\w*Plugin\s*=\s*\{[^}]*mount[^}]*\}/,
    /stdin_default\s*=\s*\w*Plugin/,
    /default:\s*\(\)\s*=>\s*\w*Plugin/,
  ];

  const hasCiaPlugin = ciaPluginPatterns.some((pattern) =>
    pattern.test(content)
  );

  if (!hasCiaPlugin) {
    return {
      passed: false,
      hasCiaPlugin: false,
      message: "CRITICAL: Missing CIA-compliant plugin default export",
      suggestion:
        "Ensure plugin object has mount/unmount methods and is exported as default",
    };
  }

  return {
    passed: true,
    hasCiaPlugin: true,
    message: "CIA plugin export found",
  };
}

function validateHandlersExport(content) {
  // Handlers are optional for event-driven plugins
  const hasHandlersExport = /export\s+const\s+handlers\s*=/.test(content);
  const hasHandlersComment =
    /handlers.*removed|handlers.*optional|event-driven/.test(content);

  if (!hasHandlersExport && !hasHandlersComment) {
    return {
      passed: false,
      hasHandlersExport: false,
      message: "WARNING: No handlers export or explanation found",
      suggestion:
        "Add comment explaining handlers are optional for event-driven plugins",
    };
  }

  return {
    passed: true,
    hasHandlersExport: hasHandlersExport,
    message: hasHandlersExport
      ? "Handlers export found"
      : "Event-driven plugin (no handlers needed)",
  };
}

function validateImportResolution(content) {
  const issues = [];

  // Check for problematic import patterns
  const imports = content.match(/import\s+[^;]+;/g) || [];

  for (const importStatement of imports) {
    // Check for .ts extensions in imports (runtime uses .js)
    if (/from\s+['"][^'"]*\.ts['"]/.test(importStatement)) {
      issues.push(
        `CRITICAL: TypeScript extension in import will fail at runtime: ${importStatement.trim()}`
      );
    }

    // Check for missing file extensions
    if (
      /from\s+['"]\.\/\w+['"]/.test(importStatement) &&
      !/\.(ts|js)['"]/.test(importStatement)
    ) {
      issues.push(`Missing file extension in: ${importStatement.trim()}`);
    }

    // Check for potential circular imports
    if (/from\s+['"]\.\/index/.test(importStatement)) {
      issues.push(`Potential circular import: ${importStatement.trim()}`);
    }
  }

  if (issues.length > 0) {
    return {
      passed: false,
      issues: issues,
      message: `Import resolution issues: ${issues.join(", ")}`,
      suggestion:
        "Use .js extensions in imports (runtime loads compiled JavaScript files)",
    };
  }

  return {
    passed: true,
    issues: [],
    message: "Import resolution looks good",
  };
}

function validateExportStructure(content) {
  const exports = content.match(/export\s+[^;]+;?/g) || [];

  const structure = {
    namedExports: exports.filter((exp) => /export\s+\{/.test(exp)).length,
    constExports: exports.filter((exp) => /export\s+const/.test(exp)).length,
    defaultExports: exports.filter((exp) => /export\s+default/.test(exp))
      .length,
    totalExports: exports.length,
  };

  // Basic structure validation
  if (structure.totalExports === 0) {
    return {
      passed: false,
      structure: structure,
      message: "No exports found in plugin",
    };
  }

  if (structure.defaultExports === 0) {
    return {
      passed: false,
      structure: structure,
      message: "Missing default export",
    };
  }

  return {
    passed: true,
    structure: structure,
    message: "Export structure looks good",
  };
}
