/**
 * Sequence Name Consistency Validation Plugin
 * Validates sequence name consistency across definitions, registrations, and calls
 * Detects naming mismatches that cause "Sequence not found" runtime errors
 * 
 * Addresses critical validation gap where:
 * - sequence-registration-validation shows PASS but sequences fail at runtime
 * - sequence-naming-conventions is too permissive
 * - Direct calls bypass convenience functions
 * - Inconsistent naming patterns across sequences
 */

import { promises as fs } from 'fs';
import path from 'path';
import { glob } from 'glob';

export const operator = "validateSequenceNameConsistency";

export async function evaluate(content, rule, context) {
  const violations = [];
  const verbose = rule.verbose || false;

  if (verbose) {
    console.log(`🎼 Validating sequence name consistency for ${context.filePath}...`);
  }

  try {
    // Get project root from context
    const projectRoot = getProjectRoot(context.filePath);

    // Extract all sequence-related data from the project
    const sequenceData = await extractAllSequenceData(projectRoot, verbose);
    
    // Validate consistency across all sequence operations
    const consistencyViolations = validateSequenceConsistency(sequenceData, verbose);
    violations.push(...consistencyViolations);

    // Validate naming pattern consistency
    const namingViolations = validateNamingPatternConsistency(sequenceData, verbose);
    violations.push(...namingViolations);

    // Validate convenience function usage
    const convenienceViolations = validateConvenienceFunctionUsage(sequenceData, verbose);
    violations.push(...convenienceViolations);

    if (verbose) {
      console.log(`🔍 [DEBUG] Found ${violations.length} sequence name consistency violations`);
    }

  } catch (error) {
    violations.push({
      type: 'ValidationError',
      message: `Sequence name consistency validation failed: ${error.message}`,
      severity: 'error',
      confidence: 1.0,
      impact: 'Unable to validate sequence name consistency'
    });
  }

  if (violations.length > 0) {
    return {
      passed: false,
      violations: violations
    };
  }

  return { passed: true };
}

/**
 * Extract all sequence-related data from the project
 */
async function extractAllSequenceData(projectRoot, verbose) {
  const sequenceData = {
    definitions: [],      // Sequence object definitions
    registrations: [],    // conductor.registerSequence/defineSequence calls
    directCalls: [],      // conductor.startSequence calls
    convenienceFunctions: [], // startCanvasComponentDragFlow etc.
    convenienceCalls: []  // calls to convenience functions
  };

  try {
    const files = await glob('**/*.{ts,tsx,js,jsx}', { 
      cwd: projectRoot,
      ignore: ['node_modules/**', 'dist/**', 'build/**']
    });

    for (const file of files) {
      const filePath = path.join(projectRoot, file);
      const content = await fs.readFile(filePath, 'utf8');
      
      // Extract different types of sequence data
      sequenceData.definitions.push(...extractSequenceDefinitions(content, filePath, verbose));
      sequenceData.registrations.push(...extractSequenceRegistrations(content, filePath, verbose));
      sequenceData.directCalls.push(...extractDirectSequenceCalls(content, filePath, verbose));
      sequenceData.convenienceFunctions.push(...extractConvenienceFunctions(content, filePath, verbose));
      sequenceData.convenienceCalls.push(...extractConvenienceFunctionCalls(content, filePath, verbose));
    }
  } catch (error) {
    if (verbose) {
      console.log(`🔍 [DEBUG] Error extracting sequence data: ${error.message}`);
    }
  }

  if (verbose) {
    console.log(`🔍 [DEBUG] Extracted sequence data:`, {
      definitions: sequenceData.definitions.length,
      registrations: sequenceData.registrations.length,
      directCalls: sequenceData.directCalls.length,
      convenienceFunctions: sequenceData.convenienceFunctions.length,
      convenienceCalls: sequenceData.convenienceCalls.length
    });
  }

  return sequenceData;
}

/**
 * Extract sequence object definitions (e.g., CANVAS_COMPONENT_DRAG_SEQUENCE)
 */
