/**
 * Sequence Registration Validation Plugin
 * Migrated from C# SequenceRegistrationValidator.cs
 * Validates that musical sequences are properly registered before being called
 * Detects runtime errors like "Sequence 'canvas-component-drag-symphony' not found"
 */

import { promises as fs } from 'fs';
import path from 'path';
import { glob } from 'glob';

export const operator = "validateSequenceRegistration";

export async function evaluate(content, rule, context) {
  const violations = [];
  const verbose = rule.verbose || false;

  if (verbose) {
    console.log(`🎼 Validating sequence registrations for ${context.filePath}...`);
  }

  try {
    // Get project root from context
    const projectRoot = getProjectRoot(context.filePath);

    // Find sequence calls in current file and registrations in project
    const sequenceCalls = extractSequenceCallsFromContent(content, context.filePath, verbose);
    const sequenceRegistrations = await findSequenceRegistrations(projectRoot, verbose);
    const sequenceNameMap = buildSequenceNameMap(sequenceRegistrations, verbose);

    if (verbose) {
      console.log(`🔍 [DEBUG] Found ${sequenceCalls.length} sequence calls`);
      console.log(`🔍 [DEBUG] Found ${sequenceRegistrations.length} sequence registrations`);
    }

    // Cross-reference calls with registrations
    for (const call of sequenceCalls) {
      const actualSequenceName = resolveActualSequenceName(call.sequenceName, sequenceNameMap);
      
      // Look for exact sequence name matches
      const exactRegistration = sequenceRegistrations.find(r => 
        r.sequenceName === actualSequenceName
      );

      // Check for bulk registration coverage
      const bulkRegistration = sequenceRegistrations.find(r =>
        (r.registrationType.includes('Bulk') || r.registrationType.includes('Initialization')) &&
        isSequenceCoveredByBulkRegistration(call.sequenceName, actualSequenceName, sequenceNameMap)
      );

      const registration = exactRegistration || bulkRegistration;

      if (!registration) {
        const confidence = calculateRegistrationConfidence(call, sequenceRegistrations, sequenceNameMap);
        
        violations.push({
          type: 'MissingRegistration',
          sequenceName: call.sequenceName,
          lineNumber: call.lineNumber,
          message: `Sequence '${call.sequenceName}' is called but not registered`,
          severity: 'error',
          confidence,
          impact: 'Runtime error: Sequence not found when called',
          details: {
            sequenceName: call.sequenceName,
            callLocation: call.filePath,
            callLineNumber: call.lineNumber,
            suggestedFix: getRegistrationSuggestion(call.sequenceName, projectRoot),
            registrationAnalysis: analyzeRegistrationOptions(call.sequenceName, sequenceRegistrations)
          }
        });
      } else if (!registration.registrationType.includes('Bulk') && 
                 !registration.registrationType.includes('Initialization')) {
        // Check registration timing for non-bulk registrations
        const timingIssue = validateRegistrationTiming(call, registration, verbose);
        if (timingIssue) {
          violations.push({
            type: 'RegistrationTimingIssue',
            sequenceName: call.sequenceName,
            lineNumber: call.lineNumber,
            message: timingIssue.message,
            severity: 'warning',
            confidence: 0.8,
            impact: 'Potential runtime error if registration happens after call',
            details: {
              sequenceName: call.sequenceName,
              callLocation: call.filePath,
              registrationLocation: registration.filePath,
              suggestedFix: timingIssue.suggestedFix,
              timingAnalysis: timingIssue.analysis
            }
          });
        }
      }
    }

  } catch (error) {
    violations.push({
      type: 'ValidationError',
      message: `Sequence registration validation failed: ${error.message}`,
      severity: 'error',
      confidence: 1.0,
      impact: 'Unable to validate sequence registrations'
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
 * Find all sequence calls in the project
 */
async function findSequenceCalls(projectRoot, verbose) {
  const calls = [];
  
  try {
    const files = await glob('**/*.{ts,tsx,js,jsx}', { 
      cwd: projectRoot,
      ignore: ['node_modules/**', 'dist/**', 'build/**']
    });

    for (const file of files) {
      const filePath = path.join(projectRoot, file);
      const content = await fs.readFile(filePath, 'utf8');
      const fileCalls = extractSequenceCallsFromContent(content, filePath, verbose);
      calls.push(...fileCalls);
    }
  } catch (error) {
    if (verbose) {
      console.log(`🔍 [DEBUG] Error finding sequence calls: ${error.message}`);
    }
  }

  return calls;
}

/**
 * Find all sequence registrations in the project
 */
async function findSequenceRegistrations(projectRoot, verbose) {
  const registrations = [];
  
  try {
    const files = await glob('**/*.{ts,tsx,js,jsx}', { 
      cwd: projectRoot,
      ignore: ['node_modules/**', 'dist/**', 'build/**']
    });

    for (const file of files) {
      const filePath = path.join(projectRoot, file);
      const content = await fs.readFile(filePath, 'utf8');
      const fileRegistrations = extractSequenceRegistrationsFromContent(content, filePath, verbose);
      registrations.push(...fileRegistrations);
    }
  } catch (error) {
    if (verbose) {
      console.log(`🔍 [DEBUG] Error finding sequence registrations: ${error.message}`);
    }
  }

  return registrations;
}

/**
 * Extract sequence calls from file content
 */
function extractSequenceCallsFromContent(content, filePath, verbose) {
  const calls = [];
  const lines = content.split('\n');
  
  // Patterns for sequence calls
  const callPatterns = [
    /conductor\.startSequence\s*\(\s*['"]([^'"]+)['"]/g,
    /communicationSystem\.conductor\.startSequence\s*\(\s*['"]([^'"]+)['"]/g,
    /startSequence\s*\(\s*['"]([^'"]+)['"]/g,
    /startCanvasLibraryDropFlow\s*\(/g,
    /startCanvas\w+Flow\s*\(/g
  ];

  lines.forEach((line, index) => {
    for (const pattern of callPatterns) {
      let match;
      while ((match = pattern.exec(line)) !== null) {
        const sequenceName = match[1] || extractSequenceNameFromSpecialCall(line);
        if (sequenceName) {
          calls.push({
            sequenceName,
            filePath,
            lineNumber: index + 1,
            context: line.trim()
          });
          
          if (verbose) {
            console.log(`🔍 [DEBUG] Found sequence call: ${sequenceName} at ${filePath}:${index + 1}`);
          }
        }
      }
      pattern.lastIndex = 0; // Reset regex
    }
  });

  return calls;
}

/**
 * Extract sequence registrations from file content
 */
function extractSequenceRegistrationsFromContent(content, filePath, verbose) {
  const registrations = [];
  const lines = content.split('\n');
  
  // Patterns for sequence registrations
  const registrationPatterns = [
    /conductor\.defineSequence\s*\(\s*['"]([^'"]+)['"]/g,
    /conductor\.registerSequence\s*\(\s*([^,)]+)/g,
    /registerAllSequences\s*\(/g,
    /ALL_SEQUENCES\s*=\s*\[/g,
    /ALL_CANVAS_SEQUENCES\s*=\s*\[/g
  ];

  lines.forEach((line, index) => {
    for (const pattern of registrationPatterns) {
      let match;
      while ((match = pattern.exec(line)) !== null) {
        let sequenceName = match[1];
        let registrationType = 'Individual';
        
        if (line.includes('registerAllSequences') || line.includes('ALL_SEQUENCES')) {
          sequenceName = 'BULK_REGISTRATION';
          registrationType = 'Bulk';
        } else if (line.includes('ALL_CANVAS_SEQUENCES')) {
          sequenceName = 'CANVAS_BULK_REGISTRATION';
          registrationType = 'Bulk';
        } else if (!sequenceName) {
          // Try to extract sequence name from variable
          const varMatch = line.match(/registerSequence\s*\(\s*(\w+)/);
          if (varMatch) {
            sequenceName = extractSequenceNameFromVariable(content, varMatch[1]);
          }
        }

        if (sequenceName) {
          registrations.push({
            sequenceName,
            filePath,
            lineNumber: index + 1,
            registrationType,
            registrationContext: extractRegistrationContext(content, index),
            context: line.trim()
          });
          
          if (verbose) {
            console.log(`🔍 [DEBUG] Found sequence registration: ${sequenceName} (${registrationType}) at ${filePath}:${index + 1}`);
          }
        }
      }
      pattern.lastIndex = 0; // Reset regex
    }
  });

  return registrations;
}

/**
 * Build sequence name mapping for resolution
 */
function buildSequenceNameMap(registrations, verbose) {
  const nameMap = new Map();
  
  registrations.forEach(reg => {
    if (reg.registrationType === 'Bulk') {
      // For bulk registrations, we need to find the actual sequences
      const sequences = extractSequencesFromBulkRegistration(reg);
      sequences.forEach(seq => {
        nameMap.set(seq.callName, seq.actualName);
      });
    } else {
      nameMap.set(reg.sequenceName, reg.sequenceName);
    }
  });

  if (verbose) {
    console.log(`🔍 [DEBUG] Built sequence name map with ${nameMap.size} entries`);
  }

  return nameMap;
}

/**
 * Resolve actual sequence name from call name
 */
function resolveActualSequenceName(callName, nameMap) {
  return nameMap.get(callName) || callName;
}

/**
 * Check if sequence is covered by bulk registration
 */
function isSequenceCoveredByBulkRegistration(callName, actualName, nameMap) {
  // Check if this sequence would be covered by bulk registration patterns
  const bulkPatterns = [
    /canvas-.*-symphony/,
    /library-.*-flow/,
    /component-.*-sequence/
  ];

  return bulkPatterns.some(pattern => pattern.test(callName) || pattern.test(actualName));
}

/**
 * Validate registration timing
 */
function validateRegistrationTiming(call, registration, verbose) {
  // Check if registration is in a React hook that might not be executed
  if (registration.registrationContext.includes('useEffect') ||
      registration.registrationContext.includes('useCanvas') ||
      registration.filePath.includes('hooks.')) {
    
    // Check if the call is in App.tsx or a file that loads before React components
    if (call.filePath.includes('App.tsx') || call.filePath.includes('App.jsx')) {
      return {
        message: `Sequence '${call.sequenceName}' may be called before registration in React hook`,
        suggestedFix: 'Move registration to app initialization or ensure component renders before call',
        analysis: `Registration in ${registration.filePath} (React hook) may execute after call in ${call.filePath}`
      };
    }
  }

  return null;
}

/**
 * Calculate confidence for registration violation
 */
function calculateRegistrationConfidence(call, registrations, nameMap) {
  let confidence = 0.95; // Base confidence

  // Lower confidence if sequence name is very generic
  if (call.sequenceName.length < 10) {
    confidence -= 0.1;
  }

  // Higher confidence for RenderX-specific patterns
  if (call.sequenceName.includes('canvas') || 
      call.sequenceName.includes('symphony') ||
      call.sequenceName.includes('sequence')) {
    confidence += 0.05;
  }

  // Lower confidence if there are similar registrations
  const similarRegistrations = registrations.filter(reg => 
    reg.sequenceName.includes(call.sequenceName.split('-')[0])
  );
  if (similarRegistrations.length > 0) {
    confidence -= 0.1;
  }

  return Math.max(0.7, Math.min(1.0, confidence));
}

/**
 * Get registration suggestion
 */
function getRegistrationSuggestion(sequenceName, projectRoot) {
  // Look for existing sequence files
  const sequencePattern = sequenceName.replace(/-/g, '.*');
  
  if (sequenceName.includes('canvas')) {
    return `Create registration in hooks.ts: conductor.defineSequence('${sequenceName}', SEQUENCE)`;
  } else if (sequenceName.includes('symphony')) {
    return `Add to symphony registration: conductor.registerSequence(${sequenceName.toUpperCase()}_SEQUENCE)`;
  }
  
  return `Create sequence definition and register with conductor.defineSequence('${sequenceName}', SEQUENCE)`;
}

/**
 * Analyze registration options
 */
function analyzeRegistrationOptions(sequenceName, registrations) {
  const analysis = {
    existingRegistrations: registrations.length,
    bulkRegistrations: registrations.filter(r => r.registrationType === 'Bulk').length,
    similarSequences: registrations.filter(r => 
      r.sequenceName.includes(sequenceName.split('-')[0])
    ).length
  };

  return `Found ${analysis.existingRegistrations} total registrations (${analysis.bulkRegistrations} bulk), ${analysis.similarSequences} similar sequences`;
}

/**
 * Extract sequence name from special call patterns
 */
function extractSequenceNameFromSpecialCall(line) {
  if (line.includes('startCanvasLibraryDropFlow')) {
    return 'canvas-library-drop-symphony';
  }
  
  const flowMatch = line.match(/startCanvas(\w+)Flow/);
  if (flowMatch) {
    return `canvas-${flowMatch[1].toLowerCase()}-symphony`;
  }
  
  return null;
}

/**
 * Extract sequence name from variable reference
 */
function extractSequenceNameFromVariable(content, variableName) {
  // Look for variable definition
  const varPattern = new RegExp(`const\\s+${variableName}\\s*=\\s*{[^}]*name:\\s*['"]([^'"]+)['"]`, 's');
  const match = content.match(varPattern);
  
  if (match) {
    return match[1];
  }
  
  // Try to extract from variable name itself
  if (variableName.includes('SEQUENCE')) {
    return variableName.toLowerCase().replace(/_/g, '-').replace('-sequence', '-symphony');
  }
  
  return variableName;
}

/**
 * Extract registration context
 */
function extractRegistrationContext(content, lineIndex) {
  const lines = content.split('\n');
  const contextLines = lines.slice(Math.max(0, lineIndex - 5), lineIndex + 5);
  
  const context = contextLines.join(' ');
  
  if (context.includes('useEffect')) return 'useEffect';
  if (context.includes('useCanvas')) return 'useCanvas';
  if (context.includes('componentDidMount')) return 'componentDidMount';
  if (context.includes('initialization')) return 'initialization';
  
  return 'unknown';
}

/**
 * Extract sequences from bulk registration
 */
function extractSequencesFromBulkRegistration(registration) {
  // This would need to be implemented based on the specific bulk registration patterns
  // For now, return common RenderX sequences
  if (registration.sequenceName === 'CANVAS_BULK_REGISTRATION') {
    return [
      { callName: 'canvas-component-drag-symphony', actualName: 'Canvas Component Drag Symphony No. 4' },
      { callName: 'canvas-library-drop-symphony', actualName: 'Canvas Library Drop Symphony No. 2' },
      { callName: 'canvas-resize-symphony', actualName: 'Canvas Resize Symphony No. 1' }
    ];
  }
  
  return [];
}

/**
 * Get project root from file path
 */
function getProjectRoot(filePath) {
  // Try to find project root by looking for package.json or similar markers
  let currentDir = path.dirname(filePath);
  
  while (currentDir !== path.dirname(currentDir)) {
    try {
      const packageJsonPath = path.join(currentDir, 'package.json');
      if (require('fs').existsSync(packageJsonPath)) {
        return currentDir;
      }
    } catch (error) {
      // Continue searching
    }
    currentDir = path.dirname(currentDir);
  }
  
  // Fallback to current directory
  return process.cwd();
}
