/**
 * Utility for parsing sequence objects from JavaScript files
 */

export function parseSequenceFromContent(content) {
  try {
    // Method 1: Try to execute the JavaScript and extract the sequence
    // This is the most reliable method for complex objects
    
    // Create a mock module environment
    const moduleExports = {};
    const mockModule = { exports: moduleExports };
    
    // Replace export statements with assignments to our mock module
    let modifiedContent = content
      .replace(/export\s+const\s+(\w+)\s*=\s*/g, 'moduleExports.$1 = ')
      .replace(/export\s+\{([^}]+)\}/g, (match, exports) => {
        // Handle named exports
        const exportNames = exports.split(',').map(name => name.trim());
        return exportNames.map(name => `moduleExports.${name} = ${name};`).join('\n');
      });
    
    // Execute the modified content in a controlled environment
    const func = new Function('moduleExports', 'module', modifiedContent + '\nreturn moduleExports;');
    const result = func(moduleExports, mockModule);
    
    if (result && result.sequence) {
      return result.sequence;
    }
    
    // Method 2: Try regex extraction for simpler cases
    const sequenceMatch = content.match(/(?:export\s+)?(?:const|let|var)\s+sequence\s*=\s*(\{[\s\S]*?\});?\s*(?:$|\n)/m);
    if (sequenceMatch) {
      // Use eval for the object literal (safer than JSON.parse for JS objects)
      const objectStr = sequenceMatch[1];
      const func2 = new Function('return ' + objectStr);
      return func2();
    }
    
    // Method 3: Try parsing as pure JSON
    return JSON.parse(content);
    
  } catch (error) {
    console.error('Sequence parsing error:', error.message);
    return null;
  }
}

export async function loadConfig() {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const configPath = path.resolve('valence.config.json');
    const configContent = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(configContent);
  } catch (error) {
    // Return default config if file doesn't exist
    return getDefaultConfig();
  }
}

export function getDefaultConfig() {
  return {
    validation: {
      minTempo: 60,
      maxTempo: 200,
      requiredTimeSignature: "4/4",
      maxBeatsPerSequence: 12,
      minDescriptionLength: 20
    },
    musicalKeys: [
      "C Major", "D Major", "E Major", "F Major", "G Major", "A Major", "B Major",
      "C Minor", "D Minor", "E Minor", "F Minor", "G Minor", "A Minor", "B Minor"
    ],
    namingConventions: {
      sequencePattern: "^[A-Z][a-zA-Z\\s]+Symphony No\\. \\d+$",
      eventTypePattern: "^[A-Z_]{4,}$"
    },
    musicalTerms: [
      "tempo", "key", "movement", "beat", "measure", "rhythm", "melody", "harmony"
    ],
    complexity: {
      maxBeatsWarning: 12,
      maxMovementsWarning: 3
    }
  };
}
