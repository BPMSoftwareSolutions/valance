import fs from 'fs/promises';
import path from 'path';
import { parseSequenceFromContent } from './sequenceParser.js';

export const operator = "validateSpaHandlerMapping";

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
        message: "Sequence must have movements array for handler mapping validation"
      };
    }

    const sequenceDir = path.dirname(context.filePath);
    const handlersDir = path.join(sequenceDir, 'handlers');
    
    const errors = [];
    const warnings = [];

    // Check if handlers directory exists
    try {
      await fs.access(handlersDir);
    } catch {
      return {
        passed: false,
        message: "handlers/ directory not found - required for movement handler mapping"
      };
    }

    // Get all handler files
    let handlerFiles = [];
    try {
      const files = await fs.readdir(handlersDir);
      handlerFiles = files.filter(f => f.endsWith('.ts') || f.endsWith('.js'));
    } catch (error) {
      return {
        passed: false,
        message: `Could not read handlers directory: ${error.message}`
      };
    }

    // Validate each movement has a corresponding handler
    for (const movement of sequence.movements) {
      if (!movement.label) {
        errors.push("Movement missing 'label' field for handler mapping");
        continue;
      }

      const validation = await validateMovementHandler(
        movement, 
        handlersDir, 
        handlerFiles, 
        rule
      );
      
      if (!validation.passed) {
        errors.push(`Movement '${movement.label}': ${validation.message}`);
      }
      
      if (validation.warnings) {
        warnings.push(...validation.warnings.map(w => `Movement '${movement.label}': ${w}`));
      }
    }

    // Check for orphaned handler files
    const movementLabels = sequence.movements.map(m => m.label).filter(Boolean);
    const orphanedHandlers = handlerFiles.filter(file => {
      const baseName = path.basename(file, path.extname(file));
      const expectedMovementLabel = convertFileNameToMovementLabel(baseName);
      return !movementLabels.includes(expectedMovementLabel);
    });

    if (orphanedHandlers.length > 0) {
      warnings.push(`Orphaned handler files (no corresponding movement): ${orphanedHandlers.join(', ')}`);
    }

    const result = {
      passed: errors.length === 0,
      message: errors.length === 0 
        ? `Handler mapping validation passed for ${sequence.movements.length} movement(s)`
        : `Handler mapping validation failed: ${errors.join('; ')}`
    };

    if (warnings.length > 0 && rule.verbose) {
      result.warnings = warnings;
    }

    return result;

  } catch (error) {
    return {
      passed: false,
      message: `Handler mapping validation error: ${error.message}`
    };
  }
}

async function validateMovementHandler(movement, handlersDir, handlerFiles, rule) {
  const errors = [];
  const warnings = [];

  // Find corresponding handler file
  const expectedFileName = convertMovementLabelToFileName(movement.label);
  const possibleFiles = [
    `${expectedFileName}.ts`,
    `${expectedFileName}.js`,
    `on${movement.label}.ts`,
    `on${movement.label}.js`
  ];

  const matchingFile = handlerFiles.find(file => possibleFiles.includes(file));
  
  if (!matchingFile) {
    errors.push(`No handler file found. Expected one of: ${possibleFiles.join(', ')}`);
    return { passed: false, message: errors.join(', '), warnings };
  }

  // Validate handler file content
  if (rule.validateExports || rule.checkAgentContext) {
    try {
      const handlerPath = path.join(handlersDir, matchingFile);
      const handlerContent = await fs.readFile(handlerPath, 'utf-8');
      
      if (rule.validateExports) {
        const exportValidation = validateHandlerExports(handlerContent, movement.label);
        if (!exportValidation.passed) {
          errors.push(exportValidation.message);
        }
      }

      if (rule.checkAgentContext) {
        if (!handlerContent.includes('@agent-context')) {
          warnings.push("Missing @agent-context annotation for AI clarity");
        }
      }

    } catch (error) {
      errors.push(`Could not read handler file: ${error.message}`);
    }
  }

  return {
    passed: errors.length === 0,
    message: errors.length === 0 ? "Handler mapping valid" : errors.join(', '),
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

function validateHandlerExports(content, movementLabel) {
  // Check for various export patterns
  const exportPatterns = [
    new RegExp(`export\\s+const\\s+\\w+`, 'i'),
    new RegExp(`export\\s+function\\s+\\w+`, 'i'),
    new RegExp(`export\\s+default`, 'i')
  ];

  const hasValidExport = exportPatterns.some(pattern => pattern.test(content));
  
  if (!hasValidExport) {
    return {
      passed: false,
      message: "Handler file must export a function (const, function, or default export)"
    };
  }

  return { passed: true };
}

function convertMovementLabelToFileName(label) {
  // Convert "DragStart" to "onDragStart"
  return `on${label}`;
}

function convertFileNameToMovementLabel(fileName) {
  // Convert "onDragStart" to "DragStart"
  if (fileName.startsWith('on')) {
    return fileName.substring(2);
  }
  return fileName;
}
