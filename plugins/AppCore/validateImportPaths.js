export const operator = "validateAppCoreImportPaths";

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
      const validation = validateImportPath(importStatement, filePath, rule);
      
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
        ? "Import path validation passed"
        : `Import path validation failed: ${errors.join('; ')}`
    };

    if (warnings.length > 0 && rule.verbose) {
      result.warnings = warnings;
    }

    return result;

  } catch (error) {
    return {
      passed: false,
      message: `Import path validation error: ${error.message}`
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

function validateImportPath(importStatement, filePath, rule) {
  const errors = [];
  const warnings = [];
  const importPath = importStatement.path;

  // Check alias usage
  if (rule.checkAliasUsage) {
    const allowedAliases = [
      '@/components',
      '@/services', 
      '@/utils',
      '@/types',
      '@/hooks',
      '@/registry'
    ];
    
    // Check if should use alias instead of relative path
    if (importPath.startsWith('../../../')) {
      warnings.push(`Consider using path alias instead of deep relative path: '${importPath}'`);
    }
    
    // Check if using non-standard alias
    if (importPath.startsWith('@/') && !allowedAliases.some(alias => importPath.startsWith(alias))) {
      warnings.push(`Non-standard path alias used: '${importPath}'`);
    }
  }

  // Validate relative paths
  if (rule.validateRelativePaths) {
    const depth = (importPath.match(/\.\.\//g) || []).length;
    const maxDepth = rule.maxRelativeDepth || 3;
    
    if (depth > maxDepth) {
      errors.push(`Relative import too deep (${depth} levels): '${importPath}' - consider using path alias`);
    }
  }

  // Check for forbidden patterns
  if (rule.enforcePathConventions) {
    const forbiddenPatterns = [
      /^src\//,
      /^app\//,
      /^\.\.\//
    ];
    
    for (const pattern of forbiddenPatterns) {
      if (pattern.test(importPath)) {
        if (importPath.match(/^\.\.\//g)?.length > 2) {
          errors.push(`Forbidden import pattern: '${importPath}' - use path aliases for deep imports`);
        }
      }
    }
  }

  // Detect potential circular dependencies
  if (rule.detectCircularDependencies) {
    // Simple heuristic: check if importing from same directory level
    const currentDir = filePath.split('/').slice(0, -1).join('/');
    const importDir = importPath.startsWith('./') ? currentDir : null;
    
    if (importDir && importPath.includes('../') && importPath.includes('./')) {
      warnings.push(`Potential circular dependency pattern: '${importPath}'`);
    }
  }

  return {
    passed: errors.length === 0,
    message: errors.length === 0 ? "Import path valid" : errors.join(', '),
    warnings: warnings.length > 0 ? warnings : undefined
  };
}
