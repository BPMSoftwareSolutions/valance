export const operator = "validateCiaPluginFixed";

export async function evaluate(content, rule, context) {
  try {
    const filePath = context.filePath;
    console.log(`🔥 CIA FIXED: Evaluating ${filePath}`);
    console.log(`🔥 CIA FIXED: Content length: ${content.length}`);

    // Check if this is a conductor file
    if (!filePath.toLowerCase().includes('conductor')) {
      console.log(`🔥 CIA FIXED: Not a conductor file, skipping`);
      return {
        passed: true,
        message: "Not a conductor file, skipping CIA validation"
      };
    }

    console.log(`🔥 CIA FIXED: This IS a conductor file, proceeding with validation`);

    const errors = [];

    // STRICT CIA VALIDATION: Fail by default, pass only if CIA-compliant

    // 1. Check for CIA-compliant mount function (NOT registerSequence)
    const hasMountFunction = /mount\s*\(/.test(content);
    const hasLoadPluginFunction = /loadPlugin\s*\(/.test(content);
    const hasRegisterSequence = /registerSequence\s*\(/.test(content);

    // STRICT: Must have mount() or loadPlugin(), registerSequence() alone is NOT CIA-compliant
    if (!hasMountFunction && !hasLoadPluginFunction) {
      if (hasRegisterSequence) {
        errors.push("FAIL: Found registerSequence() but no CIA-compliant mount() function. registerSequence() does not validate plugin shape before mounting.");
      } else {
        errors.push("FAIL: No CIA-compliant mount() or loadPlugin() function found. Conductor cannot safely mount SPA plugins.");
      }
    }

    // 2. If mount function exists, validate it has proper checks
    if (hasMountFunction || hasLoadPluginFunction) {
      // Check sequence validation within mount function
      const sequenceValidationPatterns = [
        /if\s*\(\s*!\s*sequence\s*\)/,
        /if\s*\(\s*!\s*sequence\.movements\s*\)/,
        /Array\.isArray\s*\(\s*sequence\.movements\s*\)/
      ];

      const hasSequenceValidation = sequenceValidationPatterns.some(pattern => pattern.test(content));
      
      if (!hasSequenceValidation) {
        errors.push("FAIL: Mount function missing sequence validation. Must check if sequence exists and has movements array.");
      }

      // Check handlers validation within mount function
      const handlersValidationPatterns = [
        /if\s*\(\s*!\s*handlers\s*\)/,
        /typeof\s+handlers\s*===\s*['"]object['"]/,
        /handlers\s*&&\s*typeof\s+handlers/
      ];

      const hasHandlersValidation = handlersValidationPatterns.some(pattern => pattern.test(content));
      
      if (!hasHandlersValidation) {
        errors.push("FAIL: Mount function missing handlers validation. Must check if handlers is an object.");
      }

      // Check error handling in mount function
      const errorHandlingPatterns = [
        /return\s+false/,
        /return\s+null/,
        /return\s*\{[^}]*success\s*:\s*false/,
        /console\.(error|warn)/
      ];

      const hasErrorHandling = errorHandlingPatterns.some(pattern => pattern.test(content));
      
      if (!hasErrorHandling) {
        errors.push("FAIL: Mount function missing error handling. Must return false or log errors on validation failure.");
      }
    }

    return {
      passed: errors.length === 0,
      message: errors.length === 0 
        ? "CIA plugin interface validation passed - conductor is CIA-compliant"
        : `CIA validation failed: ${errors.join(' ')}`
    };

  } catch (error) {
    return {
      passed: false,
      message: `CIA validation error: ${error.message}`
    };
  }
}