function extractSequenceDefinitions(content, filePath, verbose) {
  const definitions = [];
  const lines = content.split('\n');
  
  // Pattern for sequence definitions
  const definitionPatterns = [
    /export\s+const\s+(\w+_SEQUENCE)\s*:\s*MusicalSequence\s*=\s*{/,
    /const\s+(\w+_SEQUENCE)\s*:\s*MusicalSequence\s*=\s*{/,
    /(\w+_SEQUENCE)\s*:\s*MusicalSequence\s*=\s*{/
  ];

  lines.forEach((line, index) => {
    for (const pattern of definitionPatterns) {
      const match = line.match(pattern);
      if (match) {
        // Extract the sequence name from the object
        const sequenceName = extractSequenceNameFromDefinition(content, index);
        if (sequenceName) {
          definitions.push({
            constantName: match[1],
            sequenceName,
            filePath,
            lineNumber: index + 1,
            context: line.trim()
          });
          
          if (verbose) {
            console.log(`🔍 [DEBUG] Found sequence definition: ${match[1]} -> "${sequenceName}" at ${filePath}:${index + 1}`);
          }
          break;
        }
      }
    }
  });

  return definitions;
}

/**
 * Extract sequence name from definition object
 */
function extractSequenceNameFromDefinition(content, startLine) {
  const lines = content.split('\n');
  
  // Look for name property in the next few lines
  for (let i = startLine; i < Math.min(startLine + 10, lines.length); i++) {
    const nameMatch = lines[i].match(/name:\s*["']([^"']+)["']/);
    if (nameMatch) {
      return nameMatch[1];
    }
  }
  
  return null;
}

/**
 * Extract sequence registrations
 */
function extractSequenceRegistrations(content, filePath, verbose) {
  const registrations = [];
  const lines = content.split('\n');
  
  const registrationPatterns = [
    /conductor\.defineSequence\s*\(\s*['"]([^'"]+)['"]\s*,\s*(\w+)/,
    /conductor\.registerSequence\s*\(\s*(\w+)/
  ];

  lines.forEach((line, index) => {
    for (const pattern of registrationPatterns) {
      const match = line.match(pattern);
      if (match) {
        const sequenceName = match[1];
        const constantName = match[2] || match[1];
        
        registrations.push({
          sequenceName,
          constantName,
          method: line.includes('defineSequence') ? 'defineSequence' : 'registerSequence',
          filePath,
          lineNumber: index + 1,
          context: line.trim()
        });
        
        if (verbose) {
          console.log(`🔍 [DEBUG] Found sequence registration: "${sequenceName}" (${constantName}) at ${filePath}:${index + 1}`);
        }
        break;
      }
    }
  });

  return registrations;
}

/**
 * Extract direct sequence calls
 */
function extractDirectSequenceCalls(content, filePath, verbose) {
  const calls = [];
  const lines = content.split('\n');
  
  const callPatterns = [
    /conductor\.startSequence\s*\(\s*['"]([^'"]+)['"]/,
    /communicationSystem\.conductor\.startSequence\s*\(\s*['"]([^'"]+)['"]/,
    /conductorEventBus\.startSequence\s*\(\s*['"]([^'"]+)['"]/
  ];

  lines.forEach((line, index) => {
    for (const pattern of callPatterns) {
      const match = line.match(pattern);
      if (match) {
        calls.push({
          sequenceName: match[1],
          filePath,
          lineNumber: index + 1,
          context: line.trim()
        });
        
        if (verbose) {
          console.log(`🔍 [DEBUG] Found direct sequence call: "${match[1]}" at ${filePath}:${index + 1}`);
        }
        break;
      }
    }
  });

  return calls;
}

/**
 * Extract convenience function definitions
 */
function extractConvenienceFunctions(content, filePath, verbose) {
  const functions = [];
  const lines = content.split('\n');
  
  const functionPatterns = [
    /export\s+const\s+(start\w+Flow)\s*=\s*\(/,
    /export\s+function\s+(start\w+Flow)\s*\(/,
    /const\s+(start\w+Flow)\s*=\s*\(/
  ];

  lines.forEach((line, index) => {
    for (const pattern of functionPatterns) {
      const match = line.match(pattern);
      if (match) {
        // Extract the sequence name called within this function
        const calledSequence = extractSequenceCallFromFunction(content, index);
        
        functions.push({
          functionName: match[1],
          calledSequence,
          filePath,
          lineNumber: index + 1,
          context: line.trim()
        });
        
        if (verbose) {
          console.log(`🔍 [DEBUG] Found convenience function: ${match[1]} -> "${calledSequence}" at ${filePath}:${index + 1}`);
        }
        break;
      }
    }
  });

  return functions;
}

/**
 * Extract sequence call from within a convenience function
 */
function extractSequenceCallFromFunction(content, startLine) {
  const lines = content.split('\n');
  
  // Look for startSequence call in the next 20 lines
  for (let i = startLine; i < Math.min(startLine + 20, lines.length); i++) {
    const callMatch = lines[i].match(/startSequence\s*\(\s*['"]([^'"]+)['"]/);
    if (callMatch) {
      return callMatch[1];
    }
  }
  
  return null;
}

/**
 * Extract convenience function calls
 */
function extractConvenienceFunctionCalls(content, filePath, verbose) {
  const calls = [];
  const lines = content.split('\n');
  
  const callPattern = /(start\w+Flow)\s*\(/;

  lines.forEach((line, index) => {
    const match = line.match(callPattern);
    if (match) {
      calls.push({
        functionName: match[1],
        filePath,
        lineNumber: index + 1,
        context: line.trim()
      });
      
      if (verbose) {
        console.log(`🔍 [DEBUG] Found convenience function call: ${match[1]} at ${filePath}:${index + 1}`);
      }
    }
  });

  return calls;
}

/**
 * Validate sequence consistency across definitions, registrations, and calls
 */
function validateSequenceConsistency(sequenceData, verbose) {
  const violations = [];

  // Create maps for quick lookup
  const definitionMap = new Map();
  sequenceData.definitions.forEach(def => {
    definitionMap.set(def.sequenceName, def);
  });

  const registrationMap = new Map();
  sequenceData.registrations.forEach(reg => {
    registrationMap.set(reg.sequenceName, reg);
  });

  // Check direct calls against definitions and registrations
  for (const call of sequenceData.directCalls) {
    const definition = definitionMap.get(call.sequenceName);
    const registration = registrationMap.get(call.sequenceName);

    if (!definition && !registration) {
      violations.push({
        type: 'SequenceNotFound',
        sequenceName: call.sequenceName,
        lineNumber: call.lineNumber,
        message: `Direct call to sequence '${call.sequenceName}' but sequence not found in definitions or registrations`,
        severity: 'error',
        confidence: 0.9,
        impact: 'Runtime error: Sequence not found when called',
        details: {
          sequenceName: call.sequenceName,
          callLocation: call.filePath,
          callLineNumber: call.lineNumber,
          callContext: call.context,
          suggestedFix: `Ensure sequence '${call.sequenceName}' is properly defined and registered`,
          availableSequences: Array.from(definitionMap.keys()).slice(0, 5)
        }
      });
    } else if (definition && !registration) {
      violations.push({
        type: 'SequenceDefinedButNotRegistered',
        sequenceName: call.sequenceName,
        lineNumber: call.lineNumber,
        message: `Sequence '${call.sequenceName}' is defined but not registered`,
        severity: 'warning',
        confidence: 0.8,
        impact: 'Potential runtime error if sequence is not registered at runtime',
        details: {
          sequenceName: call.sequenceName,
          definitionLocation: definition.filePath,
          callLocation: call.filePath,
          suggestedFix: `Add conductor.registerSequence(${definition.constantName}) to register the sequence`
        }
      });
    }
  }

  if (verbose) {
    console.log(`🔍 [DEBUG] Sequence consistency validation found ${violations.length} violations`);
  }

  return violations;
}

/**
 * Validate naming pattern consistency across sequences
 */
function validateNamingPatternConsistency(sequenceData, verbose) {
  const violations = [];

  // Analyze naming patterns
  const namingPatterns = {
    kebabCase: [],      // canvas-component-drag-symphony
    formalName: [],     // Canvas Component Drag Symphony No. 4
    mixed: []           // Inconsistent patterns
  };

  // Categorize sequence names by pattern
  sequenceData.definitions.forEach(def => {
    if (def.sequenceName.includes('-') && def.sequenceName === def.sequenceName.toLowerCase()) {
      namingPatterns.kebabCase.push(def);
    } else if (def.sequenceName.includes(' ') && /^[A-Z]/.test(def.sequenceName)) {
      namingPatterns.formalName.push(def);
    } else {
      namingPatterns.mixed.push(def);
    }
  });

  // Check for inconsistent patterns
  if (namingPatterns.kebabCase.length > 0 && namingPatterns.formalName.length > 0) {
    violations.push({
      type: 'InconsistentNamingPattern',
      message: `Inconsistent sequence naming patterns detected: ${namingPatterns.kebabCase.length} kebab-case vs ${namingPatterns.formalName.length} formal names`,
      severity: 'warning',
      confidence: 0.9,
      impact: 'Code maintenance difficulty and potential confusion',
      details: {
        kebabCaseExamples: namingPatterns.kebabCase.slice(0, 3).map(s => s.sequenceName),
        formalNameExamples: namingPatterns.formalName.slice(0, 3).map(s => s.sequenceName),
        suggestedFix: 'Standardize on one naming pattern across all sequences',
        recommendation: 'Use kebab-case for consistency with function names'
      }
    });
  }

  if (verbose) {
    console.log(`🔍 [DEBUG] Naming pattern analysis:`, {
      kebabCase: namingPatterns.kebabCase.length,
      formalName: namingPatterns.formalName.length,
      mixed: namingPatterns.mixed.length
    });
  }

  return violations;
}

/**
 * Validate convenience function usage
 */
function validateConvenienceFunctionUsage(sequenceData, verbose) {
  const violations = [];

  // Create map of convenience functions
  const convenienceFunctionMap = new Map();
  sequenceData.convenienceFunctions.forEach(func => {
    if (func.calledSequence) {
      convenienceFunctionMap.set(func.calledSequence, func);
    }
  });

  // Check direct calls that could use convenience functions
  for (const call of sequenceData.directCalls) {
    const convenienceFunction = convenienceFunctionMap.get(call.sequenceName);

    if (convenienceFunction) {
      violations.push({
        type: 'DirectCallBypassesConvenienceFunction',
        sequenceName: call.sequenceName,
        lineNumber: call.lineNumber,
        message: `Direct call to '${call.sequenceName}' bypasses convenience function '${convenienceFunction.functionName}'`,
        severity: 'info',
        confidence: 0.7,
        impact: 'Code consistency and maintainability',
        details: {
          sequenceName: call.sequenceName,
          callLocation: call.filePath,
          convenienceFunction: convenienceFunction.functionName,
          convenienceFunctionLocation: convenienceFunction.filePath,
          suggestedFix: `Use ${convenienceFunction.functionName}() instead of direct conductor.startSequence() call`,
          benefits: 'Better abstraction, easier testing, consistent API usage'
        }
      });
    }
  }

  if (verbose) {
    console.log(`🔍 [DEBUG] Convenience function validation found ${violations.length} violations`);
  }

  return violations;
}

/**
 * Get project root directory
 */
function getProjectRoot(filePath) {
  const parts = filePath.split(path.sep);
  const workspaceIndex = parts.findIndex(part => part === 'workspace');
  if (workspaceIndex !== -1) {
    return parts.slice(0, workspaceIndex + 1).join(path.sep);
  }
  return path.dirname(filePath);
}
