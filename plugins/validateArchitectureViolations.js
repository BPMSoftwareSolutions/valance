/**
 * Architecture Violation Detection Plugin
 * Migrated from C# ArchitectureViolationDetector.cs
 * Detects architectural pattern violations in RenderX musical sequence architecture
 */

export const operator = "validateArchitectureViolations";

export async function evaluate(content, rule, context) {
  const violations = [];
  const fileName = context.filePath.split('/').pop();
  const lines = content.split('\n');

  // Initialize violation patterns (migrated from C# InitializeViolationPatterns)
  const violationPatterns = initializeViolationPatterns();

  // Process each line for violations
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lineNumber = i + 1;

    // Skip comments, imports, and empty lines
    if (isSkippableLine(line)) {
      continue;
    }

    // Check each violation pattern
    for (const [patternName, pattern] of Object.entries(violationPatterns)) {
      if (isViolation(line, pattern, fileName)) {
        const match = line.match(new RegExp(pattern.regex));
        const eventName = match && match.length > 1 ? match[1] : null;
        
        const violation = {
          type: patternName,
          description: pattern.description,
          lineNumber,
          codeSnippet: line,
          suggestion: pattern.suggestion,
          severity: pattern.severity,
          eventName,
          confidence: calculateConfidence(patternName, line, fileName),
          autoFixSuggestion: generateAutoFixSuggestion(patternName, line, eventName)
        };

        violations.push(violation);
      }
    }
  }

  if (violations.length > 0) {
    const detailedMessage = violations.map(v =>
      `  Line ${v.lineNumber}: ${v.description} (Confidence: ${Math.round(v.confidence * 100)}%)\n    Code: ${v.codeSnippet}\n    💡 ${v.suggestion}\n    🔧 Auto-fix: ${v.autoFixSuggestion}`
    ).join('\n\n');

    return {
      passed: false,
      message: `Found ${violations.length} architecture violation(s):\n\n${detailedMessage}`,
      violations: violations.map(v => ({
        line: v.lineNumber,
        message: `${v.description} (Confidence: ${Math.round(v.confidence * 100)}%)`,
        severity: v.severity,
        confidence: v.confidence,
        code: v.codeSnippet,
        suggestion: v.suggestion,
        autoFix: v.autoFixSuggestion,
        metadata: {
          violationType: v.type,
          eventName: v.eventName
        }
      }))
    };
  }

  return { passed: true };
}

/**
 * Initialize violation patterns (migrated from C# InitializeViolationPatterns)
 */
