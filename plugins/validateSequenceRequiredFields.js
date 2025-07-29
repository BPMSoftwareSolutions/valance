import { parseSequenceFromContent } from './sequenceParser.js';

export const operator = "validateSequenceRequiredFields";

export async function evaluate(content, rule, context) {
  try {
    // Parse the sequence object from the content
    const sequence = parseSequenceFromContent(content);
    
    if (!sequence) {
      return {
        passed: false,
        message: "Could not parse sequence object from content"
      };
    }

    const errors = [];

    // Validate required fields
    if (!sequence.name || sequence.name.trim() === '') {
      errors.push("Sequence name is required");
    }

    if (!sequence.description || sequence.description.trim() === '') {
      errors.push("Sequence description is required");
    }

    if (!sequence.key || sequence.key.trim() === '') {
      errors.push("Musical key is required");
    }

    if (!sequence.tempo || sequence.tempo <= 0) {
      errors.push("Tempo must be greater than 0");
    }

    if (!sequence.movements || !Array.isArray(sequence.movements) || sequence.movements.length === 0) {
      errors.push("Sequence must have at least one movement");
    }

    if (errors.length > 0) {
      return {
        passed: false,
        message: `Required fields validation failed: ${errors.join(', ')}`
      };
    }

    return {
      passed: true,
      message: "All required fields are present and valid"
    };

  } catch (error) {
    return {
      passed: false,
      message: `Plugin error: ${error.message}`
    };
  }
}


