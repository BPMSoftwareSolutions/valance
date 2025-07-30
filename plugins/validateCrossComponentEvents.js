/**
 * Cross Component Event Validation Plugin
 * Migrated from C# CrossComponentEventValidator.cs
 * Validates events across component boundaries in RenderX musical sequence architecture
 */

export const operator = "validateCrossComponentEvents";

export async function evaluate(content, rule, context) {
  const violations = [];
  const fileName = context.filePath.split('/').pop();
  const filePath = context.filePath;

  try {
    // Extract symphony events from sequence files
    const symphonyEvents = extractSymphonyEvents(content, fileName);

    if (symphonyEvents.length === 0) {
      return { passed: true }; // No events to validate
    }

    // Determine component name from file path (default to canvas for test files)
    const componentName = determineComponentName(filePath);
    
    // Get component event types (simulated - in real implementation would read from event-types files)
    const componentEventTypes = getComponentEventTypes(componentName);
    
    // Filter to cross-component events only
    const crossComponentEvents = filterCrossComponentEvents(symphonyEvents, componentName);
    
    // For cross-component validation, check if canvas events are missing in OTHER components
    const missingEvents = [];

    if (componentName === 'canvas') {
      // Check if canvas events are available in other components
      const targetComponents = ['button', 'container', 'element'];

      for (const targetComponent of targetComponents) {
        const targetEventTypes = getComponentEventTypes(targetComponent);
        const missingInTarget = crossComponentEvents.filter(event =>
          !targetEventTypes.includes(event)
        );

        for (const eventName of missingInTarget) {
          missingEvents.push({
            eventName,
            targetComponent,
            sourceComponent: 'canvas'
          });
        }
      }
    } else {
      // For non-canvas components, check if they have access to canvas events they use
      const canvasEventTypes = getComponentEventTypes('canvas');
      const usedCanvasEvents = crossComponentEvents.filter(event =>
        event.startsWith('canvas-') && !componentEventTypes.includes(event)
      );

      for (const eventName of usedCanvasEvents) {
        missingEvents.push({
          eventName,
          targetComponent: componentName,
          sourceComponent: 'canvas'
        });
      }
    }

    // Generate violations for missing events
    for (const missingEvent of missingEvents) {
      const violation = {
        type: 'MISSING_CROSS_COMPONENT_EVENT',
        eventName: missingEvent.eventName,
        componentName: missingEvent.targetComponent,
        sourceComponent: missingEvent.sourceComponent,
        description: `Cross-component event '${missingEvent.eventName}' from ${missingEvent.sourceComponent} is not registered in ${missingEvent.targetComponent} event types`,
        severity: 'error',
        confidence: calculateEventConfidence(missingEvent.eventName, missingEvent.targetComponent),
        suggestion: `Add '${missingEvent.eventName}' to ${missingEvent.targetComponent}.event-types.ts`,
        autoFixSuggestion: generateEventTypeConstant(missingEvent.eventName),
        lineNumber: findEventLineNumber(content, missingEvent.eventName)
      };
      violations.push(violation);
    }



    if (violations.length > 0) {
      const detailedMessage = violations.map(v => 
        `  Line ${v.lineNumber}: ${v.description} (Confidence: ${Math.round(v.confidence * 100)}%)\n    Event: ${v.eventName}\n    💡 ${v.suggestion}\n    🔧 Auto-fix: ${v.autoFixSuggestion}`
      ).join('\n\n');

      return {
        passed: false,
        message: `Found ${violations.length} cross-component event violation(s):\n\n${detailedMessage}`,
        violations: violations.map(v => ({
          line: v.lineNumber,
          message: `${v.description} (Confidence: ${Math.round(v.confidence * 100)}%)`,
          severity: v.severity,
          confidence: v.confidence,
          code: `event: '${v.eventName}'`,
          suggestion: v.suggestion,
          autoFix: v.autoFixSuggestion,
          metadata: {
            violationType: v.type,
            eventName: v.eventName,
            componentName: v.componentName,
            sourceComponent: v.sourceComponent
          }
        }))
      };
    }

    return { passed: true };

  } catch (error) {
    return {
      passed: false,
      message: `Cross-component event validation error: ${error.message}`
    };
  }
}

/**
 * Extract symphony events from sequence file content
 */
function extractSymphonyEvents(content, fileName) {
  const events = [];
  
  // Only process sequence files or test files
  if (!fileName.includes('sequence') && !fileName.includes('symphony') && !fileName.includes('cross-component')) {
    return events;
  }

  // Pattern: event: EVENT_TYPES.SOME_EVENT or event: 'some-event'
  const eventPattern = /event:\s*(?:EVENT_TYPES\.([A-Z_]+)|['"]([^'"]+)['"])/g;
  let match;

  while ((match = eventPattern.exec(content)) !== null) {
    const eventName = match[1] ?
      convertEventTypeToString(match[1]) :
      match[2];

    if (eventName && !events.includes(eventName)) {
      events.push(eventName);
    }
  }

  return events;
}

