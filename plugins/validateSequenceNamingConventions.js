import { parseSequenceFromContent, loadConfig } from './sequenceParser.js';

export const operator = "validateSequenceNamingConventions";

export async function evaluate(content, rule, context) {
  try {
    const config = await loadConfig();
    const sequence = parseSequenceFromContent(content);
    
    if (!sequence) {
      return {
        passed: false,
        message: "Could not parse sequence object from content"
      };
    }

    const errors = [];
    const warnings = [];

    // Validate sequence name pattern
    if (sequence.name) {
      const sequencePattern = new RegExp(config.namingConventions.sequencePattern);
      if (!sequencePattern.test(sequence.name)) {
        errors.push(`Sequence name '${sequence.name}' does not match required pattern`);
      }

      // Validate symphony numbering
      if (!sequence.name.includes("Symphony No.")) {
        warnings.push("Sequence name should include symphony number (e.g., 'Symphony No. 1')");
      }
    }

    // Combine errors and warnings based on rule configuration
    const issues = [...errors];
    if (rule.includeWarnings) {
      issues.push(...warnings);
    }

    if (errors.length > 0) {
      return {
        passed: false,
        message: `Naming convention validation failed: ${issues.join(', ')}`
      };
    }

    return {
      passed: true,
      message: warnings.length > 0 ? `Warnings: ${warnings.join(', ')}` : "Naming conventions are valid"
    };

  } catch (error) {
    return {
      passed: false,
      message: `Plugin error: ${error.message}`
    };
  }
}


