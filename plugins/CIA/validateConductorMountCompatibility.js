export const operator = "validateConductorMountCompatibility";

export async function evaluate(content, rule, context) {
  try {
    const filePath = context.filePath;

    // Check if this is a conductor file
    if (!filePath.toLowerCase().includes('conductor')) {
      return {
        passed: true,
        message: "Not a conductor file, skipping mount compatibility validation"
      };
    }

    const errors = [];
    const warnings = [];
    const suggestions = [];

    // 1. Check for optional handlers support in mount function
    const optionalHandlersValidation = validateOptionalHandlersSupport(content);
    if (!optionalHandlersValidation.passed) {
      errors.push(optionalHandlersValidation.message);
      if (optionalHandlersValidation.suggestion) {
        suggestions.push(optionalHandlersValidation.suggestion);
      }
    }

    // 2. Check for event-driven architecture support
    const eventDrivenValidation = validateEventDrivenSupport(content);
    if (!eventDrivenValidation.passed) {
      warnings.push(eventDrivenValidation.message);
      if (eventDrivenValidation.suggestion) {
        suggestions.push(eventDrivenValidation.suggestion);
      }
    }

    // 3. Check play method architectural alignment
    const playMethodValidation = validatePlayMethodAlignment(content);
    if (!playMethodValidation.passed) {
      errors.push(playMethodValidation.message);
      if (playMethodValidation.suggestion) {
        suggestions.push(playMethodValidation.suggestion);
      }
    }

    // 4. Check graceful degradation patterns
    const gracefulDegradationValidation = validateGracefulDegradation(content);
    if (!gracefulDegradationValidation.passed) {
      warnings.push(gracefulDegradationValidation.message);
    }

    const result = {
      passed: errors.length === 0,
      confidence: errors.length === 0 ? 0.9 : 0.7,
      message: errors.length === 0
        ? "Conductor mount compatibility validation passed"
        : `Conductor mount compatibility failed: ${errors.join('; ')}`
    };

    if (warnings.length > 0) {
      result.warnings = warnings;
    }

    if (suggestions.length > 0) {
      result.suggestions = suggestions;
    }

    // Add detailed metadata
    result.metadata = {
      conductorPath: filePath,
      hasOptionalHandlers: optionalHandlersValidation.hasOptionalHandlers,
      hasEventDrivenSupport: eventDrivenValidation.hasEventDrivenSupport,
      hasModernPlayMethod: playMethodValidation.hasModernPlayMethod,
      hasGracefulDegradation: gracefulDegradationValidation.hasGracefulDegradation,
      architecturalAlignment: {
        supportsEventDriven: eventDrivenValidation.passed,
        supportsOptionalHandlers: optionalHandlersValidation.passed,
        usesSequenceBasedPlay: playMethodValidation.passed
      }
    };

    return result;

  } catch (error) {
    return {
      passed: false,
      confidence: 0.5,
      message: `Conductor mount compatibility validation error: ${error.message}`
    };
  }
}

