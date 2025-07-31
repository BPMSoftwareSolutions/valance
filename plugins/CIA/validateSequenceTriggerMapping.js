export const operator = "validateSequenceTriggerMapping";

export async function evaluate(content, rule, context) {
  try {
    const filePath = context.filePath;
    const errors = [];
    const warnings = [];
    const violations = [];

    // Check if this is a trigger file (App.tsx, Canvas.tsx, etc.)
    // Look for patterns in both rule and context
    const triggerPatterns = rule.triggerFilePatterns || context.triggerFilePatterns || [
      ".*App\\.(tsx|ts|js|jsx)$",
      ".*Canvas\\.(tsx|ts|js|jsx)$",
      ".*index\\.(tsx|ts|js|jsx)$",
      ".*hooks\\.(tsx|ts|js|jsx)$"
    ];

    const isTriggerFile = triggerPatterns.some(pattern =>
      new RegExp(pattern, 'i').test(filePath)
    );

    // Check if this is a plugin/sequence file
    const isPluginFile = filePath.includes('symphony') ||
                        filePath.includes('sequence') ||
                        filePath.includes('plugin');

    // Debug output (only for verbose mode)
    if (rule.verbose && (isTriggerFile || isPluginFile)) {
      console.log(`🔍 Checking file: ${filePath} (trigger: ${isTriggerFile}, plugin: ${isPluginFile})`);
    }

    if (!isTriggerFile && !isPluginFile) {
      return {
        passed: true,
        message: "Not a trigger or plugin file, skipping sequence trigger mapping validation"
      };
    }

    // VALIDATION 1: Check for sequence trigger calls in trigger files
    if (isTriggerFile) {
      const triggerValidation = validateSequenceTriggers(content, rule, filePath);
      if (!triggerValidation.passed) {
        errors.push(...triggerValidation.errors);
        violations.push(...triggerValidation.violations);
      }
      if (triggerValidation.warnings?.length > 0) {
        warnings.push(...triggerValidation.warnings);
      }
    }

    // VALIDATION 2: Check for plugin registration and trigger mapping
    if (isPluginFile) {
      const mappingValidation = validatePluginTriggerMapping(content, rule, filePath);
      if (!mappingValidation.passed) {
        errors.push(...mappingValidation.errors);
        violations.push(...mappingValidation.violations);
      }
      if (mappingValidation.warnings?.length > 0) {
        warnings.push(...mappingValidation.warnings);
      }
    }

    // VALIDATION 3: Cross-reference validation (if both plugin and trigger patterns found)
    const crossRefValidation = validateCrossReference(content, rule, filePath);
    if (!crossRefValidation.passed) {
      warnings.push(...crossRefValidation.warnings);
    }

    const result = {
      passed: errors.length === 0,
      message: errors.length === 0
        ? "CIA sequence trigger mapping validation passed"
        : `CIA sequence trigger mapping validation failed: ${errors.join('; ')}`,
      violations: violations.length > 0 ? violations : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      metadata: {
        isTriggerFile,
        isPluginFile,
        filePath,
        triggersFound: violations.filter(v => v.type === 'trigger-found').length,
        pluginsFound: violations.filter(v => v.type === 'plugin-found').length
      }
    };

    if (rule.verbose) {
      console.log(`🧠 CIA Sequence Trigger Mapping: ${filePath} - ${result.passed ? 'PASSED' : 'FAILED'}`);
      if (violations.length > 0) {
        console.log(`   Found ${violations.length} trigger/plugin mappings:`);
        violations.forEach(v => console.log(`     - ${v.message}`));
      }
      if (errors.length > 0) {
        console.log(`   Errors: ${errors.length}`);
        errors.forEach(e => console.log(`     - ${e.message || e}`));
      }
    }

    return result;

  } catch (error) {
    return {
      passed: false,
      message: `CIA sequence trigger mapping validation error: ${error.message}`,
      error: error.message
    };
  }
}

/**
 * Validate sequence trigger calls in trigger files
 */
