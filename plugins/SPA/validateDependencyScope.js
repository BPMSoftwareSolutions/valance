export const operator = "validateSpaDependencyScope";

export async function evaluate(content, rule, context) {
  try {
    const filePath = context.filePath;
    
    const errors = [];
    const warnings = [];

    // Extract import statements
    const imports = extractImports(content);
    
    if (imports.length === 0) {
      return {
        passed: true,
        message: "No imports found"
      };
    }

    // Validate each import
    for (const importStatement of imports) {
      const validation = validateImport(importStatement, filePath, rule);
      
      if (!validation.passed) {
        errors.push(validation.message);
      }
      
      if (validation.warnings) {
        warnings.push(...validation.warnings);
      }
    }

    const result = {
      passed: errors.length === 0,
      message: errors.length === 0 
        ? "Dependency scope validation passed"
        : `Dependency scope validation failed: ${errors.join('; ')}`
    };

    if (warnings.length > 0 && rule.verbose) {
      result.warnings = warnings;
    }

    return result;

  } catch (error) {
    return {
      passed: false,
      message: `Dependency scope validation error: ${error.message}`
    };
  }
}

function extractImports(content) {
  const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
  const imports = [];
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    imports.push({
      statement: match[0],
      path: match[1]
    });
  }
  
  return imports;
}

function validateImport(importStatement, filePath, rule) {
  const errors = [];
  const warnings = [];
  const importPath = importStatement.path;

  // Check for external imports
  if (rule.checkExternalImports) {
    const allowedExternal = rule.allowedExternalDeps || [];
    
    // Check if it's a relative import
    if (!importPath.startsWith('./') && !importPath.startsWith('../')) {
      // It's an external import
      const isAllowed = allowedExternal.some(allowed => importPath.startsWith(allowed));
      
      if (!isAllowed) {
        errors.push(`Unauthorized external import: '${importPath}'`);
      }
    }
  }

  // Check relative import depth
  if (rule.validateRelativeImports) {
    const depth = (importPath.match(/\.\.\//g) || []).length;
    const maxDepth = rule.maxRelativeDepth || 2;
    
    if (depth > maxDepth) {
      errors.push(`Relative import too deep (${depth} levels): '${importPath}'`);
    }
  }

  // Check for plugin boundary violations
  if (rule.enforcePluginBoundaries) {
    // Check if importing from outside plugin directory
    if (importPath.includes('../../../')) {
      errors.push(`Plugin boundary violation: '${importPath}' goes too far outside plugin`);
    }
  }

  return {
    passed: errors.length === 0,
    message: errors.length === 0 ? "Import valid" : errors.join(', '),
    warnings: warnings.length > 0 ? warnings : undefined
  };
}
