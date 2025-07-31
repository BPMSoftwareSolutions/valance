export const operator = "validateSpaTestCoverage";

export async function evaluate(content, rule, context) {
  try {
    // For content validation, we get individual file content
    const filePath = context.filePath;

    // Only validate test files
    if (!filePath.includes('.test.') && !filePath.includes('.spec.')) {
      return {
        passed: true,
        message: "Not a test file, skipping validation"
      };
    }

    const errors = [];
    const warnings = [];

    // Validate test file structure
    const testValidation = validateTestFileStructure(content, filePath, rule);

    if (!testValidation.passed) {
      errors.push(testValidation.message);
    }

    if (testValidation.warnings) {
      warnings.push(...testValidation.warnings);
    }

    const result = {
      passed: errors.length === 0,
      message: errors.length === 0
        ? "Test coverage validation passed"
        : `Test coverage validation failed: ${errors.join('; ')}`
    };

    if (warnings.length > 0 && rule.verbose) {
      result.warnings = warnings;
    }

    return result;

  } catch (error) {
    return {
      passed: false,
      message: `Test coverage validation error: ${error.message}`
    };
  }
}

function validateTestFileStructure(content, filePath, rule) {
  const errors = [];
  const warnings = [];

  const fileName = filePath.split('/').pop();

  // Check test naming conventions
  if (rule.enforceNamingConventions) {
    if (!fileName.match(/.*\.(test|spec)\.(ts|js)$/)) {
      errors.push(`Test file '${fileName}' doesn't follow naming convention (*.test.ts or *.spec.ts)`);
    }
  }

  // Validate test structure
  if (rule.validateTestStructure) {
    const hasDescribe = content.includes('describe(');
    const hasIt = content.includes('it(') || content.includes('test(');
    const hasExpect = content.includes('expect(');

    if (!hasDescribe) {
      warnings.push("Test file should use 'describe()' blocks for organization");
    }

    if (!hasIt) {
      warnings.push("Test file should use 'it()' or 'test()' blocks for individual tests");
    }

    if (!hasExpect) {
      warnings.push("Test file should use 'expect()' assertions");
    }
  }

  return {
    passed: errors.length === 0,
    message: errors.length === 0 ? "Test file structure valid" : errors.join(', '),
    warnings: warnings.length > 0 ? warnings : undefined
  };
}
