/**
 * Import Path Validation Plugin
 * Migrated from C# ImportPathValidator.cs
 * Validates import statements against expected patterns and forbidden imports
 */

export const operator = "validateImports";

export async function evaluate(content, rule, context) {
  const violations = [];
  const fileName = context.filePath.split('/').pop();
  const lines = content.split('\n');

  // Handle forbidden imports (simple case)
  if (rule.forbiddenImports) {
    const forbiddenViolations = validateForbiddenImports(content, rule.forbiddenImports, context.filePath);
    violations.push(...forbiddenViolations);
  }

  // Handle import path rules (complex case from C# validator)
  if (rule.importRules) {
    const pathViolations = validateImportPaths(content, rule.importRules, fileName, context.filePath);
    violations.push(...pathViolations);
  }

  if (violations.length > 0) {
    return {
      passed: false,
      message: `Found ${violations.length} import violation(s):\n${violations.map(v => `  Line ${v.lineNumber}: ${v.message}`).join('\n')}`
    };
  }

  return { passed: true };
}

/**
 * Validate forbidden imports (simple substring/prefix matching)
 */
function validateForbiddenImports(content, forbiddenImports, filePath) {
  const violations = [];
  const lines = content.split('\n');
  
  // Regex to match import statements
  const importRegex = /import[\s\S]*?from\s+['"]([^'"]+)['"]/g;
  
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    const lineNumber = getLineNumber(content, match.index);
    
    // Check against forbidden imports
    for (const forbidden of forbiddenImports) {
      if (importPath.includes(forbidden)) {
        violations.push({
          lineNumber,
          message: `Forbidden import detected: '${importPath}' contains '${forbidden}'`,
          actualImport: importPath,
          forbiddenPattern: forbidden
        });
      }
    }
  }
  
  return violations;
}

/**
 * Validate import paths against specific rules (migrated from C# logic)
 */
function validateImportPaths(content, importRules, fileName, filePath) {
  const violations = [];
  
  for (const [ruleName, rule] of Object.entries(importRules)) {
    // Check if rule applies to this file
    const filePattern = new RegExp(rule.filePattern);
    if (!filePattern.test(fileName)) {
      continue;
    }

    // Find import statements matching this rule
    const importPattern = new RegExp(rule.importPattern, 'gm');
    let match;
    
    while ((match = importPattern.exec(content)) !== null) {
      const actualImport = match[1];
      const lineNumber = getLineNumber(content, match.index);
      
      if (!isValidImportPath(actualImport, rule, fileName)) {
        const autoFixSuggestion = generateAutoFixSuggestion(rule, fileName, actualImport);
        
        violations.push({
          lineNumber,
          message: `${rule.description}: Expected '${rule.expectedPattern}', got '${actualImport}'. Suggested fix: '${autoFixSuggestion}'`,
          actualImport,
          expectedPattern: rule.expectedPattern,
          autoFixSuggestion,
          ruleName
        });
      }
    }
  }
  
  return violations;
}

/**
 * Check if import path is valid according to rule
 */
function isValidImportPath(actualImport, rule, fileName) {
  // For internal symphony imports, check if it's a relative path
  if (rule.filePattern.includes('index|hooks|handlers|registry|business-logic') &&
      actualImport.startsWith('./')) {
    return true; // Internal imports are valid if they start with ./
  }

  // For external imports, resolve template placeholders and then compare
  const resolvedExpectedPattern = resolveTemplatePattern(rule.expectedPattern, actualImport);
  return actualImport === resolvedExpectedPattern;
}

/**
 * Resolve template patterns like {component} in expected patterns
 */
function resolveTemplatePattern(templatePattern, actualImport) {
  // Handle CSS generation imports: ../../../../../components/elements/ComponentName/ComponentName.utils.ts
  const cssComponentMatch = actualImport.match(/components\/elements\/([^/]+)\/\1\.utils\.js$/);
  if (cssComponentMatch) {
    const componentName = cssComponentMatch[1];
    return templatePattern.replace('{component}', componentName);
  }

  // Handle event types imports: ../../../../event-types/core/componentname.event-types.ts
  const eventTypesMatch = actualImport.match(/event-types\/core\/([^/]+)\.event-types\.js$/);
  if (eventTypesMatch) {
    const componentName = eventTypesMatch[1];
    return templatePattern.replace('{component}', componentName);
  }

  // If we can't extract component name, return template as-is for comparison
  return templatePattern;
}

/**
 * Generate auto-fix suggestion
 */
function generateAutoFixSuggestion(rule, fileName, actualImport) {
  let template = rule.autoFixPattern || rule.expectedPattern;
  
  // Replace placeholders
  if (template.includes('{component}')) {
    const componentName = extractComponentName(fileName, actualImport);
    template = template.replace('{component}', componentName);
  }
  
  if (template.includes('{filename}')) {
    const targetFileName = extractTargetFileName(actualImport);
    template = template.replace('{filename}', targetFileName);
  }
  
  return template;
}

/**
 * Extract component name from context
 */
function extractComponentName(fileName, actualImport) {
  // Try to extract from actual import first
  const cssMatch = actualImport.match(/components\/elements\/([^/]+)\//);
  if (cssMatch) return cssMatch[1];
  
  const eventMatch = actualImport.match(/event-types\/core\/([^/]+)\./);
  if (eventMatch) return eventMatch[1];
  
  // Fallback to file name analysis
  if (fileName.toLowerCase().includes('canvas')) return 'canvas';
  if (fileName.toLowerCase().includes('button')) return 'button';
  if (fileName.toLowerCase().includes('container')) return 'container';
  
  return 'component'; // Default fallback
}

/**
 * Extract target file name from import path
 */
function extractTargetFileName(importPath) {
  const parts = importPath.split('/');
  const fileName = parts[parts.length - 1];
  return fileName.replace(/\.(js|ts)$/, '');
}

/**
 * Get line number from character index
 */
function getLineNumber(content, characterIndex) {
  return content.substring(0, characterIndex).split('\n').length;
}
