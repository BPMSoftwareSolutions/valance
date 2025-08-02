export const operator = "validatePluginIndexCommonJSCompliance";

export async function evaluate(content, rule, context) {
  try {
    const filePath = context.filePath;
    const errors = [];
    const warnings = [];

    // Check if this is a plugin index.js file
    if (!filePath.endsWith('/index.js')) {
      return {
        passed: true,
        message: "Not a plugin index.js file, skipping CommonJS compliance validation"
      };
    }

    // Check for CommonJS module.exports patterns
    if (rule.checkModuleExports) {
      const exportsValidation = validateModuleExports(content, rule);
      if (!exportsValidation.passed) {
        errors.push(exportsValidation.message);
      }
      if (exportsValidation.warnings) {
        warnings.push(...exportsValidation.warnings);
      }
    }

    // Validate require statements
    if (rule.validateRequireStatements) {
      const requireValidation = validateRequireStatements(content, rule);
      if (!requireValidation.passed) {
        errors.push(requireValidation.message);
      }
    }

    // Detect forbidden ES6 syntax
    if (rule.detectES6Syntax) {
      const es6Validation = detectES6Syntax(content, rule);
      if (!es6Validation.passed) {
        errors.push(es6Validation.message);
      }
    }

    // Check required plugin exports
    if (rule.checkPluginExports) {
      const pluginExportsValidation = validatePluginExports(content, rule);
      if (!pluginExportsValidation.passed) {
        errors.push(pluginExportsValidation.message);
      }
      if (pluginExportsValidation.warnings) {
        warnings.push(...pluginExportsValidation.warnings);
      }
    }

    if (errors.length > 0) {
      return {
        passed: false,
        message: `CommonJS compliance validation failed: ${errors.join('; ')}`
      };
    }

    return {
      passed: true,
      message: "CommonJS compliance validation passed - plugin uses proper CommonJS format",
      warnings: warnings.length > 0 ? warnings : undefined
    };

  } catch (error) {
    return {
      passed: false,
      message: `CommonJS compliance validation error: ${error.message}`
    };
  }
}

function validateModuleExports(content, rule) {
  const validExportPatterns = rule.commonJSPatterns?.validExports || [
    "module\\.exports\\s*=",
    "module\\.exports\\.[a-zA-Z_$][a-zA-Z0-9_$]*\\s*=",
    "exports\\.[a-zA-Z_$][a-zA-Z0-9_$]*\\s*="
  ];

  const warnings = [];
  let hasValidExports = false;

  for (const pattern of validExportPatterns) {
    const regex = new RegExp(pattern, 'g');
    const matches = content.match(regex);
    if (matches && matches.length > 0) {
      hasValidExports = true;
      warnings.push(`Found ${matches.length} valid CommonJS export(s): ${pattern}`);
    }
  }

  if (!hasValidExports) {
    return {
      passed: false,
      message: "No valid CommonJS module.exports patterns found"
    };
  }

  return {
    passed: true,
    message: "Valid CommonJS exports found",
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

function validateRequireStatements(content, rule) {
  const validRequirePatterns = rule.commonJSPatterns?.validRequires || [
    "require\\s*\\(\\s*['\"`][^'\"`,]+['\"`]\\s*\\)",
    "const\\s+[a-zA-Z_$][a-zA-Z0-9_$]*\\s*=\\s*require\\s*\\("
  ];

  const warnings = [];
  let hasRequires = false;

  for (const pattern of validRequirePatterns) {
    const regex = new RegExp(pattern, 'g');
    const matches = content.match(regex);
    if (matches && matches.length > 0) {
      hasRequires = true;
      warnings.push(`Found ${matches.length} require statement(s)`);
    }
  }

  // Require statements are optional, so this is just informational
  return {
    passed: true,
    message: hasRequires ? "Valid require statements found" : "No require statements (optional)",
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

function detectES6Syntax(content, rule) {
  const forbiddenES6Patterns = rule.commonJSPatterns?.forbiddenES6 || [
    "import\\s+",
    "export\\s+",
    "export\\s*{",
    "export\\s*default",
    "import\\s*{",
    "import\\s*\\*\\s*as"
  ];

  const errors = [];

  for (const pattern of forbiddenES6Patterns) {
    const regex = new RegExp(pattern, 'g');
    const matches = content.match(regex);
    if (matches && matches.length > 0) {
      errors.push(`Found forbidden ES6 syntax: ${pattern} (${matches.length} occurrence(s))`);
    }
  }

  if (errors.length > 0) {
    return {
      passed: false,
      message: `ES6 syntax detected - use CommonJS format instead: ${errors.join('; ')}`
    };
  }

  return {
    passed: true,
    message: "No forbidden ES6 syntax found"
  };
}

function validatePluginExports(content, rule) {
  const requiredExports = rule.requiredExports || ['sequence', 'handlers'];
  const optionalExports = rule.optionalExports || ['metadata', 'mount', 'unmount'];
  
  const errors = [];
  const warnings = [];

  // Check for required exports
  for (const requiredExport of requiredExports) {
    const exportPatterns = [
      new RegExp(`module\\.exports\\.${requiredExport}\\s*=`, 'g'),
      new RegExp(`exports\\.${requiredExport}\\s*=`, 'g'),
      new RegExp(`module\\.exports\\s*=\\s*{[^}]*${requiredExport}[^}]*}`, 'g'),
      new RegExp(`${requiredExport}\\s*:`, 'g') // Object property syntax
    ];

    let found = false;
    for (const pattern of exportPatterns) {
      if (pattern.test(content)) {
        found = true;
        break;
      }
    }

    if (!found) {
      errors.push(`Missing required export: ${requiredExport}`);
    } else {
      warnings.push(`Found required export: ${requiredExport}`);
    }
  }

  // Check for optional exports
  for (const optionalExport of optionalExports) {
    const exportPatterns = [
      new RegExp(`module\\.exports\\.${optionalExport}\\s*=`, 'g'),
      new RegExp(`exports\\.${optionalExport}\\s*=`, 'g'),
      new RegExp(`${optionalExport}\\s*:`, 'g')
    ];

    for (const pattern of exportPatterns) {
      if (pattern.test(content)) {
        warnings.push(`Found optional export: ${optionalExport}`);
        break;
      }
    }
  }

  return {
    passed: errors.length === 0,
    message: errors.length > 0 ? errors.join('; ') : "All required plugin exports found",
    warnings: warnings.length > 0 ? warnings : undefined
  };
}
