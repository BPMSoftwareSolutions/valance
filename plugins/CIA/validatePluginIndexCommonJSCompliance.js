export const operator = "validatePluginIndexCommonJSCompliance";

export async function evaluate(content, rule, context) {
  try {
    const filePath = context.filePath;

    // Check if this is a plugin index.js file
    if (!filePath.includes('symphony') || !filePath.includes('index.js')) {
      return {
        passed: true,
        message: "Not a plugin index.js file, skipping validation"
      };
    }

    const errors = [];
    const warnings = [];
    const suggestions = [];

    // Check for ES6 export/import statements (forbidden in runtime index.js)
    const es6Patterns = [
      /^\s*export\s+\{/m,
      /^\s*export\s+const/m,
      /^\s*export\s+default/m,
      /^\s*export\s+function/m,
      /^\s*export\s+class/m,
      /^\s*import\s+\{/m,
      /^\s*import\s+\*/m,
      /^\s*import\s+\w+\s+from/m
    ];

    const foundES6Patterns = [];
    for (const pattern of es6Patterns) {
      const match = content.match(pattern);
      if (match) {
        foundES6Patterns.push(match[0].trim());
      }
    }

    if (foundES6Patterns.length > 0) {
      errors.push(
        `CRITICAL: ES6 module syntax detected in runtime index.js: ${foundES6Patterns.join(', ')}`
      );
      suggestions.push(
        "Replace index.js with CommonJS bundled version from dist/plugin.js"
      );
      suggestions.push(
        "Move ES6 source files to separate development directory"
      );
    }

    // Check for required CommonJS patterns
    const commonjsPatterns = {
      moduleExports: /module\.exports\s*=/,
      toCommonJS: /__toCommonJS/,
      exportHelper: /__export/,
      bundledStructure: /var __.*= Object\./
    };

    const missingCommonJSPatterns = [];
    for (const [name, pattern] of Object.entries(commonjsPatterns)) {
      if (!pattern.test(content)) {
        missingCommonJSPatterns.push(name);
      }
    }

    if (missingCommonJSPatterns.length > 0) {
      errors.push(
        `CRITICAL: Missing CommonJS patterns: ${missingCommonJSPatterns.join(', ')}`
      );
      suggestions.push(
        "Ensure index.js is a properly bundled CommonJS module"
      );
    }

    // Determine module format
    let moduleFormat = "unknown";
    if (foundES6Patterns.length > 0) {
      moduleFormat = "ES6";
    } else if (missingCommonJSPatterns.length === 0) {
      moduleFormat = "CommonJS-bundled";
    } else if (commonjsPatterns.moduleExports.test(content)) {
      moduleFormat = "CommonJS-simple";
    }

    // Check for specific MusicalConductor compatibility
    const hasRequiredExports = /CIAPlugin|sequence|default/.test(content);
    if (!hasRequiredExports) {
      warnings.push("Missing expected exports: CIAPlugin, sequence, or default");
    }

    const result = {
      passed: errors.length === 0,
      confidence: errors.length === 0 ? 0.95 : 0.8,
      message: errors.length === 0
        ? `Plugin index.js CommonJS compliance validation passed (${moduleFormat})`
        : `Plugin index.js CommonJS compliance failed: ${errors.join('; ')}`
    };

    if (warnings.length > 0) {
      result.warnings = warnings;
    }

    if (suggestions.length > 0) {
      result.suggestions = suggestions;
    }

    // Add detailed metadata
    result.metadata = {
      filePath: filePath,
      moduleFormat: moduleFormat,
      hasES6Syntax: foundES6Patterns.length > 0,
      hasCommonJSSyntax: missingCommonJSPatterns.length === 0,
      foundES6Patterns: foundES6Patterns,
      missingCommonJSPatterns: missingCommonJSPatterns,
      hasRequiredExports: hasRequiredExports,
      runtimeCompatible: errors.length === 0
    };

    return result;

  } catch (error) {
    return {
      passed: false,
      confidence: 0.5,
      message: `Plugin index.js CommonJS validation error: ${error.message}`
    };
  }
}
