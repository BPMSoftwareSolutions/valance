export const operator = "validateCiaPluginInterfaceRuntime";

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

    // Check for mount function presence
    if (rule.validateMountFunction) {
      const mountValidation = validateMountFunction(content);
      if (!mountValidation.passed) {
        errors.push(mountValidation.message);
      }
      if (mountValidation.warnings) {
        warnings.push(...mountValidation.warnings);
      }
    }

    // Check sequence validation
    if (rule.checkSequenceValidation) {
      const sequenceValidation = validateSequenceChecks(content);
      if (!sequenceValidation.passed) {
        errors.push(sequenceValidation.message);
      }
    }

    // Check handlers validation
    if (rule.checkHandlersValidation) {
      const handlersValidation = validateHandlersChecks(content);
      if (!handlersValidation.passed) {
        errors.push(handlersValidation.message);
      }
    }

    // Check error handling
    if (rule.checkErrorHandling) {
      const errorValidation = validateErrorHandling(content);
      if (!errorValidation.passed) {
        warnings.push(errorValidation.message);
      }
    }

    // Check early return patterns
    if (rule.checkEarlyReturn) {
      const earlyReturnValidation = validateEarlyReturn(content);
      if (!earlyReturnValidation.passed) {
        warnings.push(earlyReturnValidation.message);
      }
    }

    const result = {
      passed: errors.length === 0,
      message: errors.length === 0 
        ? "Plugin interface runtime validation passed"
        : `Plugin interface runtime validation failed: ${errors.join('; ')}`
    };

    if (warnings.length > 0 && rule.verbose) {
      result.warnings = warnings;
    }

    return result;

  } catch (error) {
    return {
      passed: false,
      message: `Plugin interface runtime validation error: ${error.message}`
    };
  }
}

function validateMountFunction(content) {
  const mountPatterns = [
    /mount\s*\(/,
    /registerSequence\s*\(/,
    /loadPlugin\s*\(/
  ];

  const hasMountFunction = mountPatterns.some(pattern => pattern.test(content));
  
  if (!hasMountFunction) {
    return {
      passed: false,
      message: "No mount/register function found in conductor"
    };
  }

  return { passed: true };
}

function validateSequenceChecks(content) {
  const sequenceValidationPatterns = [
    /if\s*\(\s*!\s*sequence\s*\)/,
    /if\s*\(\s*!\s*sequence\.movements\s*\)/,
    /Array\.isArray\s*\(\s*sequence\.movements\s*\)/,
    /sequence\s*&&\s*sequence\.movements/
  ];

  const hasSequenceValidation = sequenceValidationPatterns.some(pattern => pattern.test(content));
  
  if (!hasSequenceValidation) {
    return {
      passed: false,
      message: "Missing sequence validation checks before mounting"
    };
  }

  return { passed: true };
}

function validateHandlersChecks(content) {
  const handlersValidationPatterns = [
    /if\s*\(\s*!\s*handlers\s*\)/,
    /typeof\s+handlers\s*===\s*['"]object['"]/,
    /handlers\s*&&\s*typeof\s+handlers/
  ];

  const hasHandlersValidation = handlersValidationPatterns.some(pattern => pattern.test(content));
  
  if (!hasHandlersValidation) {
    return {
      passed: false,
      message: "Missing handlers validation checks before mounting"
    };
  }

  return { passed: true };
}

function validateErrorHandling(content) {
  const errorHandlingPatterns = [
    /console\.error/,
    /console\.warn/,
    /throw\s+new\s+Error/,
    /catch\s*\([^)]*\)/
  ];

  const hasErrorHandling = errorHandlingPatterns.some(pattern => pattern.test(content));
  
  if (!hasErrorHandling) {
    return {
      passed: false,
      message: "Missing error handling for plugin mounting failures"
    };
  }

  return { passed: true };
}

function validateEarlyReturn(content) {
  const earlyReturnPatterns = [
    /return\s+false/,
    /return\s+null/,
    /return\s*;/
  ];

  const hasEarlyReturn = earlyReturnPatterns.some(pattern => pattern.test(content));
  
  if (!hasEarlyReturn) {
    return {
      passed: false,
      message: "Missing early return patterns for graceful failure"
    };
  }

  return { passed: true };
}
