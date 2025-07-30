/**
 * Data Contract Validation Plugin
 * Migrated from C# DataContractValidator.cs
 * Validates data contracts through RenderX musical sequencing architecture
 */

export const operator = "validateDataContracts";

export async function evaluate(content, rule, context) {
  const violations = [];
  const fileName = context.filePath.split('/').pop();
  const filePath = context.filePath;

  try {
    // Only process sequence and handler files
    if (!isRelevantFile(fileName)) {
      return { passed: true };
    }

    // Extract convenience function contracts
    const convenienceContracts = extractConvenienceFunctionContracts(content, filePath);
    
    // Extract handler contracts
    const handlerContracts = extractHandlerContracts(content, filePath);
    
    // Extract sequence events
    const sequenceEvents = extractSequenceEvents(content);

    // Validate data flow between contracts
    const dataFlowViolations = validateDataFlow(
      convenienceContracts, 
      handlerContracts, 
      sequenceEvents
    );

    violations.push(...dataFlowViolations);

    if (violations.length > 0) {
      const detailedMessage = violations.map(v => 
        `  Line ${v.lineNumber}: ${v.description} (Confidence: ${Math.round(v.confidence * 100)}%)\n    Function: ${v.functionName}\n    💡 ${v.suggestion}\n    🔧 Auto-fix: ${v.autoFixSuggestion}`
      ).join('\n\n');

      return {
        passed: false,
        message: `Found ${violations.length} data contract violation(s):\n\n${detailedMessage}`,
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
            functionName: v.functionName,
            missingProperty: v.missingProperty,
            eventType: v.eventType
          }
        }))
      };
    }

    return { passed: true };

  } catch (error) {
    return {
      passed: false,
      message: `Data contract validation error: ${error.message}`
    };
  }
}

/**
 * Check if file is relevant for data contract validation
 */
function isRelevantFile(fileName) {
  return fileName.includes('sequence') ||
         fileName.includes('handler') ||
         fileName.includes('symphony') ||
         fileName.includes('index') ||
         fileName.includes('data-contract'); // Include test files
}

/**
 * Extract convenience function contracts from content
 */
function extractConvenienceFunctionContracts(content, filePath) {
  const contracts = [];

  // First find all function declarations
  const functionDeclarationPattern = /export\s+(?:async\s+)?function\s+(\w+)\s*\([^)]*\)\s*{/g;
  let funcMatch;

  while ((funcMatch = functionDeclarationPattern.exec(content)) !== null) {
    const functionName = funcMatch[1];
    const functionStart = funcMatch.index;

    // Find the function body by matching braces
    let braceCount = 1;
    let pos = funcMatch.index + funcMatch[0].length;
    let functionEnd = pos;

    while (pos < content.length && braceCount > 0) {
      if (content[pos] === '{') braceCount++;
      if (content[pos] === '}') braceCount--;
      pos++;
      if (braceCount === 0) functionEnd = pos;
    }

    const functionBody = content.substring(functionStart, functionEnd);

    // Check if this function calls startSequence
    const startSequencePattern = /conductorEventBus\.startSequence\s*\(\s*['"]([^'"]+)['"],\s*({[\s\S]*?})\s*\)/;
    const seqMatch = startSequencePattern.exec(functionBody);

    if (seqMatch) {
      const sequenceName = seqMatch[1];
      const dataObject = seqMatch[2];
      const lineNumber = getLineNumber(content, functionStart);

      const contract = {
        functionName,
        sequenceName,
        dataProperties: extractDataProperties(dataObject),
        filePath,
        lineNumber,
        dataObject
      };

      contracts.push(contract);
    }
  }

  return contracts;
}

/**
 * Extract handler contracts from content
 */
function extractHandlerContracts(content, filePath) {
  const contracts = [];
  
  // Pattern for event handlers
  const handlerPattern = /(?:export\s+)?(?:async\s+)?function\s+(\w*[Hh]andler?\w*)\s*\(\s*([^)]*)\s*\)\s*{([^}]*)}/g;
  let match;

  while ((match = handlerPattern.exec(content)) !== null) {
    const handlerName = match[1];
    const parameters = match[2];
    const body = match[3];
    const lineNumber = getLineNumber(content, match.index);

    // Determine event type from handler name or body
    const eventType = determineEventType(handlerName, body);
    
    const contract = {
      handlerName,
      eventType,
      requiredProperties: extractRequiredProperties(body, parameters),
      filePath,
      lineNumber,
      parameters,
      body
    };

    contracts.push(contract);
  }

  return contracts;
}

/**
 * Extract sequence events from content
 */
