import { parseSequenceFromContent, loadConfig } from './sequenceParser.js';

export const operator = "validateSequenceEventTypes";

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
    const eventTypes = new Set();

    // Collect all event types from all movements
    for (const movement of sequence.movements) {
      if (movement.measures && Array.isArray(movement.measures)) {
        for (const beat of movement.measures) {
          if (beat.event) {
            eventTypes.add(beat.event);
          }
        }
      }
    }

    // Validate each unique event type
    for (const eventType of eventTypes) {
      if (!isValidEventType(eventType, config)) {
        errors.push(`Unknown event type: ${eventType}`);
      }
    }

    if (errors.length > 0) {
      return {
        passed: false,
        message: `Event type validation failed: ${errors.join(', ')}`
      };
    }

    return {
      passed: true,
      message: `All ${eventTypes.size} event types are valid`
    };

  } catch (error) {
    return {
      passed: false,
      message: `Plugin error: ${error.message}`
    };
  }
}

function isValidEventType(eventType, config) {
  // Basic validation: event type should be non-empty, uppercase with underscores, and at least 4 characters
  if (!eventType || eventType.trim() === '') {
    return false;
  }

  // Check pattern from config
  const pattern = new RegExp(config.namingConventions.eventTypePattern);
  return pattern.test(eventType);
}


