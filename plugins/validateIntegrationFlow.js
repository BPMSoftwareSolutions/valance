/**
 * Integration Flow Validation Plugin
 * Migrated from C# IntegrationFlowValidator.cs
 * Validates integration flow between UI event handlers and musical sequences
 * Detects when symphonies are structurally sound but disconnected from UI layer
 */

import { promises as fs } from 'fs';
import path from 'path';

export const operator = "validateIntegrationFlow";

export async function evaluate(content, rule, context) {
  const violations = [];
  const verbose = rule.verbose || false;
  
  if (verbose) {
    console.log(`🔗 Validating integration flow for ${context.filePath}...`);
  }

  try {
    // Extract symphony information from file path or content
    const symphonyInfo = extractSymphonyInfo(context.filePath, content);
    
    if (!symphonyInfo) {
      return { passed: true }; // Not a symphony file, skip validation
    }

    const { symphonyName, componentName, symphonyPath, projectRoot } = symphonyInfo;

    if (verbose) {
      console.log(`🔍 Analyzing symphony: ${symphonyName}, component: ${componentName}`);
    }

    // Step 1: Extract expected event handlers from symphony
    const expectedHandlers = await extractExpectedEventHandlers(symphonyPath, symphonyName, verbose);
    
    // Step 2: Scan UI files for actual event handler implementations
    const actualHandlers = await scanUIEventHandlers(projectRoot, symphonyName, verbose);
    
    // Step 3: Check for missing symphony calls in event handlers
    const integrationViolations = await validateHandlerSymphonyIntegration(
      expectedHandlers, actualHandlers, symphonyName, projectRoot, symphonyPath, verbose);
    
    violations.push(...integrationViolations);

    if (verbose) {
      console.log(`🔍 Found ${expectedHandlers.length} expected handlers`);
      console.log(`🔍 Found ${actualHandlers.length} actual UI handlers`);
      console.log(`🔍 Detected ${violations.length} integration violations`);
    }

  } catch (error) {
    violations.push({
      lineNumber: 1,
      message: `Error validating integration flow: ${error.message}`,
      type: 'ValidationError'
    });
  }

  if (violations.length > 0) {
    return {
      passed: false,
      message: `Found ${violations.length} integration flow violation(s):\n${violations.map(v => `  Line ${v.lineNumber}: ${v.message}`).join('\n')}`
    };
  }

  return { passed: true };
}

/**
 * Extract symphony information from file path or content
 */