function extractSequenceEvents(content) {
  const events = [];
  
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
 * Validate data flow between convenience functions and handlers
 */
function validateDataFlow(convenienceContracts, handlerContracts, sequenceEvents) {
  const violations = [];

  for (const convenienceContract of convenienceContracts) {
    // Find handlers that might receive data from this convenience function
    const relatedHandlers = handlerContracts.filter(handler => 
      sequenceEvents.includes(handler.eventType) ||
      handler.eventType === convenienceContract.sequenceName
    );

    for (const handler of relatedHandlers) {
      // Check if convenience function provides required data
      const missingProperties = handler.requiredProperties.filter(prop => 
        !convenienceContract.dataProperties.includes(prop)
      );

      for (const missingProperty of missingProperties) {
        violations.push({
          type: 'MISSING_DATA_PROPERTY',
          functionName: convenienceContract.functionName,
          handlerName: handler.handlerName,
          missingProperty,
          eventType: handler.eventType,
          description: `Convenience function '${convenienceContract.functionName}' does not provide required property '${missingProperty}' for handler '${handler.handlerName}'`,
          severity: 'error',
          confidence: calculateDataFlowConfidence(convenienceContract, handler, missingProperty),
          suggestion: `Add '${missingProperty}' to the data object in convenience function '${convenienceContract.functionName}'`,
          autoFixSuggestion: generateDataPropertyFix(missingProperty, convenienceContract.dataObject),
          lineNumber: convenienceContract.lineNumber,
          codeSnippet: convenienceContract.dataObject
        });
      }
    }
  }

  // Check for handlers without corresponding convenience functions
  for (const handler of handlerContracts) {
    const hasConvenienceFunction = convenienceContracts.some(contract => 
      sequenceEvents.includes(handler.eventType) ||
      contract.sequenceName === handler.eventType
    );

    if (!hasConvenienceFunction && handler.requiredProperties.length > 0) {
      violations.push({
        type: 'MISSING_CONVENIENCE_FUNCTION',
        handlerName: handler.handlerName,
        eventType: handler.eventType,
        description: `Handler '${handler.handlerName}' expects data but no convenience function provides it`,
        severity: 'warning',
        confidence: 0.8,
        suggestion: `Create a convenience function that calls startSequence for '${handler.eventType}'`,
        autoFixSuggestion: generateConvenienceFunctionTemplate(handler.eventType, handler.requiredProperties),
        lineNumber: handler.lineNumber,
        codeSnippet: handler.handlerName
      });
    }
  }

  return violations;
}

/**
 * Extract data properties from data object
 */
function extractDataProperties(dataObject) {
  const properties = [];
  
  // Simple property extraction from object literal
  const propertyPattern = /(\w+):\s*[^,}]+/g;
  let match;

  while ((match = propertyPattern.exec(dataObject)) !== null) {
    properties.push(match[1]);
  }

  return properties;
}

/**
 * Extract required properties from handler body
 */
function extractRequiredProperties(body, parameters) {
  const properties = [];
  
  // Look for property access patterns
  const accessPatterns = [
    /data\.(\w+)/g,
    /eventData\.(\w+)/g,
    /payload\.(\w+)/g,
    /\{[^}]*(\w+)[^}]*\}/g // Destructuring
  ];

  for (const pattern of accessPatterns) {
    let match;
    while ((match = pattern.exec(body)) !== null) {
      const property = match[1];
      if (property && !properties.includes(property)) {
        properties.push(property);
      }
    }
  }

  return properties;
}

/**
 * Determine event type from handler name or body
 */
function determineEventType(handlerName, body) {
  // Try to extract from handler name
  const nameMatch = handlerName.match(/handle(\w+)/i);
  if (nameMatch) {
    return convertCamelToKebab(nameMatch[1]);
  }

  // Try to extract from body
  const eventMatch = body.match(/event:\s*['"]([^'"]+)['"]/);
  if (eventMatch) {
    return eventMatch[1];
  }

  return 'unknown-event';
}

/**
 * Calculate confidence for data flow validation
 */
function calculateDataFlowConfidence(convenienceContract, handler, missingProperty) {
  let confidence = 0.85; // Base confidence

  // Higher confidence if property name is specific
  if (missingProperty.length > 3 && !['data', 'event', 'payload'].includes(missingProperty)) {
    confidence += 0.1;
  }

  // Higher confidence if handler and convenience function are clearly related
  if (handler.eventType.includes(convenienceContract.sequenceName) || 
      convenienceContract.sequenceName.includes(handler.eventType)) {
    confidence += 0.05;
  }

  return Math.max(0.7, Math.min(1.0, confidence));
}

/**
 * Generate auto-fix for missing data property
 */
function generateDataPropertyFix(missingProperty, dataObject) {
  // Simple fix: add property to existing object
  const cleanObject = dataObject.replace(/}$/, '');
  return `${cleanObject}, ${missingProperty}: /* TODO: provide value */ }`;
}

/**
 * Generate convenience function template
 */
function generateConvenienceFunctionTemplate(eventType, requiredProperties) {
  const functionName = `start${convertKebabToCamel(eventType)}`;
  const dataProps = requiredProperties.map(prop => `${prop}: /* TODO */`).join(', ');
  
  return `export function ${functionName}(${requiredProperties.join(', ')}) {
  return conductorEventBus.startSequence('${eventType}', { ${dataProps} });
}`;
}

/**
 * Utility functions
 */
function convertEventTypeToString(eventType) {
  return eventType.toLowerCase().replace(/_/g, '-');
}

function convertCamelToKebab(str) {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
}

function convertKebabToCamel(str) {
  return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
}

function getLineNumber(content, index) {
  return content.substring(0, index).split('\n').length;
}
