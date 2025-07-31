export const operator = "validateCiaMountCallSafety";

export async function evaluate(content, rule, context) {
  try {
    const errors = [];
    const warnings = [];

    // Check mount signature patterns
    if (rule.checkMountSignature) {
      const signatureValidation = validateMountSignature(content);
      if (!signatureValidation.passed) {
        errors.push(signatureValidation.message);
      }
      if (signatureValidation.warnings) {
        warnings.push(...signatureValidation.warnings);
      }
    }

    // Check parameter order
    if (rule.validateParameterOrder) {
      const orderValidation = validateParameterOrder(content);
      if (!orderValidation.passed) {
        errors.push(orderValidation.message);
      }
    }

    // Check parameter validation
    if (rule.checkParameterValidation) {
      const paramValidation = validateParameterValidation(content);
      if (!paramValidation.passed) {
        warnings.push(paramValidation.message);
      }
    }

    // Check consistency
    if (rule.enforceConsistency) {
      const consistencyValidation = validateConsistency(content);
      if (consistencyValidation.warnings) {
        warnings.push(...consistencyValidation.warnings);
      }
    }

    const result = {
      passed: errors.length === 0,
      message: errors.length === 0 
        ? "Mount call safety validation passed"
        : `Mount call safety validation failed: ${errors.join('; ')}`
    };

    if (warnings.length > 0 && rule.verbose) {
      result.warnings = warnings;
    }

    return result;

  } catch (error) {
    return {
      passed: false,
      message: `Mount call safety validation error: ${error.message}`
    };
  }
}

function validateMountSignature(content) {
  const errors = [];
  const warnings = [];

  // Safe mount patterns
  const safeMountPatterns = [
    /conductor\.mount\s*\(\s*sequence\s*,\s*handlers\s*\)/,
    /conductor\.registerSequence\s*\(\s*sequence\s*,\s*handlers\s*\)/,
    /conductor\.loadPlugin\s*\(\s*sequence\s*,\s*handlers\s*\)/,
    /mount\s*\(\s*sequence\s*,\s*handlers\s*\)/,
    /registerSequence\s*\(\s*sequence\s*[,\s]*handlers\s*\)/
  ];

  // Unsafe mount patterns
  const unsafeMountPatterns = [
    /mount\s*\(\s*handlers\s*,\s*sequence\s*\)/,
    /mount\s*\(\s*[^,]*\s*\)(?!.*,)/,
    /registerSequence\s*\(\s*handlers\s*,\s*sequence\s*\)/
  ];

  const hasSafeMounts = safeMountPatterns.some(pattern => pattern.test(content));
  const hasUnsafeMounts = unsafeMountPatterns.some(pattern => pattern.test(content));

  if (hasUnsafeMounts) {
    errors.push("Unsafe mount call patterns detected (wrong parameter order or missing parameters)");
  }

  if (!hasSafeMounts && content.includes('mount') || content.includes('registerSequence')) {
    warnings.push("Mount calls found but don't match safe signature patterns");
  }

  return {
    passed: errors.length === 0,
    message: errors.length === 0 ? "Mount signature valid" : errors.join(', '),
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

function validateParameterOrder(content) {
  // Check for correct parameter order: sequence first, handlers second
  const correctOrderPattern = /\b(mount|registerSequence|loadPlugin)\s*\(\s*sequence\s*,\s*handlers\s*\)/;
  const incorrectOrderPattern = /\b(mount|registerSequence|loadPlugin)\s*\(\s*handlers\s*,\s*sequence\s*\)/;

  if (incorrectOrderPattern.test(content)) {
    return {
      passed: false,
      message: "Incorrect parameter order: should be (sequence, handlers)"
    };
  }

  return { passed: true };
}

function validateParameterValidation(content) {
  const paramValidationPatterns = [
    /sequence\s*&&/,
    /handlers\s*&&/,
    /typeof\s+sequence/,
    /typeof\s+handlers/,
    /if\s*\(\s*sequence\s*\)/,
    /if\s*\(\s*handlers\s*\)/
  ];

  const hasParamValidation = paramValidationPatterns.some(pattern => pattern.test(content));
  
  if (!hasParamValidation && (content.includes('mount') || content.includes('registerSequence'))) {
    return {
      passed: false,
      message: "Missing parameter validation before mount calls"
    };
  }

  return { passed: true };
}

function validateConsistency(content) {
  const warnings = [];

  // Check for consistent naming
  const sequenceNames = content.match(/\b(sequence|pluginSequence|seq)\b/g) || [];
  const handlerNames = content.match(/\b(handlers|pluginHandlers|handlerMap)\b/g) || [];

  const uniqueSequenceNames = [...new Set(sequenceNames)];
  const uniqueHandlerNames = [...new Set(handlerNames)];

  if (uniqueSequenceNames.length > 2) {
    warnings.push(`Inconsistent sequence parameter naming: ${uniqueSequenceNames.join(', ')}`);
  }

  if (uniqueHandlerNames.length > 2) {
    warnings.push(`Inconsistent handlers parameter naming: ${uniqueHandlerNames.join(', ')}`);
  }

  return {
    warnings: warnings.length > 0 ? warnings : undefined
  };
}