function extractSymphonyInfo(filePath, content) {
  // Check if this is a UI file that might have integration issues
  const fileName = path.basename(filePath);
  const isUIFile = /\.(tsx?|jsx?)$/.test(fileName) &&
                   (fileName.includes('App') || fileName.includes('Canvas')) &&
                   /on(Drag|Drop|Click)|handle(Drag|Drop|Click|Canvas)/.test(content) &&
                   /startSequence/.test(content);

  // Check if this is a symphony-related file (sequence definitions, hooks, etc.)
  const isSymphonyFile = (/symphony.*sequence\.ts$/.test(filePath) && /name:\s*['"].*Symphony/.test(content)) ||
                         (/symphony.*hooks\.ts$/.test(filePath) && /defineSequence|registerSequence/.test(content)) ||
                         (/CANVAS_.*_SEQUENCE\s*=/.test(content) && /name:\s*['"].*Symphony/.test(content));

  if (!isUIFile && !isSymphonyFile) {
    return null;
  }

  // Extract symphony name from path or content
  let symphonyName = 'unknown';
  const pathParts = filePath.split(path.sep);

  // Look for symphony name in path segments
  for (const part of pathParts) {
    if (part.includes('component-drag')) {
      symphonyName = 'component-drag';
      break;
    } else if (part.includes('library-drop')) {
      symphonyName = 'library-drop';
      break;
    } else if (part.includes('element-selection')) {
      symphonyName = 'element-selection';
      break;
    }
  }

  // Try to extract from content if not found in path
  if (symphonyName === 'unknown') {
    // Look for symphony calls in content to determine type
    if (content.includes('canvas-component-drag-symphony')) {
      symphonyName = 'component-drag';
    } else if (content.includes('canvas-library-drop-symphony')) {
      symphonyName = 'library-drop';
    } else if (content.includes('canvas-element-selection-symphony')) {
      symphonyName = 'element-selection';
    } else if (content.includes('handleCanvasElementDragStart') || content.includes('onDragStart')) {
      symphonyName = 'component-drag';
    } else if (content.includes('handleCanvasLibraryDrop') || content.includes('handleDrop')) {
      symphonyName = 'library-drop';
    } else if (content.includes('handleCanvasElementSelection') || content.includes('handleClick')) {
      symphonyName = 'element-selection';
    }
  }

  // If still unknown and it's a UI file, try to infer from handlers
  if (symphonyName === 'unknown' && isUIFile) {
    // Default to component-drag for UI files with drag handlers
    if (content.includes('Drag') || content.includes('drag')) {
      symphonyName = 'component-drag';
    }
  }

  const componentName = extractComponentName(filePath);
  const symphonyPath = path.dirname(filePath);
  const projectRoot = findProjectRoot(filePath);

  return {
    symphonyName,
    componentName,
    symphonyPath,
    projectRoot
  };
}

/**
 * Extract component name from file path
 */
function extractComponentName(filePath) {
  const pathParts = filePath.split(path.sep);
  
  // Look for component indicators
  for (const part of pathParts) {
    if (part.includes('component') || part.includes('canvas') || part.includes('element')) {
      return part;
    }
  }
  
  return path.basename(path.dirname(filePath));
}

/**
 * Find project root by looking for package.json or src directory
 */
function findProjectRoot(filePath) {
  let currentDir = path.dirname(filePath);
  
  while (currentDir !== path.dirname(currentDir)) {
    try {
      const packageJsonPath = path.join(currentDir, 'package.json');
      const srcPath = path.join(currentDir, 'src');
      
      if (require('fs').existsSync(packageJsonPath) || require('fs').existsSync(srcPath)) {
        return currentDir;
      }
    } catch (error) {
      // Continue searching
    }
    
    currentDir = path.dirname(currentDir);
  }
  
  return path.dirname(filePath); // Fallback
}

/**
 * Extract expected event handlers from symphony definition
 */
async function extractExpectedEventHandlers(symphonyPath, symphonyName, verbose) {
  const handlers = [];
  
  // Look for sequence.ts file to understand the symphony flow
  const sequenceFile = path.join(symphonyPath, 'sequence.ts');
  
  try {
    const content = await fs.readFile(sequenceFile, 'utf8');
    
    // Extract symphony events that should have UI triggers
    const eventPattern = /event:\s*['"]([^'"]+)['"]/g;
    let match;
    
    while ((match = eventPattern.exec(content)) !== null) {
      const eventName = match[1];
      
      // Map event names to expected UI handler patterns
      const expectedHandler = mapEventToExpectedHandler(eventName, symphonyName);
      if (expectedHandler) {
        handlers.push(expectedHandler);
      }
    }
  } catch (error) {
    if (verbose) {
      console.log(`🔍 [DEBUG] Could not read sequence file: ${sequenceFile}`);
    }
  }

  return handlers;
}

/**
 * Map symphony events to expected UI handler patterns
 */
function mapEventToExpectedHandler(eventName, symphonyName) {
  const mappings = {
    'component-drag': {
      condition: (event) => event.includes('drag'),
      handler: {
        eventName: eventName,
        expectedHandlerName: 'handleCanvasElementDragStart',
        expectedSymphonyCall: `conductor.startSequence('canvas-component-drag-symphony'`,
        uiTriggerType: 'onDragStart'
      }
    },
    'library-drop': {
      condition: (event) => event.includes('drop'),
      handler: {
        eventName: eventName,
        expectedHandlerName: 'handleCanvasLibraryDrop',
        expectedSymphonyCall: `conductor.startSequence('canvas-library-drop-symphony'`,
        uiTriggerType: 'onDrop'
      }
    },
    'element-selection': {
      condition: (event) => event.includes('selection'),
      handler: {
        eventName: eventName,
        expectedHandlerName: 'handleCanvasElementSelection',
        expectedSymphonyCall: `conductor.startSequence('canvas-element-selection-symphony'`,
        uiTriggerType: 'onClick'
      }
    }
  };

  const mapping = mappings[symphonyName];
  if (mapping && mapping.condition(eventName)) {
    return mapping.handler;
  }

  return null;
}

/**
 * Scan UI files for actual event handler implementations
 */
async function scanUIEventHandlers(projectRoot, symphonyName, verbose) {
  const handlers = [];

  if (verbose) {
    console.log(`🔍 [DEBUG] Scanning UI files from project root: ${projectRoot}`);
  }

  // Look for App.tsx and other UI files
  const uiFiles = [
    path.join(projectRoot, 'App.tsx'),
    path.join(projectRoot, 'src', 'App.tsx'),
    path.join(projectRoot, 'components', 'Canvas.tsx'),
    path.join(projectRoot, 'src', 'components', 'Canvas.tsx'),
    path.join(projectRoot, 'src', 'components', 'Canvas', 'Canvas.tsx')
  ];

  if (verbose) {
    console.log(`🔍 [DEBUG] Looking for UI files:`);
    for (const file of uiFiles) {
      try {
        await fs.access(file);
        console.log(`🔍 [DEBUG]   ${file} - EXISTS`);
      } catch {
        console.log(`🔍 [DEBUG]   ${file} - NOT FOUND`);
      }
    }
  }

  for (const uiFile of uiFiles) {
    try {
      await fs.access(uiFile);
      
      if (verbose) {
        console.log(`🔍 [DEBUG] Analyzing UI file: ${uiFile}`);
      }

      const content = await fs.readFile(uiFile, 'utf8');
      const fileHandlers = extractEventHandlersFromFile(content, uiFile, symphonyName, verbose);

      if (verbose) {
        console.log(`🔍 [DEBUG] Found ${fileHandlers.length} handlers in ${path.basename(uiFile)}`);
      }

      handlers.push(...fileHandlers);
    } catch (error) {
      // File doesn't exist, continue
    }
  }

  return handlers;
}

/**
 * Extract event handlers from a specific UI file
 */
function extractEventHandlersFromFile(content, filePath, symphonyName, verbose) {
  const handlers = [];

  if (verbose) {
    console.log(`🔍 [DEBUG] Extracting handlers from ${path.basename(filePath)} for ${symphonyName} symphony`);
  }

  // Pattern for React event handlers:
  // Format 1: onDragStart={(e) => handleSomething(e)}
  // Format 2: onDragStart={handleSomething}
  const handlerPattern1 = /(on\w+)\s*=\s*\{\s*\([^)]*\)\s*=>\s*(\w+)\s*\([^)]*\)\s*\}/g;
  const handlerPattern2 = /(on\w+)\s*=\s*\{\s*(\w+)\s*\}/g;

  const matches1 = Array.from(content.matchAll(handlerPattern1));
  const matches2 = Array.from(content.matchAll(handlerPattern2));
  const allMatches = [...matches1, ...matches2];

  if (verbose) {
    console.log(`🔍 [DEBUG] Found ${allMatches.length} potential event handler patterns`);
  }

  for (const match of allMatches) {
    const eventType = match[1];
    const handlerName = match[2];

    if (verbose) {
      console.log(`🔍 [DEBUG] Found handler: ${handlerName} for ${eventType}`);
    }

    // Check if this handler is relevant to the symphony
    if (isHandlerRelevantToSymphony(handlerName, eventType, symphonyName)) {
      if (verbose) {
        console.log(`🔍 [DEBUG] Handler ${handlerName} is relevant to ${symphonyName}`);
      }

      // Check if the handler calls a musical sequence
      const callsSymphony = checkIfHandlerCallsSymphony(content, handlerName, symphonyName, verbose);

      if (verbose) {
        console.log(`🔍 [DEBUG] Handler ${handlerName} calls symphony: ${callsSymphony.calls} - ${callsSymphony.details}`);
      }

      handlers.push({
        handlerName,
        eventType,
        filePath,
        lineNumber: getLineNumber(content, match.index),
        callsSymphony: callsSymphony.calls,
        symphonyCallDetails: callsSymphony.details
      });
    }
  }

  if (verbose) {
    console.log(`🔍 [DEBUG] Extracted ${handlers.length} relevant handlers`);
  }

  return handlers;
}

/**
 * Check if a handler is relevant to the symphony being validated
 */
function isHandlerRelevantToSymphony(handlerName, eventType, symphonyName) {
  const relevanceMap = {
    'component-drag': () => handlerName.includes('Drag') || eventType === 'onDragStart',
    'library-drop': () => handlerName.includes('Drop') || eventType === 'onDrop',
    'element-selection': () => handlerName.includes('Selection') || handlerName.includes('Click') || eventType === 'onClick'
  };

  const checkRelevance = relevanceMap[symphonyName];
  return checkRelevance ? checkRelevance() : false;
}

/**
 * Check if a handler function calls its corresponding musical sequence
 */
function checkIfHandlerCallsSymphony(content, handlerName, symphonyName, verbose) {
  if (verbose) {
    console.log(`🔍 [DEBUG] Looking for handler function: ${handlerName}`);
  }

  // Try to find the handler function definition with proper brace matching
  const handlerBody = extractFunctionBodyWithBraceMatching(content, handlerName, verbose);

  if (!handlerBody) {
    if (verbose) {
      console.log(`🔍 [DEBUG] Handler function ${handlerName} not found`);
    }
    return { calls: false, details: 'Handler function not found' };
  }

  if (verbose) {
    console.log(`🔍 [DEBUG] Handler body (first 100 chars): ${handlerBody.substring(0, Math.min(100, handlerBody.length))}...`);
  }

  // Check for symphony calls
  const symphonyCallPatterns = [
    /conductor\.startSequence\s*\(\s*['"].*?symphony['"]/,
    /communicationSystem\.conductor\.startSequence\s*\(\s*['"].*?symphony['"]/,
    /startSequence\s*\(\s*['"].*?symphony['"]/,
    /startCanvasLibraryDropFlow\s*\(/,
    /musical.*?sequence/i,
    /symphony.*?start/i
  ];

  for (const pattern of symphonyCallPatterns) {
    const match = handlerBody.match(pattern);
    if (match) {
      // Extract the actual symphony name being called
      const symphonyCallMatch = handlerBody.match(/(?:communicationSystem\.)?conductor\.startSequence\s*\(\s*['"]([^'"]+)['"]/);
      if (symphonyCallMatch) {
        const calledSymphonyName = symphonyCallMatch[1];
        if (verbose) {
          console.log(`🔍 [DEBUG] Found symphony call: ${calledSymphonyName}`);
        }

        // Check if the called symphony name matches the expected pattern
        const expectedSymphonyName = `canvas-${symphonyName}-symphony`;
        if (calledSymphonyName !== expectedSymphonyName) {
          if (verbose) {
            console.log(`🔍 [DEBUG] Symphony name mismatch! Called: ${calledSymphonyName}, Expected: ${expectedSymphonyName}`);
          }
          return { calls: false, details: `Symphony name mismatch: calls '${calledSymphonyName}' but expected '${expectedSymphonyName}'` };
        }
      }

      if (verbose) {
        console.log(`🔍 [DEBUG] Found valid symphony call with pattern: ${pattern}`);
      }
      return { calls: true, details: `Found symphony call matching pattern: ${pattern}` };
    }
  }

  if (verbose) {
    console.log(`🔍 [DEBUG] No symphony call found in handler body`);
  }
  return { calls: false, details: 'No symphony call found in handler body' };
}

/**
 * Validate integration between handlers and symphonies
 */
async function validateHandlerSymphonyIntegration(expectedHandlers, actualHandlers, symphonyName, projectRoot, symphonyPath, verbose) {
  const violations = [];

  // Check for missing symphony calls in actual handlers
  for (const actualHandler of actualHandlers) {
    if (!actualHandler.callsSymphony) {
      violations.push({
        type: 'MissingSymphonyCall',
        handlerName: actualHandler.handlerName,
        eventType: actualHandler.eventType,
        filePath: actualHandler.filePath,
        lineNumber: actualHandler.lineNumber,
        message: `Event handler '${actualHandler.handlerName}' does not call corresponding musical sequence for ${symphonyName} symphony`,
        expectedCall: `conductor.startSequence('canvas-${symphonyName}-symphony', ...)`,
        actualBehavior: actualHandler.symphonyCallDetails,
        severity: 'Critical',
        impact: 'Symphony beats will never execute, breaking the musical architecture'
      });
    } else if (actualHandler.symphonyCallDetails.includes('mismatch')) {
      violations.push({
        type: 'SymphonyNameMismatch',
        handlerName: actualHandler.handlerName,
        eventType: actualHandler.eventType,
        filePath: actualHandler.filePath,
        lineNumber: actualHandler.lineNumber,
        message: `Event handler '${actualHandler.handlerName}' calls wrong symphony name`,
        expectedCall: `conductor.startSequence('canvas-${symphonyName}-symphony', ...)`,
        actualBehavior: actualHandler.symphonyCallDetails,
        severity: 'Critical',
        impact: 'Runtime error: Sequence not found - symphony will fail to execute'
      });
    }
  }

  // Check if the symphony is properly registered in the conductor
  const symphonyRegistrationViolation = await validateSymphonyRegistration(symphonyName, projectRoot, symphonyPath, verbose);
  if (symphonyRegistrationViolation) {
    violations.push(symphonyRegistrationViolation);
  }

  return violations;
}

/**
 * Validate that the symphony is properly registered in the MusicalConductor
 */
async function validateSymphonyRegistration(symphonyName, projectRoot, symphonyPath, verbose) {
  try {
    // Look for MusicalConductor.ts file
    const conductorFiles = [
      path.join(projectRoot, 'communication', 'sequences', 'MusicalConductor.ts'),
      path.join(projectRoot, 'communication', 'MusicalConductor.ts'),
      path.join(projectRoot, 'core', 'MusicalConductor.ts'),
      path.join(projectRoot, 'MusicalConductor.ts')
    ];

    const expectedSymphonyName = `canvas-${symphonyName}-symphony`;
    let isRegistered = false;
    let registrationLocation = '';

    // First check the MusicalConductor.ts file
    for (const conductorFile of conductorFiles) {
      try {
        await fs.access(conductorFile);
        const content = await fs.readFile(conductorFile, 'utf8');

        const registrationPatterns = [
          new RegExp(`['"]?${expectedSymphonyName}['"]?\\s*:`),
          new RegExp(`registerSequence\\s*\\(\\s*['"]?${expectedSymphonyName}['"]?\\s*,`),
          new RegExp(`defineSequence\\s*\\(\\s*['"]?${expectedSymphonyName}['"]?\\s*,`),
          new RegExp(`sequences\\s*\\[\\s*['"]?${expectedSymphonyName}['"]?\\s*\\]`),
          new RegExp(`['"]?${expectedSymphonyName}['"]?\\s*=>`),
          // RenderX-specific patterns
          new RegExp(`CANVAS_.*_SEQUENCE`),
          new RegExp(`ALL_CANVAS_SEQUENCES`),
          new RegExp(`ALL_SEQUENCES`),
          new RegExp(`registerAllSequences`),
          new RegExp(`conductor\\.registerSequence\\s*\\(`),
          // Check for sequence name in sequence definitions
          new RegExp(`name:\\s*['"]Canvas.*Symphony.*['"]`),
          new RegExp(`name:\\s*['"].*${symphonyName.replace('-', '.*')}.*Symphony.*['"]`)
        ];

        if (registrationPatterns.some(pattern => pattern.test(content))) {
          isRegistered = true;
          registrationLocation = conductorFile;
          if (verbose) {
            console.log(`🔍 [DEBUG] Symphony ${expectedSymphonyName} found in conductor: ${conductorFile}`);
          }
          break;
        }
      } catch (error) {
        // File doesn't exist, continue
      }
    }

    // If not found in conductor, check the symphony's own files (hooks.ts, index.ts)
    if (!isRegistered) {
      const symphonyFiles = [
        path.join(symphonyPath, 'hooks.ts'),
        path.join(symphonyPath, 'index.ts'),
        path.join(symphonyPath, 'registry.ts'),
        path.join(symphonyPath, 'sequence.ts'),
        // RenderX-specific paths
        path.join(projectRoot, 'communication', 'sequences', 'index.ts'),
        path.join(projectRoot, 'communication', 'sequences', 'canvas-sequences', 'index.ts'),
        path.join(projectRoot, 'src', 'communication', 'sequences', 'index.ts'),
        path.join(projectRoot, 'src', 'communication', 'sequences', 'canvas-sequences', 'index.ts')
      ];

      for (const symphonyFile of symphonyFiles) {
        try {
          await fs.access(symphonyFile);
          const content = await fs.readFile(symphonyFile, 'utf8');

          const registrationPatterns = [
            new RegExp(`defineSequence\\s*\\(\\s*['"]?${expectedSymphonyName}['"]?\\s*,`),
            new RegExp(`registerSequence\\s*\\(\\s*['"]?${expectedSymphonyName}['"]?\\s*,`),
            new RegExp(`conductor\\.defineSequence\\s*\\(\\s*['"]?${expectedSymphonyName}['"]?\\s*,`),
            new RegExp(`conductor\\.registerSequence\\s*\\(\\s*['"]?${expectedSymphonyName}['"]?\\s*,`),
            // RenderX-specific patterns for symphony files
            new RegExp(`CANVAS_.*_SEQUENCE`),
            new RegExp(`name:\\s*['"].*${symphonyName.replace('-', '.*')}.*Symphony.*['"]`),
            new RegExp(`startCanvas.*Flow`)
          ];

          if (registrationPatterns.some(pattern => pattern.test(content))) {
            isRegistered = true;
            registrationLocation = symphonyFile;
            if (verbose) {
              console.log(`🔍 [DEBUG] Symphony ${expectedSymphonyName} found in symphony file: ${symphonyFile}`);
            }
            break;
          }
        } catch (error) {
          // File doesn't exist, continue
        }
      }
    }

    if (!isRegistered) {
      if (verbose) {
        console.log(`🔍 [DEBUG] Symphony ${expectedSymphonyName} not found in any registration location`);
      }

      return {
        type: 'SymphonyNotRegistered',
        handlerName: 'MusicalConductor',
        eventType: 'Registration',
        filePath: symphonyPath,
        lineNumber: 1,
        message: `Symphony '${expectedSymphonyName}' is not registered anywhere`,
        expectedCall: `conductor.defineSequence('${expectedSymphonyName}', SEQUENCE) in hooks.ts`,
        actualBehavior: 'Symphony not found in conductor or symphony files',
        severity: 'Critical',
        impact: 'Runtime error: Sequence not found when handlers try to start symphony'
      };
    } else {
      if (verbose) {
        console.log(`🔍 [DEBUG] Symphony ${expectedSymphonyName} properly registered in: ${registrationLocation}`);
      }
    }

    return null; // No violation found
  } catch (error) {
    if (verbose) {
      console.log(`🔍 [DEBUG] Error validating symphony registration: ${error.message}`);
    }
    return null;
  }
}

/**
 * Extract function body with proper brace matching to handle nested braces
 */
function extractFunctionBodyWithBraceMatching(content, handlerName, verbose) {
  // Find the function declaration
  const functionPatterns = [
    new RegExp(`const\\s+${handlerName}\\s*=.*?\\{`), // const handlerName = () => {
    new RegExp(`function\\s+${handlerName}\\s*\\([^)]*\\)\\s*\\{`), // function handlerName() {
    new RegExp(`${handlerName}\\s*:\\s*\\([^)]*\\)\\s*=>\\s*\\{`), // handlerName: () => {
    new RegExp(`${handlerName}\\s*=\\s*\\([^)]*\\)\\s*=>\\s*\\{`) // handlerName = () => {
  ];

  for (const pattern of functionPatterns) {
    const match = content.match(pattern);
    if (match) {
      if (verbose) {
        console.log(`🔍 [DEBUG] Found handler declaration: ${handlerName}`);
      }

      // Find the opening brace position
      const startPos = match.index + match[0].length - 1; // Position of opening brace

      // Use brace matching to find the complete function body
      const functionBody = extractBalancedBraces(content, startPos);
      if (functionBody) {
        if (verbose) {
          console.log(`🔍 [DEBUG] Extracted function body (${functionBody.length} chars)`);
        }
        return functionBody;
      }
    }
  }

  if (verbose) {
    console.log(`🔍 [DEBUG] Handler function ${handlerName} not found`);
  }
  return null;
}

/**
 * Extract content between balanced braces starting from the given position
 */
function extractBalancedBraces(content, startPos) {
  if (startPos >= content.length || content[startPos] !== '{') {
    return null;
  }

  let braceCount = 0;
  const start = startPos + 1; // Skip opening brace
  let current = startPos;

  while (current < content.length) {
    const ch = content[current];
    if (ch === '{') {
      braceCount++;
    } else if (ch === '}') {
      braceCount--;
      if (braceCount === 0) {
        // Found matching closing brace
        return content.substring(start, current);
      }
    }
    current++;
  }

  return null; // Unmatched braces
}

/**
 * Get line number for a character position in content
 */
function getLineNumber(content, position) {
  return content.substring(0, position).split('\n').length;
}
