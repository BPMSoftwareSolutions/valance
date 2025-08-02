export const operator = "validateSequenceTriggerMapping";

export async function evaluate(content, rule, context) {
  try {
    const filePath = context.filePath;
    const errors = [];
    const warnings = [];

    // Check if this is a trigger file that should contain conductor.play() calls
    const isTriggerFile = rule.triggerFiles?.some(triggerFile => 
      filePath.includes(triggerFile) || filePath.endsWith(triggerFile)
    );

    if (!isTriggerFile) {
      return {
        passed: true,
        message: "Not a trigger file, skipping sequence trigger mapping validation"
      };
    }

    // Check for conductor.play() calls
    if (rule.checkConductorPlayCalls) {
      const playCallValidation = validateConductorPlayCalls(content, rule);
      if (!playCallValidation.passed) {
        errors.push(playCallValidation.message);
      }
      if (playCallValidation.warnings) {
        warnings.push(...playCallValidation.warnings);
      }
    }

    // Validate trigger file patterns
    if (rule.validateTriggerFiles) {
      const triggerValidation = validateTriggerFilePatterns(content, filePath, rule);
      if (!triggerValidation.passed) {
        errors.push(triggerValidation.message);
      }
    }

    // Cross-reference plugin registrations with triggers
    if (rule.crossReferencePlugins) {
      const crossRefValidation = validatePluginTriggerMapping(content, rule);
      if (!crossRefValidation.passed) {
        warnings.push(crossRefValidation.message);
      }
    }

    if (errors.length > 0) {
      return {
        passed: false,
        message: `Sequence trigger mapping validation failed: ${errors.join('; ')}`
      };
    }

    return {
      passed: true,
      message: "Sequence trigger mapping validation passed",
      warnings: warnings.length > 0 ? warnings : undefined
    };

  } catch (error) {
    return {
      passed: false,
      message: `Sequence trigger mapping validation error: ${error.message}`
    };
  }
}

function validateConductorPlayCalls(content, rule) {
  const playPattern = new RegExp(rule.triggerPatterns?.conductorPlayPattern || 
    "conductor\\.play\\s*\\(\\s*['\"`]([^'\"`,]+)['\"`]\\s*,\\s*['\"`]([^'\"`,]+)['\"`]", 'g');
  
  const playMatches = [...content.matchAll(playPattern)];
  
  if (playMatches.length === 0) {
    return {
      passed: false,
      message: "No conductor.play() calls found in trigger file"
    };
  }

  const warnings = [];
  const sequenceIdPattern = new RegExp(rule.triggerPatterns?.sequenceIdPattern || 
    "[a-zA-Z][a-zA-Z0-9-]*-symphony");

  for (const match of playMatches) {
    const pluginId = match[1];
    const movementName = match[2];

    // Validate plugin ID format
    if (!sequenceIdPattern.test(pluginId)) {
      warnings.push(`Invalid plugin ID format: ${pluginId} (should match *-symphony pattern)`);
    }

    // Validate movement name format
    if (!movementName || movementName.length === 0) {
      warnings.push(`Empty movement name in conductor.play() call for plugin: ${pluginId}`);
    }
  }

  return {
    passed: true,
    message: `Found ${playMatches.length} conductor.play() calls`,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

function validateTriggerFilePatterns(content, filePath, rule) {
  // Check for legacy convenience function patterns that should be replaced
  const legacyPatterns = [
    /startCanvasComponentDragFlow\s*\(/,
    /startCanvasLibraryDropFlow\s*\(/,
    /startCanvasElementSelectionFlow\s*\(/,
    /registerSequence\s*\(/
  ];

  const legacyMatches = legacyPatterns.filter(pattern => pattern.test(content));
  
  if (legacyMatches.length > 0) {
    return {
      passed: false,
      message: `Found legacy convenience function calls that should be replaced with conductor.play() in ${filePath}`
    };
  }

  return {
    passed: true,
    message: "No legacy patterns found, using proper conductor.play() architecture"
  };
}

function validatePluginTriggerMapping(content, rule) {
  // This is a simplified cross-reference check
  // In a full implementation, this would check against a plugin registry
  const playPattern = new RegExp(rule.triggerPatterns?.conductorPlayPattern || 
    "conductor\\.play\\s*\\(\\s*['\"`]([^'\"`,]+)['\"`]", 'g');
  
  const triggeredPlugins = [...content.matchAll(playPattern)].map(match => match[1]);
  
  if (triggeredPlugins.length === 0) {
    return {
      passed: false,
      message: "No plugin triggers found - potential dead code if plugins are registered"
    };
  }

  return {
    passed: true,
    message: `Found triggers for ${triggeredPlugins.length} plugins: ${triggeredPlugins.join(', ')}`
  };
}