function validateSequenceTriggers(content, rule, filePath) {
  const errors = [];
  const warnings = [];
  const violations = [];

  // Check for conductor.play calls (preferred CIA pattern)
  const playPattern = /conductor\.play\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*['"`]([^'"`]+)['"`]/g;
  let match;
  const foundSequences = [];

  while ((match = playPattern.exec(content)) !== null) {
    const pluginId = match[1];
    const movementName = match[2];
    foundSequences.push(pluginId);

    violations.push({
      type: 'trigger-found',
      method: 'conductor.play',
      pluginId,
      movementName,
      line: getLineNumber(content, match.index),
      confidence: 0.98,
      message: `Found CIA trigger: conductor.play('${pluginId}', '${movementName}')`
    });
  }

  // Check for conductor.startSequence calls (legacy pattern)
  const startSequencePattern = /conductor\.startSequence\s*\(\s*['"`]([^'"`]+)['"`]/g;
  while ((match = startSequencePattern.exec(content)) !== null) {
    const sequenceName = match[1];
    foundSequences.push(sequenceName);

    violations.push({
      type: 'trigger-found',
      method: 'conductor.startSequence',
      sequenceName,
      line: getLineNumber(content, match.index),
      confidence: 0.95,
      message: `Found sequence trigger: conductor.startSequence('${sequenceName}')`
    });
  }

  // Check for conductor.executeMovementHandler calls
  const executeHandlerPattern = /conductor\.executeMovementHandler\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*['"`]([^'"`]+)['"`]/g;
  while ((match = executeHandlerPattern.exec(content)) !== null) {
    const sequenceId = match[1];
    const movementName = match[2];
    
    violations.push({
      type: 'trigger-found',
      method: 'conductor.executeMovementHandler',
      sequenceId,
      movementName,
      line: getLineNumber(content, match.index),
      confidence: 0.95,
      message: `Found movement handler trigger: conductor.executeMovementHandler('${sequenceId}', '${movementName}')`
    });
  }

  // Check for convenience functions
  const convenienceFunctions = rule.convenienceFunctions || [];
  convenienceFunctions.forEach(funcName => {
    const funcPattern = new RegExp(`${funcName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\(`, 'g');
    while ((match = funcPattern.exec(content)) !== null) {
      violations.push({
        type: 'trigger-found',
        method: funcName,
        line: getLineNumber(content, match.index),
        confidence: 0.90,
        message: `Found convenience function trigger: ${funcName}()`
      });
    }
  });

  // STRICT CIA VALIDATION: App.tsx MUST have conductor.play() calls
  if (filePath.includes('App.tsx')) {
    const hasPlayCalls = violations.some(v => v.method === 'conductor.play');

    if (!hasPlayCalls) {
      const foundMethods = violations.map(v => v.method).filter(Boolean);
      errors.push(`App.tsx MUST contain conductor.play() calls for CIA compliance. Found: [${foundMethods.join(', ')}] but missing required conductor.play('plugin-id', 'movement-name', context) pattern.`);
    }
  }

  // Also check for Canvas.tsx and other critical trigger files
  if ((filePath.includes('Canvas.tsx') || filePath.includes('canvas')) && violations.length === 0) {
    warnings.push({
      type: 'missing-canvas-triggers',
      message: 'Canvas files should contain canvas-specific sequence triggers',
      confidence: 0.80
    });
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings,
    violations
  };
}

/**
 * Validate plugin registration and trigger mapping
 */
function validatePluginTriggerMapping(content, rule, filePath) {
  const errors = [];
  const warnings = [];
  const violations = [];

  // Check for sequence definitions
  const sequencePattern = /(?:export\s+)?(?:const|let|var)\s+(\w*[Ss]equence\w*)\s*=\s*\{[\s\S]*?name\s*:\s*['"`]([^'"`]+)['"`]/g;
  let match;

  while ((match = sequencePattern.exec(content)) !== null) {
    const variableName = match[1];
    const sequenceName = match[2];
    
    violations.push({
      type: 'plugin-found',
      variableName,
      sequenceName,
      line: getLineNumber(content, match.index),
      confidence: 0.92,
      message: `Found sequence definition: ${variableName} = { name: '${sequenceName}' }`
    });
  }

  // Check for registerSequence calls
  const registerPattern = /registerSequence\s*\(\s*(\w+)\s*\)/g;
  while ((match = registerPattern.exec(content)) !== null) {
    const sequenceVar = match[1];
    
    violations.push({
      type: 'plugin-registration',
      sequenceVariable: sequenceVar,
      line: getLineNumber(content, match.index),
      confidence: 0.95,
      message: `Found sequence registration: registerSequence(${sequenceVar})`
    });
  }

  // Check for conductor.registerSequence calls
  const conductorRegisterPattern = /conductor\.registerSequence\s*\(\s*(\w+)\s*\)/g;
  while ((match = conductorRegisterPattern.exec(content)) !== null) {
    const sequenceVar = match[1];
    
    violations.push({
      type: 'conductor-registration',
      sequenceVariable: sequenceVar,
      line: getLineNumber(content, match.index),
      confidence: 0.95,
      message: `Found conductor registration: conductor.registerSequence(${sequenceVar})`
    });
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings,
    violations
  };
}

/**
 * Cross-reference validation between plugins and triggers
 */
function validateCrossReference(content, rule, filePath) {
  const warnings = [];

  // This is a simplified cross-reference check
  // In a full implementation, this would cross-reference across multiple files
  
  const hasSequenceDefinition = /(?:const|let|var)\s+\w*[Ss]equence\w*\s*=/.test(content);
  const hasSequenceTrigger = /conductor\.startSequence|startCanvas|startLayout|startPanel|startJson/.test(content);

  if (hasSequenceDefinition && !hasSequenceTrigger) {
    warnings.push({
      type: 'potential-unused-sequence',
      message: 'File defines sequences but may not trigger them - verify triggers exist in App.tsx or other trigger files',
      confidence: 0.75
    });
  }

  return {
    passed: true, // Cross-reference warnings don't fail validation
    warnings
  };
}

/**
 * Get line number for a given character index
 */
function getLineNumber(content, index) {
  return content.substring(0, index).split('\n').length;
}
