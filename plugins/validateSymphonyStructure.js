export const operator = "validateSymphonyStructure";

export async function evaluate(content, rule, context) {
  try {
    // Check for required symphony structure elements (not in comments)
    const hasBeats = /^\s*beats\s*:/m.test(content);
    const hasEventMap = /^\s*eventMap\s*:/m.test(content);

    if (!hasBeats) {
      return {
        passed: false,
        message: "Symphony structure missing 'beats:' property"
      };
    }

    if (!hasEventMap) {
      return {
        passed: false,
        message: "Symphony structure missing 'eventMap:' property"
      };
    }

    // Additional validation based on rule configuration
    if (rule.requiresName) {
      const hasName = /^\s*name\s*:/m.test(content);
      if (!hasName) {
        return {
          passed: false,
          message: "Symphony structure missing 'name:' property"
        };
      }
    }

    if (rule.requiresVersion) {
      const hasVersion = /^\s*version\s*:/m.test(content);
      if (!hasVersion) {
        return {
          passed: false,
          message: "Symphony structure missing 'version:' property"
        };
      }
    }

    return {
      passed: true,
      message: "Symphony structure validation passed"
    };

  } catch (error) {
    return {
      passed: false,
      message: `Plugin error: ${error.message}`
    };
  }
}