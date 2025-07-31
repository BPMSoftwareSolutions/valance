export const operator = "validateSpaAiAnnotation";

export async function evaluate(content, rule, context) {
  try {
    const filePath = context.filePath;
    const fileName = filePath.split('/').pop();
    
    const errors = [];
    const warnings = [];

    // Check for agent context annotations
    if (rule.checkAgentContext) {
      const contextValidation = validateAgentContext(content, filePath);
      if (!contextValidation.passed) {
        if (rule.enforceHandlerAnnotations && filePath.includes('/handlers/')) {
          errors.push(contextValidation.message);
        } else {
          warnings.push(contextValidation.message);
        }
      }
    }

    // Validate annotation format
    if (rule.validateAnnotationFormat) {
      const formatValidation = validateAnnotationFormat(content);
      if (formatValidation.warnings) {
        warnings.push(...formatValidation.warnings);
      }
    }

    // Check sequence documentation
    if (rule.checkSequenceDocumentation && fileName === 'sequence.ts') {
      const sequenceValidation = validateSequenceDocumentation(content);
      if (sequenceValidation.warnings) {
        warnings.push(...sequenceValidation.warnings);
      }
    }

    const result = {
      passed: errors.length === 0,
      message: errors.length === 0 
        ? "AI annotation validation passed"
        : `AI annotation validation failed: ${errors.join('; ')}`
    };

    if (warnings.length > 0 && rule.verbose) {
      result.warnings = warnings;
    }

    return result;

  } catch (error) {
    return {
      passed: false,
      message: `AI annotation validation error: ${error.message}`
    };
  }
}

function validateAgentContext(content, filePath) {
  const hasAgentContext = content.includes('@agent-context');
  
  if (!hasAgentContext) {
    let expectedContext = "general purpose";
    
    if (filePath.includes('/handlers/')) {
      expectedContext = "handler movement";
    } else if (filePath.includes('/hooks/')) {
      expectedContext = "hook for functionality";
    } else if (filePath.includes('/logic/')) {
      expectedContext = "business logic";
    }
    
    return {
      passed: false,
      message: `Missing @agent-context annotation (expected: ${expectedContext})`
    };
  }

  return { passed: true };
}

function validateAnnotationFormat(content) {
  const warnings = [];
  
  // Check for well-formed annotations
  const agentAnnotations = content.match(/@agent-[a-z]+:/g) || [];
  
  for (const annotation of agentAnnotations) {
    const line = content.split('\n').find(line => line.includes(annotation));
    
    if (line && line.trim().endsWith(':')) {
      warnings.push(`Annotation '${annotation}' appears incomplete - missing description`);
    }
  }

  return { warnings: warnings.length > 0 ? warnings : undefined };
}

function validateSequenceDocumentation(content) {
  const warnings = [];
  
  // Check for sequence documentation
  if (!content.includes('@agent-context')) {
    warnings.push("Sequence file should have @agent-context annotation describing the symphony");
  }
  
  // Check for movement documentation
  const movementMatches = content.match(/{\s*label:\s*['"]([^'"]+)['"]/g) || [];
  
  for (const match of movementMatches) {
    const movementName = match.match(/['"]([^'"]+)['"]/)[1];
    const movementContext = `@agent-context.*${movementName}`;
    const hasMovementDoc = new RegExp(movementContext, 'i').test(content);
    
    if (!hasMovementDoc) {
      warnings.push(`Movement '${movementName}' could benefit from @agent-context documentation`);
    }
  }

  return { warnings: warnings.length > 0 ? warnings : undefined };
}
