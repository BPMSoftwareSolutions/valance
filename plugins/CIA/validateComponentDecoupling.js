export const operator = "validateComponentDecoupling";

export async function evaluate(content, rule, context) {
  try {
    const filePath = context.filePath;
    const errors = [];
    const warnings = [];
    const violations = [];

    // Check if this is an app file that should be decoupled
    const appFilePatterns = [
      ".*App\\.(tsx|ts|js|jsx)$",
      ".*main\\.(tsx|ts|js|jsx)$", 
      ".*index\\.(tsx|ts|js|jsx)$"
    ];
    
    const isAppFile = appFilePatterns.some(pattern => 
      new RegExp(pattern, 'i').test(filePath)
    );

    if (!isAppFile) {
      return {
        passed: true,
        message: "Not an app file, skipping component decoupling validation"
      };
    }

    if (rule.verbose) {
      console.log(`🔍 Checking component decoupling in: ${filePath}`);
    }

    // VALIDATION 1: Check for forbidden component type references
    const componentTypeViolations = checkForbiddenComponentTypes(content, rule, filePath);
    if (componentTypeViolations.length > 0) {
      errors.push(...componentTypeViolations.map(v => v.message));
      violations.push(...componentTypeViolations);
    }

    // VALIDATION 2: Check for forbidden metadata access patterns
    const metadataViolations = checkForbiddenMetadataAccess(content, rule, filePath);
    if (metadataViolations.length > 0) {
      errors.push(...metadataViolations.map(v => v.message));
      violations.push(...metadataViolations);
    }

    // VALIDATION 3: Check for forbidden component-specific patterns
    const patternViolations = checkForbiddenPatterns(content, rule, filePath);
    if (patternViolations.length > 0) {
      errors.push(...patternViolations.map(v => v.message));
      violations.push(...patternViolations);
    }

    // VALIDATION 4: Check for proper interaction data usage
    const interactionViolations = checkInteractionDataUsage(content, rule, filePath);
    if (interactionViolations.length > 0) {
      warnings.push(...interactionViolations.map(v => v.message));
      violations.push(...interactionViolations);
    }

    const result = {
      passed: errors.length === 0,
      message: errors.length === 0
        ? "Component decoupling validation passed"
        : `Component decoupling violations found: ${errors.length} errors`,
      violations: violations.length > 0 ? violations : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      metadata: {
        isAppFile,
        filePath,
        errorsFound: errors.length,
        warningsFound: warnings.length,
        totalViolations: violations.length
      }
    };

    if (rule.verbose) {
      console.log(`🧠 Component Decoupling: ${filePath} - ${result.passed ? 'PASSED' : 'FAILED'}`);
      if (violations.length > 0) {
        console.log(`   Found ${violations.length} decoupling violations`);
        violations.forEach((v, i) => {
          console.log(`     ${i + 1}. ${v.message} (line ${v.line})`);
        });
      }
    }

    return result;

  } catch (error) {
    return {
      passed: false,
      message: `Component decoupling validation error: ${error.message}`,
      error: error.message
    };
  }
}

/**
 * Check for forbidden component type references
 */
