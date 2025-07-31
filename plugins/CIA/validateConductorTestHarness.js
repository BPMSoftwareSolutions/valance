export const operator = "validateCiaConductorTestHarness";

export async function evaluate(content, rule, context) {
  try {
    const filePath = context.filePath;
    
    // Check if this is a test file for conductor or plugin loader
    if (!filePath.includes('.test.') && !filePath.includes('.spec.')) {
      return {
        passed: true,
        message: "Not a test file, skipping validation"
      };
    }

    if (!filePath.includes('conductor') && !filePath.includes('pluginLoader')) {
      return {
        passed: true,
        message: "Not a conductor or plugin loader test file, skipping validation"
      };
    }

    const errors = [];
    const warnings = [];

    // Check mount tests
    if (rule.checkMountTests) {
      const mountTestValidation = validateMountTests(content);
      if (!mountTestValidation.passed) {
        errors.push(mountTestValidation.message);
      }
      if (mountTestValidation.warnings) {
        warnings.push(...mountTestValidation.warnings);
      }
    }

    // Check plugin loader tests
    if (rule.checkPluginLoaderTests) {
      const loaderTestValidation = validatePluginLoaderTests(content);
      if (!loaderTestValidation.passed) {
        errors.push(loaderTestValidation.message);
      }
      if (loaderTestValidation.warnings) {
        warnings.push(...loaderTestValidation.warnings);
      }
    }

    // Check handler validation tests
    if (rule.checkHandlerValidationTests) {
      const handlerTestValidation = validateHandlerValidationTests(content);
      if (!handlerTestValidation.passed) {
        errors.push(handlerTestValidation.message);
      }
    }

    // Check error scenario tests
    if (rule.checkErrorScenarioTests) {
      const errorTestValidation = validateErrorScenarioTests(content);
      if (!errorTestValidation.passed) {
        warnings.push(errorTestValidation.message);
      }
    }

    // Validate test coverage
    if (rule.validateTestCoverage) {
      const coverageValidation = validateTestCoverage(content);
      if (coverageValidation.warnings) {
        warnings.push(...coverageValidation.warnings);
      }
    }

    const result = {
      passed: errors.length === 0,
      message: errors.length === 0 
        ? "Conductor test harness validation passed"
        : `Conductor test harness validation failed: ${errors.join('; ')}`
    };

    if (warnings.length > 0 && rule.verbose) {
      result.warnings = warnings;
    }

    return result;

  } catch (error) {
    return {
      passed: false,
      message: `Conductor test harness validation error: ${error.message}`
    };
  }
}

function validateMountTests(content) {
  const errors = [];
  const warnings = [];

  const requiredMountTests = [
    /should.*reject.*malformed.*plugin/i,
    /should.*validate.*sequence.*before.*mounting/i,
    /should.*validate.*handlers.*before.*mounting/i,
    /should.*handle.*missing.*sequence/i,
    /should.*handle.*invalid.*handlers/i
  ];

  const missingTests = requiredMountTests.filter(pattern => !pattern.test(content));
  
  if (missingTests.length > 0) {
    warnings.push(`Missing mount tests: ${missingTests.length} of ${requiredMountTests.length} required tests`);
  }

  // Check for basic test structure
  if (!content.includes('mount') && !content.includes('registerSequence')) {
    errors.push("No mount-related tests found");
  }

  return {
    passed: errors.length === 0,
    message: errors.length === 0 ? "Mount tests validation passed" : errors.join(', '),
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

function validatePluginLoaderTests(content) {
  const errors = [];
  const warnings = [];

  const requiredLoaderTests = [
    /should.*log.*error.*plugin.*fail.*load/i,
    /should.*handle.*missing.*plugin/i,
    /should.*catch.*dynamic.*import.*error/i,
    /should.*continue.*loading.*other.*plugins/i,
    /should.*validate.*plugin.*structure/i
  ];

  const missingTests = requiredLoaderTests.filter(pattern => !pattern.test(content));
  
  if (missingTests.length > 0) {
    warnings.push(`Missing plugin loader tests: ${missingTests.length} of ${requiredLoaderTests.length} required tests`);
  }

  // Check for basic loader test structure
  if (content.includes('pluginLoader') && !content.includes('load')) {
    errors.push("Plugin loader tests found but no load-related tests");
  }

  return {
    passed: errors.length === 0,
    message: errors.length === 0 ? "Plugin loader tests validation passed" : errors.join(', '),
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

function validateHandlerValidationTests(content) {
  const requiredHandlerTests = [
    /should.*validate.*handlers.*before.*invocation/i,
    /should.*check.*movement.*handler.*mapping/i,
    /should.*handle.*missing.*handlers/i,
    /should.*log.*warning.*undefined.*handler/i,
    /should.*not.*execute.*invalid.*handler/i
  ];

  const missingTests = requiredHandlerTests.filter(pattern => !pattern.test(content));
  
  if (missingTests.length > 0) {
    return {
      passed: false,
      message: `Missing handler validation tests: ${missingTests.length} of ${requiredHandlerTests.length} required tests`
    };
  }

  return { passed: true };
}

function validateErrorScenarioTests(content) {
  const errorScenarios = [
    /malformed.*sequence/i,
    /missing.*handlers.*object/i,
    /invalid.*handler.*function/i,
    /plugin.*load.*failure/i,
    /runtime.*execution.*error/i
  ];

  const missingScenarios = errorScenarios.filter(pattern => !pattern.test(content));
  
  if (missingScenarios.length > 0) {
    return {
      passed: false,
      message: `Missing error scenario tests: ${missingScenarios.length} of ${errorScenarios.length} scenarios`
    };
  }

  return { passed: true };
}

function validateTestCoverage(content) {
  const warnings = [];

  // Check for test structure patterns
  const testStructurePatterns = [
    /describe\s*\(/,
    /it\s*\(/,
    /expect\s*\(/
  ];

  const missingStructure = testStructurePatterns.filter(pattern => !pattern.test(content));
  
  if (missingStructure.length > 0) {
    warnings.push("Missing basic test structure (describe/it/expect)");
  }

  // Check for mocking patterns
  const mockPatterns = [
    /jest\.mock/,
    /sinon\.stub/,
    /mockImplementation/,
    /spy/
  ];

  const hasMocking = mockPatterns.some(pattern => pattern.test(content));
  
  if (!hasMocking) {
    warnings.push("No mocking patterns found - consider mocking external dependencies");
  }

  // Check for assertion patterns
  const assertionPatterns = [
    /toThrow/,
    /toHaveBeenCalledWith/,
    /toBe\(false\)/,
    /toBeNull/
  ];

  const hasAssertions = assertionPatterns.some(pattern => pattern.test(content));
  
  if (!hasAssertions) {
    warnings.push("Limited assertion patterns found - consider more comprehensive assertions");
  }

  return {
    warnings: warnings.length > 0 ? warnings : undefined
  };
}