function validateOptionalHandlersSupport(content) {
  // Check if mount function makes handlers optional
  const hasMountFunction = /mount\s*\(/.test(content);
  
  if (!hasMountFunction) {
    return {
      passed: false,
      hasOptionalHandlers: false,
      message: "CRITICAL: No mount function found in conductor",
      suggestion: "Implement mount function with optional handlers parameter"
    };
  }

  // Check for optional handlers patterns
  const optionalHandlersPatterns = [
    /handlers\s*\?\s*:/,  // TypeScript optional parameter
    /handlers\s*=\s*\{\}/, // Default parameter
    /if\s*\(\s*handlers\s*&&\s*typeof\s+handlers\s*===\s*['"]object['"]/, // Conditional validation
    /handlers\s*\|\|\s*\{\}/ // Fallback pattern
  ];

  const hasOptionalHandlers = optionalHandlersPatterns.some(pattern => pattern.test(content));

  // Check for strict handlers requirement (anti-pattern)
  const hasStrictHandlersCheck = /if\s*\(\s*!\s*handlers\s*\|\|\s*typeof\s+handlers\s*!==\s*['"]object['"]/.test(content);

  if (hasStrictHandlersCheck && !hasOptionalHandlers) {
    return {
      passed: false,
      hasOptionalHandlers: false,
      message: "CRITICAL: Mount function requires handlers, blocking event-driven plugins",
      suggestion: "Make handlers optional: if (handlers && typeof handlers === 'object')"
    };
  }

  if (!hasOptionalHandlers) {
    return {
      passed: false,
      hasOptionalHandlers: false,
      message: "WARNING: Mount function doesn't explicitly support optional handlers",
      suggestion: "Add conditional handlers validation for event-driven plugin support"
    };
  }

  return {
    passed: true,
    hasOptionalHandlers: true,
    message: "Mount function supports optional handlers"
  };
}

function validateEventDrivenSupport(content) {
  // Check for event-driven architecture mentions or patterns
  const eventDrivenPatterns = [
    /event-driven/i,
    /event\s*bus/i,
    /optional.*handlers/i,
    /handlers.*optional/i,
    /beat.*execution/i,
    /emit.*event/i
  ];

  const hasEventDrivenSupport = eventDrivenPatterns.some(pattern => pattern.test(content));

  if (!hasEventDrivenSupport) {
    return {
      passed: false,
      hasEventDrivenSupport: false,
      message: "WARNING: No evidence of event-driven architecture support",
      suggestion: "Add comments or code indicating support for event-driven plugins"
    };
  }

  return {
    passed: true,
    hasEventDrivenSupport: true,
    message: "Event-driven architecture support detected"
  };
}

function validatePlayMethodAlignment(content) {
  // Check if play method uses modern sequenceId-based approach
  const hasPlayMethod = /play\s*\(/.test(content);
  
  if (!hasPlayMethod) {
    return {
      passed: true, // Not all conductors need play method
      hasModernPlayMethod: false,
      message: "No play method found (optional)"
    };
  }

  // Check for modern sequenceId-based play method
  const modernPlayPatterns = [
    /play\s*\([^)]*sequenceId/,
    /startSequence\s*\(/,
    /executeSequence\s*\(/
  ];

  const hasModernPlayMethod = modernPlayPatterns.some(pattern => pattern.test(content));

  // Check for legacy movementName-based play method (anti-pattern)
  const hasLegacyPlayMethod = /play\s*\([^)]*movementName/.test(content);

  if (hasLegacyPlayMethod && !hasModernPlayMethod) {
    return {
      passed: false,
      hasModernPlayMethod: false,
      message: "CRITICAL: Play method uses legacy movementName instead of sequenceId",
      suggestion: "Update play method to use sequenceId and call startSequence()"
    };
  }

  if (!hasModernPlayMethod) {
    return {
      passed: false,
      hasModernPlayMethod: false,
      message: "WARNING: Play method doesn't use modern sequence-based approach",
      suggestion: "Consider updating play method to use sequenceId parameter"
    };
  }

  return {
    passed: true,
    hasModernPlayMethod: true,
    message: "Play method uses modern sequence-based approach"
  };
}

function validateGracefulDegradation(content) {
  // Check for graceful degradation patterns
  const gracefulPatterns = [
    /continue.*operation/i,
    /graceful.*failure/i,
    /system.*continues/i,
    /without.*handlers/i,
    /fallback/i,
    /default.*behavior/i
  ];

  const hasGracefulDegradation = gracefulPatterns.some(pattern => pattern.test(content));

  return {
    passed: hasGracefulDegradation,
    hasGracefulDegradation: hasGracefulDegradation,
    message: hasGracefulDegradation 
      ? "Graceful degradation patterns detected"
      : "WARNING: No explicit graceful degradation patterns found"
  };
}
