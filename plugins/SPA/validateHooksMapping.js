import fs from 'fs/promises';
import path from 'path';

export const operator = "validateSpaHooksMapping";

export async function evaluate(content, rule, context) {
  try {
    const filePath = context.filePath;
    const fileName = path.basename(filePath);
    const fileDir = path.dirname(filePath);
    
    // Check if this is a hooks file
    if (!filePath.includes('/hooks/')) {
      return {
        passed: true,
        message: "Not a hooks file, skipping validation"
      };
    }

    const errors = [];
    const warnings = [];

    // Validate file naming convention
    if (rule.validateNaming) {
      const namingValidation = validateHookNaming(fileName, content);
      if (!namingValidation.passed) {
        errors.push(namingValidation.message);
      }
      if (namingValidation.warnings) {
        warnings.push(...namingValidation.warnings);
      }
    }

    // Validate exports
    if (rule.checkExports) {
      const exportValidation = validateHookExports(content, fileName);
      if (!exportValidation.passed) {
        errors.push(exportValidation.message);
      }
    }

    // Validate hook conventions
    if (rule.enforceHookConventions) {
      const conventionValidation = validateHookConventions(content);
      if (!conventionValidation.passed) {
        errors.push(conventionValidation.message);
      }
      if (conventionValidation.warnings) {
        warnings.push(...conventionValidation.warnings);
      }
    }

    // Check usage in handlers (if validateUsage is enabled)
    if (rule.validateUsage) {
      const usageValidation = await validateHookUsage(filePath, fileName, fileDir);
      if (usageValidation.warnings) {
        warnings.push(...usageValidation.warnings);
      }
    }

    const result = {
      passed: errors.length === 0,
      message: errors.length === 0 
        ? `Hook validation passed for '${fileName}'`
        : `Hook validation failed: ${errors.join('; ')}`
    };

    if (warnings.length > 0 && rule.verbose) {
      result.warnings = warnings;
    }

    return result;

  } catch (error) {
    return {
      passed: false,
      message: `Hook validation error: ${error.message}`
    };
  }
}

function validateHookNaming(fileName, content) {
  const errors = [];
  const warnings = [];

  // Check file name starts with 'use'
  const baseName = path.basename(fileName, path.extname(fileName));
  if (!baseName.match(/^use[A-Z][a-zA-Z]*$/)) {
    errors.push(`Hook file name '${fileName}' must start with 'use' followed by PascalCase`);
  }

  // Check if the main export matches the file name
  const exportMatch = content.match(/export\s+(?:const|function)\s+(\w+)/);
  if (exportMatch) {
    const exportName = exportMatch[1];
    if (exportName !== baseName) {
      warnings.push(`Export name '${exportName}' doesn't match file name '${baseName}'`);
    }
  }

  return {
    passed: errors.length === 0,
    message: errors.length === 0 ? "Hook naming valid" : errors.join(', '),
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

function validateHookExports(content, fileName) {
  const errors = [];

  // Check for function export
  const hasExport = /export\s+(?:const|function|default)/.test(content);
  if (!hasExport) {
    errors.push(`Hook file '${fileName}' must export a function`);
  }

  // Check for hook function pattern
  const baseName = path.basename(fileName, path.extname(fileName));
  const hasNamedExport = new RegExp(`export\\s+(?:const|function)\\s+${baseName}`).test(content);
  const hasDefaultExport = /export\s+default/.test(content);
  
  if (!hasNamedExport && !hasDefaultExport) {
    errors.push(`Hook file must export a function named '${baseName}' or use default export`);
  }

  return {
    passed: errors.length === 0,
    message: errors.length === 0 ? "Hook exports valid" : errors.join(', ')
  };
}

function validateHookConventions(content) {
  const errors = [];
  const warnings = [];

  // Check for React hook usage patterns
  const reactHookPatterns = [
    'useState',
    'useEffect',
    'useCallback',
    'useMemo',
    'useRef',
    'useContext'
  ];

  const hasReactHooks = reactHookPatterns.some(pattern => content.includes(pattern));
  if (!hasReactHooks) {
    warnings.push("Hook doesn't appear to use standard React hooks - ensure this is intentional");
  }

  // Check for proper hook rules (hooks should be called at top level)
  const conditionalHookPattern = /if\s*\([^)]*\)\s*{[^}]*use[A-Z]/;
  if (conditionalHookPattern.test(content)) {
    errors.push("Hooks should not be called conditionally - violates Rules of Hooks");
  }

  return {
    passed: errors.length === 0,
    message: errors.length === 0 ? "Hook conventions valid" : errors.join(', '),
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

async function validateHookUsage(hookFilePath, hookFileName, hooksDir) {
  const warnings = [];
  
  try {
    // Look for handler files that might use this hook
    const pluginDir = path.dirname(hooksDir);
    const handlersDir = path.join(pluginDir, 'handlers');
    
    try {
      const handlerFiles = await fs.readdir(handlersDir);
      const hookName = path.basename(hookFileName, path.extname(hookFileName));
      
      let isUsed = false;
      for (const handlerFile of handlerFiles) {
        if (handlerFile.endsWith('.ts') || handlerFile.endsWith('.js')) {
          const handlerPath = path.join(handlersDir, handlerFile);
          const handlerContent = await fs.readFile(handlerPath, 'utf-8');
          
          if (handlerContent.includes(hookName)) {
            isUsed = true;
            break;
          }
        }
      }
      
      if (!isUsed) {
        warnings.push(`Hook '${hookName}' is defined but not used in any handlers`);
      }
      
    } catch {
      // Handlers directory doesn't exist or can't be read
    }
    
  } catch (error) {
    // Ignore usage validation errors
  }

  return {
    warnings: warnings.length > 0 ? warnings : undefined
  };
}
