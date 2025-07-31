export const operator = "validateSpaLogicContract";

export async function evaluate(content, rule, context) {
  try {
    const filePath = context.filePath;
    
    // Check if this is a logic file
    if (!filePath.includes('/logic/')) {
      return {
        passed: true,
        message: "Not a logic file, skipping validation"
      };
    }

    const errors = [];
    const warnings = [];

    // Validate exports
    if (rule.validateExports) {
      const exportValidation = validateLogicExports(content);
      if (!exportValidation.passed) {
        errors.push(exportValidation.message);
      }
    }

    // Check for pure functions
    if (rule.checkPureFunctions) {
      const purityValidation = validatePureFunctions(content);
      if (purityValidation.warnings) {
        warnings.push(...purityValidation.warnings);
      }
    }

    // Validate testability
    if (rule.validateTestability) {
      const testabilityValidation = validateTestability(content);
      if (testabilityValidation.warnings) {
        warnings.push(...testabilityValidation.warnings);
      }
    }

    const result = {
      passed: errors.length === 0,
      message: errors.length === 0 
        ? "Logic contract validation passed"
        : `Logic contract validation failed: ${errors.join('; ')}`
    };

    if (warnings.length > 0 && rule.verbose) {
      result.warnings = warnings;
    }

    return result;

  } catch (error) {
    return {
      passed: false,
      message: `Logic contract validation error: ${error.message}`
    };
  }
}

function validateLogicExports(content) {
  // Check for function exports
  const exportPatterns = [
    /export\s+function\s+\w+/,
    /export\s+const\s+\w+\s*=/,
    /export\s+default/
  ];

  const hasValidExport = exportPatterns.some(pattern => pattern.test(content));
  
  if (!hasValidExport) {
    return {
      passed: false,
      message: "Logic file must export functions (function, const, or default export)"
    };
  }

  return { passed: true };
}

function validatePureFunctions(content) {
  const warnings = [];
  
  // Check for potential side effects
  const sideEffectPatterns = [
    /console\./,
    /document\./,
    /window\./,
    /localStorage/,
    /sessionStorage/,
    /fetch\(/,
    /axios\./
  ];

  for (const pattern of sideEffectPatterns) {
    if (pattern.test(content)) {
      warnings.push("Potential side effect detected - consider moving to handlers or hooks");
      break;
    }
  }

  return { warnings: warnings.length > 0 ? warnings : undefined };
}

function validateTestability(content) {
  const warnings = [];
  
  // Check for complex dependencies that make testing difficult
  if (content.includes('new Date()')) {
    warnings.push("Direct Date() usage makes testing difficult - consider dependency injection");
  }
  
  if (content.includes('Math.random()')) {
    warnings.push("Math.random() usage makes testing non-deterministic - consider seeded random");
  }

  return { warnings: warnings.length > 0 ? warnings : undefined };
}
