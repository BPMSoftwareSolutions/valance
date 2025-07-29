import { parseSequenceFromContent, loadConfig } from './sequenceParser.js';

export const operator = "validateSequenceComplexity";

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

    if (sequence.movements && Array.isArray(sequence.movements)) {
      // Calculate total beats across all movements
      const totalBeats = sequence.movements.reduce((total, movement) => {
        if (movement.measures && Array.isArray(movement.measures)) {
          return total + movement.measures.length;
        }
        return total;
      }, 0);

      // Check beat complexity
      if (totalBeats > config.complexity.maxBeatsWarning) {
        warnings.push(`Complex sequence with ${totalBeats} beats - consider breaking into multiple sequences`);
      }

      // Check movement complexity
      if (sequence.movements.length > config.complexity.maxMovementsWarning) {
        warnings.push(`Sequence has ${sequence.movements.length} movements - consider simplifying`);
      }
    }

    // In strict mode, warnings become errors
    if (warnings.length > 0 && rule.strictMode) {
      return {
        passed: false,
        message: `Complexity validation failed: ${warnings.join(', ')}`
      };
    }

    return {
      passed: true,
      message: warnings.length > 0 ? `Warnings: ${warnings.join(', ')}` : "Sequence complexity is acceptable"
    };

  } catch (error) {
    return {
      passed: false,
      message: `Plugin error: ${error.message}`
    };
  }
}


