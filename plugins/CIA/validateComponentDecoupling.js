export const operator = "validateComponentDecoupling";

export async function evaluate(content, rule, context) {
  try {
    const filePath = context.filePath;
    const errors = [];
    const warnings = [];

    // Check if this is an app file that should be decoupled
    const isAppFile = /\/(App|AppContent)\.(tsx|ts|jsx|js)$/.test(filePath);
    
    if (!isAppFile) {
      return {
        passed: true,
        message: "Not an app file, skipping component decoupling validation"
      };
    }

    // Check for forbidden component types
    if (rule.checkForbiddenComponentTypes) {
      const forbiddenValidation = validateForbiddenComponentTypes(content, rule);
      if (!forbiddenValidation.passed) {
        errors.push(forbiddenValidation.message);
      }
      if (forbiddenValidation.warnings) {
        warnings.push(...forbiddenValidation.warnings);
      }
    }

    // Validate metadata access patterns
    if (rule.validateMetadataAccess) {
      const metadataValidation = validateMetadataAccess(content, rule);
      if (!metadataValidation.passed) {
        errors.push(metadataValidation.message);
      }
    }

    // Check for component-specific logic
    if (rule.checkComponentSpecificLogic) {
      const logicValidation = validateComponentSpecificLogic(content, rule);
      if (!logicValidation.passed) {
        errors.push(logicValidation.message);
      }
    }

    // Enforce generic interactions
    if (rule.enforceGenericInteractions) {
      const interactionValidation = validateGenericInteractions(content, rule);
      if (!interactionValidation.passed) {
        warnings.push(interactionValidation.message);
      }
    }

    if (errors.length > 0) {
      return {
        passed: false,
        message: `Component decoupling validation failed: ${errors.join('; ')}`
      };
    }

    return {
      passed: true,
      message: "Component decoupling validation passed - app properly decoupled from component specifics",
      warnings: warnings.length > 0 ? warnings : undefined
    };

  } catch (error) {
    return {
      passed: false,
      message: `Component decoupling validation error: ${error.message}`
    };
  }
}

function validateForbiddenComponentTypes(content, rule) {
  const forbiddenTypes = rule.forbiddenComponentTypes || [];
  const allowedArchitectural = rule.allowedArchitecturalComponents || [];
  const errors = [];
  const warnings = [];

  for (const forbiddenType of forbiddenTypes) {
    // Check for direct type references
    const typePattern = new RegExp(`['"\`]${forbiddenType}['"\`]`, 'gi');
    const typeMatches = content.match(typePattern);
    
    if (typeMatches) {
      // Check if it's in an allowed architectural context
      const contextPattern = new RegExp(`(canvas|element-library|component-drag).*['"\`]${forbiddenType}['"\`]`, 'gi');
      const contextMatches = content.match(contextPattern);
      
      if (!contextMatches || contextMatches.length < typeMatches.length) {
        errors.push(`Found forbidden component type reference: ${forbiddenType}`);
      }
    }

    // Check for component-specific rendering logic
    const renderPattern = new RegExp(`if\\s*\\(.*type\\s*===\\s*['"\`]${forbiddenType}['"\`]`, 'gi');
    if (renderPattern.test(content)) {
      errors.push(`Found component-specific rendering logic for: ${forbiddenType}`);
    }
  }

  // Check for allowed architectural components usage
  for (const allowedType of allowedArchitectural) {
    const allowedPattern = new RegExp(`['"\`]${allowedType}['"\`]|<${allowedType}|${allowedType}\\s*\\(`, 'gi');
    if (allowedPattern.test(content)) {
      warnings.push(`Using allowed architectural component: ${allowedType}`);
    }
  }

  return {
    passed: errors.length === 0,
    message: errors.length > 0 ? errors.join('; ') : "No forbidden component types found",
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

function validateMetadataAccess(content, rule) {
  const forbiddenPatterns = rule.forbiddenPatterns || [
    "component\\.metadata\\.type",
    "component\\.metadata\\.name"
  ];

  const errors = [];

  for (const pattern of forbiddenPatterns) {
    const regex = new RegExp(pattern, 'gi');
    if (regex.test(content)) {
      // Check if it's in an allowed canvas context
      const canvasContextPattern = new RegExp(`canvas.*${pattern}`, 'gi');
      if (!canvasContextPattern.test(content)) {
        errors.push(`Found forbidden metadata access pattern: ${pattern}`);
      }
    }
  }

  return {
    passed: errors.length === 0,
    message: errors.length > 0 ? errors.join('; ') : "No forbidden metadata access patterns found"
  };
}

function validateComponentSpecificLogic(content, rule) {
  const errors = [];

  // Check for switch statements on component types
  const switchPattern = /switch\s*\(\s*component\.type\s*\)|switch\s*\(\s*element\.type\s*\)/gi;
  if (switchPattern.test(content)) {
    // Allow if it's in canvas context
    const canvasSwitchPattern = /canvas.*switch\s*\(\s*(component|element)\.type\s*\)/gi;
    if (!canvasSwitchPattern.test(content)) {
      errors.push("Found component-specific switch statement outside canvas context");
    }
  }

  // Check for component-specific property handling
  const propertyPatterns = [
    /variant\s*:/gi,
    /size\s*:/gi,
    /disabled\s*:/gi
  ];

  for (const pattern of propertyPatterns) {
    if (pattern.test(content)) {
      // Allow if it's in canvas or architectural context
      const architecturalContext = /(canvas|element-library|architectural)/gi;
      if (!architecturalContext.test(content)) {
        errors.push(`Found component-specific property handling: ${pattern.source}`);
      }
    }
  }

  return {
    passed: errors.length === 0,
    message: errors.length > 0 ? errors.join('; ') : "No component-specific logic found"
  };
}

function validateGenericInteractions(content, rule) {
  const warnings = [];

  // Check for proper conductor.play() usage
  const conductorPlayPattern = /conductor\.play\s*\(/gi;
  const conductorMatches = content.match(conductorPlayPattern);

  if (conductorMatches && conductorMatches.length > 0) {
    warnings.push(`Found ${conductorMatches.length} conductor.play() calls - good architectural pattern`);
  }

  // Check for generic element handling
  const genericPatterns = [
    /element\.id/gi,
    /component\.id/gi,
    /data-component/gi
  ];

  for (const pattern of genericPatterns) {
    const matches = content.match(pattern);
    if (matches && matches.length > 0) {
      warnings.push(`Found ${matches.length} generic interaction patterns: ${pattern.source}`);
    }
  }

  return {
    passed: true,
    message: "Generic interaction validation completed",
    warnings: warnings.length > 0 ? warnings : undefined
  };
}