function checkForbiddenComponentTypes(content, rule, filePath) {
  const violations = [];
  const forbiddenTypes = rule.forbiddenComponentReferences || [
    'button', 'input', 'paragraph', 'div', 'span', 'img', 'text', 'heading'
  ];

  forbiddenTypes.forEach(componentType => {
    // Check for direct component type references in strings (exclude HTML attributes)
    const typeStringPattern = new RegExp(`['"\`]${componentType}['"\`]`, 'gi');
    let match;
    while ((match = typeStringPattern.exec(content)) !== null) {
      // Skip HTML attributes like type="text", type="button" in input elements
      const beforeMatch = content.substring(Math.max(0, match.index - 20), match.index);
      const isHtmlAttribute = /type\s*=\s*$/.test(beforeMatch) || /input.*type\s*=\s*$/.test(beforeMatch);

      if (!isHtmlAttribute) {
        violations.push({
          type: 'forbidden-component-type',
          componentType,
          line: getLineNumber(content, match.index),
          confidence: 0.95,
          message: `App should not reference specific component type '${componentType}'. Use generic componentId instead.`,
          suggestion: `Replace with generic interaction: { componentId: element.id }`
        });
      }
    }

    // Check for component type comparisons
    const typeComparisonPattern = new RegExp(`\\.(type|componentType)\\s*===\\s*['"\`]${componentType}['"\`]`, 'gi');
    while ((match = typeComparisonPattern.exec(content)) !== null) {
      violations.push({
        type: 'forbidden-component-comparison',
        componentType,
        line: getLineNumber(content, match.index),
        confidence: 0.98,
        message: `App should not compare component types. Found comparison with '${componentType}'.`,
        suggestion: `Use generic interaction patterns instead of component-specific logic`
      });
    }
  });

  return violations;
}

/**
 * Check for forbidden metadata access patterns
 */
function checkForbiddenMetadataAccess(content, rule, filePath) {
  const violations = [];
  
  // Check for component metadata access
  const metadataPatterns = [
    /component\.metadata\.(type|name|properties)/g,
    /component\.data\.(props|attributes|style)/g,
    /componentData\.(type|name|properties)/g,
    /element\.metadata\.(type|name|properties)/g,
    /dragData\.(type|componentName|metadata)/g
  ];

  metadataPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      violations.push({
        type: 'forbidden-metadata-access',
        pattern: match[0],
        line: getLineNumber(content, match.index),
        confidence: 0.96,
        message: `App should not access component metadata: ${match[0]}. Use generic properties only.`,
        suggestion: `Use componentId, elementId, position, timestamp instead`
      });
    }
  });

  return violations;
}

/**
 * Check for forbidden patterns from configuration
 */
function checkForbiddenPatterns(content, rule, filePath) {
  const violations = [];
  const forbiddenPatterns = rule.forbiddenPatterns || [];

  forbiddenPatterns.forEach(patternStr => {
    try {
      const pattern = new RegExp(patternStr, 'gi');
      let match;
      while ((match = pattern.exec(content)) !== null) {
        violations.push({
          type: 'forbidden-pattern',
          pattern: patternStr,
          match: match[0],
          line: getLineNumber(content, match.index),
          confidence: 0.94,
          message: `Forbidden pattern detected: ${match[0]}. App should remain decoupled from component specifics.`,
          suggestion: `Use generic interaction patterns instead`
        });
      }
    } catch (error) {
      // Skip invalid regex patterns
    }
  });

  return violations;
}

/**
 * Check for proper interaction data usage
 */
function checkInteractionDataUsage(content, rule, filePath) {
  const violations = [];
  
  // Check for conductor.play calls with component-specific plugin names
  const playCallPattern = /conductor\.play\s*\(\s*['"`]([^'"`]+)['"`]/g;
  let match;
  
  while ((match = playCallPattern.exec(content)) !== null) {
    const pluginName = match[1];
    const forbiddenTypes = rule.forbiddenComponentReferences || [];
    
    // Check if plugin name contains forbidden component types
    const containsForbiddenType = forbiddenTypes.some(type => 
      pluginName.toLowerCase().includes(type.toLowerCase())
    );
    
    if (containsForbiddenType) {
      violations.push({
        type: 'component-specific-plugin',
        pluginName,
        line: getLineNumber(content, match.index),
        confidence: 0.90,
        message: `Plugin name '${pluginName}' appears to be component-specific. Use generic interaction plugins instead.`,
        suggestion: `Use plugins like 'library-drag-symphony', 'canvas-interaction-symphony' instead`
      });
    }
  }

  return violations;
}

/**
 * Get line number for a given character index
 */
function getLineNumber(content, index) {
  return content.substring(0, index).split('\n').length;
}
