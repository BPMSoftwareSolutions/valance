export const operator = "validateSharedNamingConventions";

export async function evaluate(content, rule, context) {
  try {
    const filePath = context.filePath;
    const fileName = filePath.split('/').pop();
    
    const errors = [];
    const warnings = [];

    // Validate file naming
    if (rule.checkFileNaming) {
      const fileValidation = validateFileNaming(fileName, filePath);
      if (!fileValidation.passed) {
        errors.push(fileValidation.message);
      }
      if (fileValidation.warnings) {
        warnings.push(...fileValidation.warnings);
      }
    }

    // Validate function naming
    if (rule.validateFunctionNaming) {
      const functionValidation = validateFunctionNaming(content);
      if (functionValidation.warnings) {
        warnings.push(...functionValidation.warnings);
      }
    }

    // Validate variable naming
    if (rule.validateVariableNaming) {
      const variableValidation = validateVariableNaming(content);
      if (variableValidation.warnings) {
        warnings.push(...variableValidation.warnings);
      }
    }

    // Validate class naming
    if (rule.validateClassNaming) {
      const classValidation = validateClassNaming(content);
      if (classValidation.warnings) {
        warnings.push(...classValidation.warnings);
      }
    }

    // Validate constant naming
    if (rule.validateConstantNaming) {
      const constantValidation = validateConstantNaming(content);
      if (constantValidation.warnings) {
        warnings.push(...constantValidation.warnings);
      }
    }

    const result = {
      passed: errors.length === 0,
      message: errors.length === 0 
        ? "Naming convention validation passed"
        : `Naming convention validation failed: ${errors.join('; ')}`
    };

    if (warnings.length > 0 && rule.verbose) {
      result.warnings = warnings;
    }

    return result;

  } catch (error) {
    return {
      passed: false,
      message: `Naming convention validation error: ${error.message}`
    };
  }
}

function validateFileNaming(fileName, filePath) {
  const errors = [];
  const warnings = [];

  // Component files should be PascalCase
  if (fileName.endsWith('.tsx') && filePath.includes('/components/')) {
    if (!fileName.match(/^[A-Z][a-zA-Z]*\.tsx$/)) {
      errors.push(`Component file '${fileName}' should be PascalCase.tsx`);
    }
  }

  // Hook files should start with 'use'
  if (fileName.includes('use') && !fileName.startsWith('use')) {
    warnings.push(`Hook file '${fileName}' should start with 'use'`);
  }

  // Utility files should be camelCase
  if (filePath.includes('/utils/') && fileName.endsWith('.ts')) {
    if (!fileName.match(/^[a-z][a-zA-Z]*\.ts$/)) {
      warnings.push(`Utility file '${fileName}' should be camelCase.ts`);
    }
  }

  // Type files should follow pattern
  if (fileName.includes('.types.ts')) {
    const baseName = fileName.replace('.types.ts', '');
    if (!baseName.match(/^[a-z][a-zA-Z]*$/)) {
      warnings.push(`Type file '${fileName}' should be camelCase.types.ts`);
    }
  }

  return {
    passed: errors.length === 0,
    message: errors.length === 0 ? "File naming valid" : errors.join(', '),
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

function validateFunctionNaming(content) {
  const warnings = [];
  
  // Extract function declarations
  const functionMatches = content.match(/(?:function\s+|const\s+|let\s+|var\s+)(\w+)\s*[=\(]/g) || [];
  
  for (const match of functionMatches) {
    const functionName = match.match(/(\w+)/)[1];
    
    // Check camelCase
    if (!functionName.match(/^[a-z][a-zA-Z0-9]*$/)) {
      warnings.push(`Function '${functionName}' should be camelCase`);
    }
    
    // Check handler naming
    if (functionName.includes('handle') && !functionName.startsWith('handle')) {
      warnings.push(`Handler function '${functionName}' should start with 'handle' or 'on'`);
    }
  }

  return { warnings: warnings.length > 0 ? warnings : undefined };
}

function validateVariableNaming(content) {
  const warnings = [];
  
  // Extract variable declarations
  const variableMatches = content.match(/(?:const|let|var)\s+(\w+)/g) || [];
  
  for (const match of variableMatches) {
    const variableName = match.split(/\s+/)[1];
    
    // Check camelCase
    if (!variableName.match(/^[a-z][a-zA-Z0-9]*$/)) {
      warnings.push(`Variable '${variableName}' should be camelCase`);
    }
    
    // Check boolean naming
    if (variableName.match(/^(is|has|can|should)/)) {
      // Good boolean naming
    } else if (content.includes(`${variableName} = true`) || content.includes(`${variableName} = false`)) {
      warnings.push(`Boolean variable '${variableName}' should start with is/has/can/should`);
    }
  }

  return { warnings: warnings.length > 0 ? warnings : undefined };
}

function validateClassNaming(content) {
  const warnings = [];
  
  // Extract class declarations
  const classMatches = content.match(/class\s+(\w+)/g) || [];
  
  for (const match of classMatches) {
    const className = match.split(/\s+/)[1];
    
    // Check PascalCase
    if (!className.match(/^[A-Z][a-zA-Z0-9]*$/)) {
      warnings.push(`Class '${className}' should be PascalCase`);
    }
  }

  // Extract interface declarations
  const interfaceMatches = content.match(/interface\s+(\w+)/g) || [];
  
  for (const match of interfaceMatches) {
    const interfaceName = match.split(/\s+/)[1];
    
    // Check PascalCase
    if (!interfaceName.match(/^[A-Z][a-zA-Z0-9]*$/)) {
      warnings.push(`Interface '${interfaceName}' should be PascalCase`);
    }
  }

  return { warnings: warnings.length > 0 ? warnings : undefined };
}

function validateConstantNaming(content) {
  const warnings = [];
  
  // Extract const declarations that look like constants (all caps)
  const constantMatches = content.match(/const\s+([A-Z_][A-Z0-9_]*)\s*=/g) || [];
  
  for (const match of constantMatches) {
    const constantName = match.match(/const\s+([A-Z_][A-Z0-9_]*)/)[1];
    
    // Check UPPER_SNAKE_CASE
    if (!constantName.match(/^[A-Z][A-Z0-9_]*$/)) {
      warnings.push(`Constant '${constantName}' should be UPPER_SNAKE_CASE`);
    }
  }

  return { warnings: warnings.length > 0 ? warnings : undefined };
}