function initializeViolationPatterns() {
  return {
    // Direct EventBus violations
    DIRECT_EVENTBUS_EMIT: {
      regex: /eventBus\.emit\s*\(\s*['"]([^'"]+)['"]/,
      severity: 'critical',
      description: 'Direct eventBus.emit() call bypasses musical sequence architecture',
      suggestion: 'Use MusicalSequences.start{ComponentName}Flow() instead'
    },

    // Conductor bypass violations
    CONDUCTOR_EMIT_EVENT: {
      regex: /conductor\.emitEvent\s*\(\s*['"]([^'"]+)['"]/,
      severity: 'critical',
      description: 'conductor.emitEvent() bypasses proper beat execution',
      suggestion: 'Use conductor.executeBeat() within sequence definition'
    },

    // Direct conductor method violations
    DIRECT_EXECUTE_MOVEMENT: {
      regex: /conductor\.executeMovement\s*\(/,
      severity: 'critical',
      description: 'Direct conductor.executeMovement() call outside sequence context',
      suggestion: 'executeMovement() should only be called within sequence definitions'
    },

    DIRECT_EXECUTE_BEAT: {
      regex: /conductor\.executeBeat\s*\(/,
      severity: 'error',
      description: 'conductor.executeBeat() called outside sequence beat context',
      suggestion: 'executeBeat() should only be called within sequence beat definitions',
      allowedContexts: ['sequence.ts', 'symphony.ts']
    },

    // EventBus API Method Violations
    INCORRECT_EVENTBUS_METHOD: {
      regex: /eventBus\.(on|addEventListener|addListener|off|removeEventListener|removeListener)\s*\(/,
      severity: 'critical',
      description: 'Incorrect EventBus method - RenderX EventBus uses subscribe/unsubscribe pattern',
      suggestion: 'Replace eventBus.on() with eventBus.subscribe() and use returned unsubscribe function'
    },

    // Static EventBus violations
    STATIC_EVENTBUS_EMIT: {
      regex: /EventBus\.emit\s*\(/,
      severity: 'critical',
      description: 'Static EventBus.emit() call bypasses instance-based architecture',
      suggestion: 'Use eventBus instance through MusicalSequences API'
    },

    // Generic emit pattern violations
    GENERIC_EMIT_PATTERN: {
      regex: /\.emit\s*\(\s*['"]([^'"]+)['"]/,
      severity: 'warning',
      description: 'Generic .emit() pattern detected - verify compliance',
      suggestion: 'Ensure all event emissions flow through musical sequences'
    },

    // Custom event dispatch violations
    CUSTOM_EVENT_DISPATCH: {
      regex: /(dispatchEvent|fireEvent|triggerEvent|sendEvent)\s*\(/,
      severity: 'error',
      description: 'Custom event dispatch bypasses musical sequence architecture',
      suggestion: 'Use MusicalSequences API for all event coordination'
    },

    // Direct DOM event violations
    DOM_EVENT_DISPATCH: {
      regex: /document\.dispatchEvent\s*\(/,
      severity: 'error',
      description: 'Direct DOM event dispatch bypasses component architecture',
      suggestion: 'Use component-level event handling through musical sequences'
    },

    // Window event violations
    WINDOW_EVENT_DISPATCH: {
      regex: /window\.(dispatchEvent|postMessage)\s*\(/,
      severity: 'warning',
      description: 'Window-level event dispatch detected - verify necessity',
      suggestion: 'Consider using musical sequences for component communication'
    }
  };
}

/**
 * Check if a line represents a violation (migrated from C# IsViolation)
 */
function isViolation(line, pattern, fileName) {
  // Check if pattern matches
  const regex = new RegExp(pattern.regex);
  if (!regex.test(line)) {
    return false;
  }

  // Check allowed contexts
  if (pattern.allowedContexts && pattern.allowedContexts.length > 0) {
    const isInAllowedContext = pattern.allowedContexts.some(context => {
      // More flexible context matching
      if (context === 'sequence.ts') {
        return fileName.includes('sequence') && (fileName.endsWith('.ts') || fileName.endsWith('.js'));
      }
      if (context === 'symphony.ts') {
        return fileName.includes('symphony') && (fileName.endsWith('.ts') || fileName.endsWith('.js'));
      }
      return fileName.includes(context);
    });
    if (isInAllowedContext) {
      return false; // Not a violation: in allowed context
    }
  }

  // Check prohibited contexts
  if (pattern.prohibitedContexts && pattern.prohibitedContexts.length > 0) {
    const isInProhibitedContext = pattern.prohibitedContexts.some(context => 
      fileName.includes(context)
    );
    if (isInProhibitedContext) {
      return true; // Violation: in prohibited context
    }
  }

  // Check file-specific rules
  if (pattern.appliedToFiles && pattern.appliedToFiles.length > 0) {
    const appliesToFile = pattern.appliedToFiles.some(file => 
      fileName.includes(file)
    );
    if (!appliesToFile) {
      return false; // Not applicable to this file
    }
  }

  return true; // Default: it's a violation
}

/**
 * Check if line should be skipped (migrated from C# IsSkippableLine)
 */
function isSkippableLine(line) {
  return line.startsWith('//') || 
         line.startsWith('/*') || 
         line.startsWith('*') ||
         line.startsWith('import') ||
         (line.startsWith('export') && line.includes('from')) ||
         line.length === 0;
}

/**
 * Calculate confidence score for violation
 */
function calculateConfidence(patternName, line, fileName) {
  let confidence = 0.9; // Base confidence

  // Higher confidence for critical architectural violations
  if (patternName.includes('DIRECT_EVENTBUS') || patternName.includes('CONDUCTOR_EMIT')) {
    confidence = 0.95;
  }

  // Lower confidence for generic patterns
  if (patternName.includes('GENERIC_EMIT') || patternName.includes('WINDOW_EVENT')) {
    confidence = 0.85;
  }

  // Higher confidence for RenderX-specific patterns
  if (line.includes('conductor') || line.includes('eventBus') || line.includes('MusicalSequences')) {
    confidence += 0.05;
  }

  // Lower confidence in test files
  if (fileName.includes('test') || fileName.includes('spec')) {
    confidence -= 0.1;
  }

  return Math.max(0.7, Math.min(1.0, confidence));
}

/**
 * Generate auto-fix suggestion based on violation type
 */
function generateAutoFixSuggestion(patternName, line, eventName) {
  switch (patternName) {
    case 'DIRECT_EVENTBUS_EMIT':
      return eventName ? 
        `MusicalSequences.start${capitalize(eventName)}Flow()` : 
        'MusicalSequences.start{ComponentName}Flow()';
    
    case 'CONDUCTOR_EMIT_EVENT':
      return 'conductor.executeBeat({ eventType: "' + (eventName || 'EVENT_TYPE') + '", data: {} })';
    
    case 'INCORRECT_EVENTBUS_METHOD':
      if (line.includes('.on(')) {
        return line.replace('.on(', '.subscribe(');
      }
      return 'Use eventBus.subscribe() instead';
    
    case 'STATIC_EVENTBUS_EMIT':
      return 'Use eventBus instance: eventBus.emit()';
    
    default:
      return 'Use MusicalSequences API for event coordination';
  }
}

/**
 * Capitalize first letter of string
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