/**
 * Determine component name from file path
 */
function determineComponentName(filePath) {
  // Extract component name from path patterns
  const pathSegments = filePath.split('/');

  // Look for component indicators in path
  for (const segment of pathSegments) {
    if (segment.includes('canvas')) return 'canvas';
    if (segment.includes('button')) return 'button';
    if (segment.includes('container')) return 'container';
    if (segment.includes('element')) return 'element';
  }

  // Default to canvas for test files with cross-component events
  if (filePath.includes('test') || filePath.includes('cross-component')) {
    return 'canvas';
  }

  return 'unknown';
}

/**
 * Get component event types (simplified implementation)
 */
function getComponentEventTypes(componentName) {
  // In real implementation, this would read from component event-types files
  // For now, return common event types for each component
  const componentEventTypes = {
    canvas: [
      'canvas-element-selected',
      'canvas-element-deselected', 
      'canvas-drag-start',
      'canvas-drag-end',
      'canvas-resize-start',
      'canvas-resize-end'
    ],
    button: [
      'button-clicked',
      'button-hover',
      'button-focus'
    ],
    container: [
      'container-expanded',
      'container-collapsed',
      'container-resized'
    ],
    element: [
      'element-created',
      'element-updated',
      'element-deleted'
    ]
  };

  return componentEventTypes[componentName] || [];
}

/**
 * Filter to cross-component events only
 */
function filterCrossComponentEvents(symphonyEvents, componentName) {
  // Canvas-internal events that should NOT be cross-component
  const canvasInternalEvents = new Set([
    'canvas-css-sync-detected',
    'canvas-css-synchronized', 
    'canvas-css-sync-complete',
    'canvas-render-start',
    'canvas-render-complete',
    'canvas-performance-warning',
    'canvas-mode-changed',
    'canvas-edit-mode-coordination',
    'canvas-zoom-changed',
    'canvas-pan-changed',
    'canvas-bounds-changed',
    'canvas-tool-selected',
    'canvas-tool-deselected',
    'canvas-grid-toggled',
    'canvas-snap-toggled',
    'canvas-initialized',
    'canvas-destroyed',
    'canvas-reset'
  ]);

  // Filter out component-internal events
  return symphonyEvents.filter(eventName => 
    !canvasInternalEvents.has(eventName)
  );
}

/**
 * Validate cross-component registration gaps
 */
function validateCrossComponentRegistration(symphonyEvents) {
  const gaps = {};
  const targetComponents = ['button', 'container', 'element'];
  
  // Only check canvas events that should be accessible to other components
  const canvasEvents = symphonyEvents.filter(e => e.startsWith('canvas-'));
  
  if (canvasEvents.length === 0) {
    return gaps;
  }

  for (const component of targetComponents) {
    const componentEvents = getComponentEventTypes(component);
    const missingInComponent = canvasEvents.filter(e => 
      !componentEvents.includes(e)
    );
    
    if (missingInComponent.length > 0) {
      gaps[component] = missingInComponent;
    }
  }

  return gaps;
}

/**
 * Calculate confidence for event validation
 */
function calculateEventConfidence(eventName, componentName) {
  let confidence = 0.85; // Base confidence

  // Higher confidence for well-formed event names
  if (eventName.includes('-') && eventName.length > 5) {
    confidence += 0.1;
  }

  // Higher confidence for component-specific events
  if (eventName.startsWith(componentName + '-')) {
    confidence += 0.05;
  }

  return Math.max(0.7, Math.min(1.0, confidence));
}

/**
 * Calculate confidence for cross-component validation
 */
function calculateCrossComponentConfidence(eventName, targetComponent) {
  let confidence = 0.8; // Base confidence for cross-component

  // Higher confidence for canvas events
  if (eventName.startsWith('canvas-')) {
    confidence += 0.1;
  }

  return Math.max(0.7, Math.min(1.0, confidence));
}

/**
 * Generate event type constant
 */
function generateEventTypeConstant(eventName) {
  const constantName = eventName.toUpperCase().replace(/-/g, '_');
  return `${constantName}: '${eventName}'`;
}

/**
 * Convert EVENT_TYPE constant to string
 */
function convertEventTypeToString(eventType) {
  return eventType.toLowerCase().replace(/_/g, '-');
}

/**
 * Find line number where event is defined
 */
function findEventLineNumber(content, eventName) {
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(eventName)) {
      return i + 1;
    }
  }
  return 1;
}
