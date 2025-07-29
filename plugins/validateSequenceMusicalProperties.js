import { parseSequenceFromContent, loadConfig } from './sequenceParser.js';

export const operator = "validateSequenceMusicalProperties";

export async function evaluate(content, rule, context) {
  try {
    // Load configuration
    const config = await loadConfig();
    const sequence = parseSequenceFromContent(content);
    
    if (!sequence) {
      return {
        passed: false,
        message: "Could not parse sequence object from content"
      };
    }

    const warnings = [];

    // Validate key signature
    if (sequence.key && !config.musicalKeys.includes(sequence.key)) {
      warnings.push(`Unusual key signature: ${sequence.key}`);
    }

    // Validate tempo range
    if (sequence.tempo) {
      if (sequence.tempo < config.validation.minTempo || sequence.tempo > config.validation.maxTempo) {
        warnings.push(`Tempo ${sequence.tempo} BPM is outside recommended range (${config.validation.minTempo}-${config.validation.maxTempo})`);
      }
    }

    // Validate time signature
    if (sequence.timeSignature && sequence.timeSignature !== config.validation.requiredTimeSignature) {
      warnings.push(`Non-standard time signature: ${sequence.timeSignature}`);
    }

    // For this plugin, warnings don't fail the validation unless strict mode is enabled
    if (warnings.length > 0 && rule.strictMode) {
      return {
        passed: false,
        message: `Musical properties validation failed: ${warnings.join(', ')}`
      };
    }

    return {
      passed: true,
      message: warnings.length > 0 ? `Warnings: ${warnings.join(', ')}` : "Musical properties are valid"
    };

  } catch (error) {
    return {
      passed: false,
      message: `Plugin error: ${error.message}`
    };
  }
}


