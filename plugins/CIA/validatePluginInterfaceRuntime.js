export const operator = "validateCiaPluginInterfaceRuntime";

export async function evaluate(content, rule, context) {
  try {
    const filePath = context.filePath;

    // Check if this is a conductor file
    if (!filePath.toLowerCase().includes('conductor')) {
      return {
        passed: true,
        message: "Not a conductor file, skipping CIA validation"
      };
    }

    const errors = [];
    const warnings = [];

    // STRICT CIA VALIDATION: Fail by default, pass only if CIA-compliant

    // 1. Check for CIA-compliant mount function (NOT registerSequence)
    const mountValidation = validateCiaMountFunction(content);
    if (!mountValidation.passed) {
      errors.push(mountValidation.message);
    }

    // 2. If mount function exists, validate it has proper checks
    if (mountValidation.hasMountFunction) {
      // Check sequence validation within mount function
      const sequenceValidation = validateSequenceValidationInMount(content);
      if (!sequenceValidation.passed) {
        errors.push(sequenceValidation.message);
      }

      // Check handlers validation within mount function
      const handlersValidation = validateHandlersValidationInMount(content);
      if (!handlersValidation.passed) {
        errors.push(handlersValidation.message);
      }

      // Check error handling in mount function
      const errorValidation = validateMountErrorHandling(content);
      if (!errorValidation.passed) {
        errors.push(errorValidation.message);
      }
    }

    const result = {
      passed: errors.length === 0,
      message: errors.length === 0
        ? "CIA plugin interface validation passed - conductor is CIA-compliant"
        : `CIA validation failed: ${errors.join('; ')}`
    };

    if (warnings.length > 0) {
      result.warnings = warnings;
    }

    return result;

  } catch (error) {
    return {
      passed: false,
      message: `CIA validation error: ${error.message}`
    };
  }
}

function validateCiaMountFunction(content) {
  // Look for CIA-compliant mount functions
  const hasMountFunction = /mount\s*\(/.test(content);
  const hasLoadPluginFunction = /loadPlugin\s*\(/.test(content);
  const hasRegisterSequence = /registerSequence\s*\(/.test(content);

  // STRICT: Must have mount() or loadPlugin(), registerSequence() alone is NOT CIA-compliant
  if (!hasMountFunction && !hasLoadPluginFunction) {
    if (hasRegisterSequence) {
      return {
        passed: false,
        hasMountFunction: false,
        message: "FAIL: Found registerSequence() but no CIA-compliant mount() function. registerSequence() does not validate plugin shape before mounting."
      };
    } else {
      return {
        passed: false,
        hasMountFunction: false,
        message: "FAIL: No CIA-compliant mount() or loadPlugin() function found. Conductor cannot safely mount SPA plugins."
      };
    }
  }

  return {
    passed: true,
    hasMountFunction: true,
    message: "CIA-compliant mount function found"
  };
}

function validateSequenceValidationInMount(content) {
  // STRICT: Mount function must validate sequence structure
  const sequenceValidationPatterns = [
    /if\s*\(\s*!\s*sequence\s*\)/,
    /if\s*\(\s*!\s*sequence\.movements\s*\)/,
    /Array\.isArray\s*\(\s*sequence\.movements\s*\)/
  ];

  const hasSequenceValidation = sequenceValidationPatterns.some(pattern => pattern.test(content));

  if (!hasSequenceValidation) {
    return {
      passed: false,
      message: "FAIL: Mount function missing sequence validation. Must check if sequence exists and has movements array."
    };
  }

  return { passed: true };
}

function validateHandlersValidationInMount(content) {
  // STRICT: Mount function must validate handlers object
  const handlersValidationPatterns = [
    /if\s*\(\s*!\s*handlers\s*\)/,
    /typeof\s+handlers\s*===\s*['"]object['"]/,
    /handlers\s*&&\s*typeof\s+handlers/
  ];

  const hasHandlersValidation = handlersValidationPatterns.some(pattern => pattern.test(content));

  if (!hasHandlersValidation) {
    return {
      passed: false,
      message: "FAIL: Mount function missing handlers validation. Must check if handlers is an object."
    };
  }

  return { passed: true };
}

function validateMountErrorHandling(content) {
  // STRICT: Mount function must have error handling
  const errorHandlingPatterns = [
    /return\s+false/,
    /return\s+null/,
    /return\s*\{[^}]*success\s*:\s*false/,
    /console\.(error|warn)/
  ];

  const hasErrorHandling = errorHandlingPatterns.some(pattern => pattern.test(content));

  if (!hasErrorHandling) {
    return {
      passed: false,
      message: "FAIL: Mount function missing error handling. Must return false or log errors on validation failure."
    };
  }

  return { passed: true };
}

// Old validation functions removed - using strict CIA validation above
