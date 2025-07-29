import { parseSequenceFromContent } from './sequenceParser.js';

export const operator = "validateSequenceMovements";

export async function evaluate(content, rule, context) {
  try {
    const sequence = parseSequenceFromContent(content);
    
    if (!sequence) {
      return {
        passed: false,
        message: "Could not parse sequence object from content"
      };
    }

    if (!sequence.movements || !Array.isArray(sequence.movements)) {
      return {
        passed: false,
        message: "Sequence must have movements array"
      };
    }

    const errors = [];

    // Validate each movement
    for (let i = 0; i < sequence.movements.length; i++) {
      const movement = sequence.movements[i];
      
      if (!movement.name || movement.name.trim() === '') {
        errors.push(`Movement ${i + 1} name is required`);
      }

      if (!movement.measures || !Array.isArray(movement.measures) || movement.measures.length === 0) {
        errors.push(`Movement '${movement.name || i + 1}' must have at least one measure`);
      }
    }

    if (errors.length > 0) {
      return {
        passed: false,
        message: `Movement validation failed: ${errors.join(', ')}`
      };
    }

    return {
      passed: true,
      message: `All ${sequence.movements.length} movements are valid`
    };

  } catch (error) {
    return {
      passed: false,
      message: `Plugin error: ${error.message}`
    };
  }
}


