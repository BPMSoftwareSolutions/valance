export const operator = "validateCiaPluginLoaderValidation";

export async function evaluate(content, rule, context) {
  try {
    const filePath = context.filePath;
    
    // Check if this is a plugin loader file
    if (!filePath.includes('pluginLoader')) {
      return {
        passed: true,
        message: "Not a plugin loader file, skipping validation"
      };
    }

    const errors = [];
    const warnings = [];

    // Check dynamic imports
    if (rule.checkDynamicImports) {
      const importValidation = validateDynamicImports(content);
      if (!importValidation.passed) {
        errors.push(importValidation.message);
      }
    }

    // Check error catching
    if (rule.checkErrorCatching) {
      const errorValidation = validateErrorCatching(content);
      if (!errorValidation.passed) {
        errors.push(errorValidation.message);
      }
    }

    // Check missing plugin logging
    if (rule.checkMissingPluginLogging) {
      const loggingValidation = validateMissingPluginLogging(content);
      if (!loggingValidation.passed) {
        warnings.push(loggingValidation.message);
      }
    }

    // Check load failure handling
    if (rule.checkLoadFailureHandling) {
      const failureValidation = validateLoadFailureHandling(content);
      if (!failureValidation.passed) {
        warnings.push(failureValidation.message);
      }
    }

    // Validate import patterns
    if (rule.validateImportPatterns) {
      const patternValidation = validateImportPatterns(content);
      if (patternValidation.warnings) {
        warnings.push(...patternValidation.warnings);
      }
    }

    const result = {
      passed: errors.length === 0,
      message: errors.length === 0 
        ? "Plugin loader validation passed"
        : `Plugin loader validation failed: ${errors.join('; ')}`
    };

    if (warnings.length > 0 && rule.verbose) {
      result.warnings = warnings;
    }

    return result;

  } catch (error) {
    return {
      passed: false,
      message: `Plugin loader validation error: ${error.message}`
    };
  }
}

function validateDynamicImports(content) {
  const dynamicImportPatterns = [
    /import\s*\(/,
    /await\s+import\s*\(/,
    /dynamic\s+import/,
    /require\s*\(/
  ];

  const hasDynamicImports = dynamicImportPatterns.some(pattern => pattern.test(content));
  
  if (!hasDynamicImports) {
    return {
      passed: false,
      message: "No dynamic import patterns found in plugin loader"
    };
  }

  return { passed: true };
}

function validateErrorCatching(content) {
  const errorHandlingPatterns = [
    /try\s*\{[^}]*import/,
    /catch\s*\([^)]*\)\s*\{[^}]*console\.(warn|error)/,
    /catch\s*\([^)]*\)\s*\{[^}]*log/,
    /\.catch\s*\([^)]*\)/
  ];

  const hasErrorHandling = errorHandlingPatterns.some(pattern => pattern.test(content));
  
  if (!hasErrorHandling) {
    return {
      passed: false,
      message: "Missing error handling for dynamic imports"
    };
  }

  return { passed: true };
}

function validateMissingPluginLogging(content) {
  const loggingPatterns = [
    /console\.warn.*[Ff]ailed.*load.*plugin/,
    /console\.error.*[Pp]lugin.*not.*found/,
    /console\.log.*[Mm]issing.*plugin/,
    /Failed to load plugin/,
    /Plugin not found/,
    /Module not found/
  ];

  const hasLogging = loggingPatterns.some(pattern => pattern.test(content));
  
  if (!hasLogging) {
    return {
      passed: false,
      message: "Missing logging for plugin load failures"
    };
  }

  return { passed: true };
}

function validateLoadFailureHandling(content) {
  const gracefulFailurePatterns = [
    /continue/,
    /return\s+null/,
    /return\s+false/,
    /skip/,
    /ignore/
  ];

  const hasGracefulFailure = gracefulFailurePatterns.some(pattern => pattern.test(content));
  
  if (!hasGracefulFailure) {
    return {
      passed: false,
      message: "Missing graceful failure handling for plugin load errors"
    };
  }

  return { passed: true };
}

function validateImportPatterns(content) {
  const warnings = [];

  // Check for validation after import
  const validationAfterImportPatterns = [
    /plugin\.evaluate/,
    /typeof\s+plugin/,
    /plugin\s*&&/,
    /plugin\.operators/
  ];

  const hasPostImportValidation = validationAfterImportPatterns.some(pattern => pattern.test(content));
  
  if (!hasPostImportValidation && content.includes('import(')) {
    warnings.push("Missing plugin validation after successful import");
  }

  // Check for unsafe import patterns
  if (content.includes('import(') && !content.includes('await')) {
    warnings.push("Dynamic imports should use await for proper error handling");
  }

  return {
    warnings: warnings.length > 0 ? warnings : undefined
  };
}
