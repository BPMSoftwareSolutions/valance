import { parseSequenceFromContent, loadConfig } from './sequenceParser.js';

export const operator = "validateSequenceDocumentation";

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

    const warnings = [];

    // Validate description length
    if (sequence.description) {
      if (sequence.description.length < config.validation.minDescriptionLength) {
        warnings.push(`Sequence description should be more detailed (minimum ${config.validation.minDescriptionLength} characters)`);
      }

      // Check for musical terminology
      const hasMusicalTerms = config.musicalTerms.some(term => 
        sequence.description.toLowerCase().includes(term.toLowerCase())
      );
      
      if (!hasMusicalTerms) {
        warnings.push("Sequence description should include musical terminology");
      }
    }

    // In strict mode, warnings become errors
    if (warnings.length > 0 && rule.strictMode) {
      return {
        passed: false,
        message: `Documentation validation failed: ${warnings.join(', ')}`
      };
    }

    return {
      passed: true,
      message: warnings.length > 0 ? `Warnings: ${warnings.join(', ')}` : "Documentation is adequate"
    };

  } catch (error) {
    return {
      passed: false,
      message: `Plugin error: ${error.message}`
    };
  }
}


