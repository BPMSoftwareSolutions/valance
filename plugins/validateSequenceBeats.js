import { parseSequenceFromContent, loadConfig } from './sequenceParser.js';

export const operator = "validateSequenceBeats";

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

    if (!sequence.movements || !Array.isArray(sequence.movements)) {
      return {
        passed: false,
        message: "Sequence must have movements array"
      };
    }

    const errors = [];
    const warnings = [];

    // Validate beats in each movement
    for (const movement of sequence.movements) {
      if (!movement.measures || !Array.isArray(movement.measures)) {
        continue;
      }

      const beats = movement.measures;
      
      // Check sequential beat numbering
      const sortedBeats = beats.slice().sort((a, b) => (a.beat || 0) - (b.beat || 0));
      let expectedBeat = 1;
      
      for (const beat of sortedBeats) {
        if (beat.beat !== expectedBeat) {
          errors.push(`Beat numbering gap in movement '${movement.name}': expected beat ${expectedBeat}, found beat ${beat.beat}`);
        }
        expectedBeat++;
      }

      // Validate beat properties
      for (const beat of beats) {
        if (!beat.event || beat.event.trim() === '') {
          errors.push(`Beat ${beat.beat} in movement '${movement.name}' is missing event type`);
        }

        if (!beat.title || beat.title.trim() === '') {
          errors.push(`Beat ${beat.beat} in movement '${movement.name}' is missing title`);
        }

        if (!beat.description || beat.description.trim() === '') {
          warnings.push(`Beat ${beat.beat} in movement '${movement.name}' is missing description`);
        }

        // Validate dependencies
        if (beat.dependencies && Array.isArray(beat.dependencies)) {
          for (const dependency of beat.dependencies) {
            if (!beats.some(b => b.beat === dependency)) {
              errors.push(`Beat ${beat.beat} in movement '${movement.name}' has invalid dependency: beat ${dependency} does not exist`);
            }
          }
        }
      }

      // Check for too many beats
      if (beats.length > config.validation.maxBeatsPerSequence) {
        warnings.push(`Movement '${movement.name}' has ${beats.length} beats, consider breaking into multiple sequences (max recommended: ${config.validation.maxBeatsPerSequence})`);
      }
    }

    // Combine errors and warnings
    const issues = [...errors];
    if (rule.includeWarnings) {
      issues.push(...warnings);
    }

    if (errors.length > 0) {
      return {
        passed: false,
        message: `Beat validation failed: ${issues.join(', ')}`
      };
    }

    return {
      passed: true,
      message: warnings.length > 0 ? `Warnings: ${warnings.join(', ')}` : "All beats are valid"
    };

  } catch (error) {
    return {
      passed: false,
      message: `Plugin error: ${error.message}`
    };
  }
}


