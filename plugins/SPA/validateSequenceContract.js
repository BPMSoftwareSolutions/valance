import { parseSequenceFromContent } from './sequenceParser.js';

export const operator = "validateSpaSequenceContract";

export async function evaluate(content, rule, context) {
  try {
    const sequence = parseSequenceFromContent(content);
    
    if (!sequence) {
      return {
        passed: false,
        message: "Could not parse sequence object from content"
      };
    }

    const errors = [];
    const warnings = [];

    // Validate required fields
    if (!sequence.id || typeof sequence.id !== 'string') {
      errors.push("Sequence must have a valid 'id' field");
    } else if (!sequence.id.match(/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/)) {
      errors.push("Sequence 'id' must be in kebab-case format");
    }

    if (!sequence.version || typeof sequence.version !== 'string') {
      errors.push("Sequence must have a valid 'version' field");
    } else if (!sequence.version.match(/^\d+\.\d+\.\d+$/)) {
      errors.push("Sequence 'version' must be valid semver (e.g., '1.0.0')");
    }

    // Validate musical properties
    if (rule.validateMusicalProperties) {
      const musicalErrors = validateMusicalProperties(sequence);
      errors.push(...musicalErrors);
    }

    // Validate movements
    if (rule.validateMovements) {
      const movementValidation = validateMovements(sequence, rule);
      errors.push(...movementValidation.errors);
      warnings.push(...movementValidation.warnings);
    }

    const result = {
      passed: errors.length === 0,
      message: errors.length === 0 
        ? `Sequence '${sequence.id}' contract validation passed`
        : `Sequence contract validation failed: ${errors.join('; ')}`
    };

    if (warnings.length > 0 && rule.verbose) {
      result.warnings = warnings;
    }

    return result;

  } catch (error) {
    return {
      passed: false,
      message: `Sequence contract validation error: ${error.message}`
    };
  }
}

function validateMusicalProperties(sequence) {
  const errors = [];
  
  // Validate tempo
  if (typeof sequence.tempo !== 'number') {
    errors.push("Sequence 'tempo' must be a number");
  } else if (sequence.tempo < 60 || sequence.tempo > 180) {
    errors.push("Sequence 'tempo' must be between 60 and 180 BPM");
  }

  // Validate key
  const validKeys = ["C Major", "D Minor", "E Major", "G Major"];
  if (!sequence.key || typeof sequence.key !== 'string') {
    errors.push("Sequence must have a valid 'key' field");
  } else if (!validKeys.includes(sequence.key)) {
    errors.push(`Sequence 'key' must be one of: ${validKeys.join(', ')}`);
  }

  return errors;
}

function validateMovements(sequence, rule) {
  const errors = [];
  const warnings = [];

  if (!sequence.movements || !Array.isArray(sequence.movements)) {
    errors.push("Sequence must have a 'movements' array");
    return { errors, warnings };
  }

  if (sequence.movements.length === 0) {
    errors.push("Sequence must have at least one movement");
    return { errors, warnings };
  }

  const validMoods = ["anticipation", "focus", "celebration", "calm"];
  const beatRanges = [];

  // Validate each movement
  for (let i = 0; i < sequence.movements.length; i++) {
    const movement = sequence.movements[i];
    const movementId = `Movement ${i + 1}`;

    // Required fields
    if (!movement.label || typeof movement.label !== 'string') {
      errors.push(`${movementId}: 'label' is required and must be a string`);
    } else if (!movement.label.match(/^[A-Z][a-zA-Z]*$/)) {
      errors.push(`${movementId}: 'label' must start with uppercase and contain only letters`);
    }

    if (typeof movement.startBeat !== 'number') {
      errors.push(`${movementId}: 'startBeat' is required and must be a number`);
    }

    if (typeof movement.durationInBeats !== 'number') {
      errors.push(`${movementId}: 'durationInBeats' is required and must be a number`);
    } else if (movement.durationInBeats <= 0) {
      errors.push(`${movementId}: 'durationInBeats' must be greater than 0`);
    }

    // Optional mood validation
    if (movement.mood && rule.enforceMoodEnums) {
      if (!validMoods.includes(movement.mood)) {
        errors.push(`${movementId}: 'mood' must be one of: ${validMoods.join(', ')}`);
      }
    }

    // Collect beat ranges for overlap detection
    if (typeof movement.startBeat === 'number' && typeof movement.durationInBeats === 'number') {
      beatRanges.push({
        label: movement.label,
        start: movement.startBeat,
        end: movement.startBeat + movement.durationInBeats
      });
    }
  }

  // Check for beat overlaps
  if (rule.checkBeatOverlaps && beatRanges.length > 1) {
    for (let i = 0; i < beatRanges.length; i++) {
      for (let j = i + 1; j < beatRanges.length; j++) {
        const range1 = beatRanges[i];
        const range2 = beatRanges[j];
        
        if (range1.start < range2.end && range2.start < range1.end) {
          warnings.push(`Beat overlap detected between '${range1.label}' and '${range2.label}'`);
        }
      }
    }
  }

  return { errors, warnings };
}
