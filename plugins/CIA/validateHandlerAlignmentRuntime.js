export const operator = "validateCiaHandlerAlignmentRuntime";

export async function evaluate(content, rule, context) {
  try {
    const filePath = context.filePath;
    
    // Check if this is a conductor file
    if (!filePath.includes('conductor')) {
      return {
        passed: true,
        message: "Not a conductor file, skipping validation"
      };
    }

    const errors = [];
    const warnings = [];

    // Check movement-handler mapping validation
    if (rule.checkMovementHandlerMapping) {
      const mappingValidation = validateMovementHandlerMapping(content);
      if (!mappingValidation.passed) {
        errors.push(mappingValidation.message);
      }
    }

    // Check missing handler warnings
    if (rule.checkMissingHandlerWarnings) {
      const warningValidation = validateMissingHandlerWarnings(content);
      if (!warningValidation.passed) {
        warnings.push(warningValidation.message);
      }
    }

    // Check graceful failure patterns
    if (rule.checkGracefulFailure) {
      const gracefulValidation = validateGracefulFailure(content);
      if (!gracefulValidation.passed) {
        warnings.push(gracefulValidation.message);
      }
    }

    // Check execution safety
    if (rule.validateExecutionSafety) {
      const safetyValidation = validateExecutionSafety(content);
      if (!safetyValidation.passed) {
        errors.push(safetyValidation.message);
      }
    }

    const result = {
      passed: errors.length === 0,
      message: errors.length === 0 
        ? "Handler alignment runtime validation passed"
        : `Handler alignment runtime validation failed: ${errors.join('; ')}`
    };

    if (warnings.length > 0 && rule.verbose) {
      result.warnings = warnings;
    }

    return result;

  } catch (error) {
    return {
      passed: false,
      message: `Handler alignment runtime validation error: ${error.message}`
    };
  }
}

function validateMovementHandlerMapping(content) {
  const mappingPatterns = [
    /movement\.label\s+in\s+handlers/,
    /handlers\[\s*movement\.label\s*\]/,
    /handlers\.hasOwnProperty\s*\(\s*movement\.label\s*\)/,
    /Object\.keys\s*\(\s*handlers\s*\)/
  ];

  const hasMappingValidation = mappingPatterns.some(pattern => pattern.test(content));
  
  if (!hasMappingValidation) {
    return {
      passed: false,
      message: "Missing movement-to-handler mapping validation"
    };
  }

  return { passed: true };
}

function validateMissingHandlerWarnings(content) {
  const warningPatterns = [
    /console\.warn.*missing.*handler/i,
    /console\.warn.*movement.*not.*found/i,
    /console\.error.*handler.*undefined/i,
    /Missing handler for movement/i
  ];

  const hasWarnings = warningPatterns.some(pattern => pattern.test(content));
  
  if (!hasWarnings) {
    return {
      passed: false,
      message: "Missing warnings for undefined handlers"
    };
  }

  return { passed: true };
}

function validateGracefulFailure(content) {
  const gracefulPatterns = [
    /continue/,
    /return\s+false/,
    /return\s+null/,
    /skip/,
    /ignore/
  ];

  const hasGracefulFailure = gracefulPatterns.some(pattern => pattern.test(content));
  
  if (!hasGracefulFailure) {
    return {
      passed: false,
      message: "Missing graceful failure patterns for missing handlers"
    };
  }

  return { passed: true };
}

function validateExecutionSafety(content) {
  const safetyPatterns = [
    /if\s*\(\s*handlers\[.*\]\s*\)/,
    /handlers\[.*\]\s*&&/,
    /try\s*\{[^}]*handlers\[.*\]/,
    /typeof\s+handlers\[.*\]\s*===\s*['"]function['"]/
  ];

  const hasSafetyChecks = safetyPatterns.some(pattern => pattern.test(content));
  
  if (!hasSafetyChecks) {
    return {
      passed: false,
      message: "Missing safety checks before handler execution"
    };
  }

  return { passed: true };
}
