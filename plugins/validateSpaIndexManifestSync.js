import fs from 'fs/promises';
import path from 'path';
import { parseSequenceFromContent } from './sequenceParser.js';

export const operator = "validateSpaIndexManifestSync";

export async function evaluate(content, rule, context) {
  try {
    const indexPath = context.filePath;
    const pluginDir = path.dirname(indexPath);
    
    // Read related files
    const manifestPath = path.join(pluginDir, 'manifest.json');
    const sequencePath = path.join(pluginDir, 'sequence.ts');
    
    const errors = [];
    const warnings = [];

    // Check if required files exist
    let manifest, sequence, sequenceContent;
    
    try {
      const manifestContent = await fs.readFile(manifestPath, 'utf-8');
      manifest = JSON.parse(manifestContent);
    } catch (error) {
      errors.push(`Could not read manifest.json: ${error.message}`);
    }

    try {
      sequenceContent = await fs.readFile(sequencePath, 'utf-8');
      sequence = parseSequenceFromContent(sequenceContent);
    } catch (error) {
      errors.push(`Could not read sequence.ts: ${error.message}`);
    }

    if (errors.length > 0) {
      return {
        passed: false,
        message: `File access errors: ${errors.join('; ')}`
      };
    }

    // Validate manifest consistency
    if (rule.checkManifestConsistency && manifest && sequence) {
      const manifestValidation = validateManifestConsistency(manifest, sequence);
      errors.push(...manifestValidation.errors);
      warnings.push(...manifestValidation.warnings);
    }

    // Validate sequence registration in index.ts
    if (rule.validateSequenceRegistration) {
      const registrationValidation = validateSequenceRegistration(content);
      if (!registrationValidation.passed) {
        errors.push(registrationValidation.message);
      }
    }

    // Validate entry point mapping
    if (rule.checkEntryPointMapping && manifest) {
      const entryValidation = validateEntryPointMapping(manifest, indexPath);
      if (!entryValidation.passed) {
        errors.push(entryValidation.message);
      }
    }

    // Validate import statements
    const importValidation = validateImportStatements(content, sequencePath);
    if (!importValidation.passed) {
      errors.push(importValidation.message);
    }
    if (importValidation.warnings) {
      warnings.push(...importValidation.warnings);
    }

    const result = {
      passed: errors.length === 0,
      message: errors.length === 0 
        ? "Index-manifest synchronization validation passed"
        : `Synchronization validation failed: ${errors.join('; ')}`
    };

    if (warnings.length > 0 && rule.verbose) {
      result.warnings = warnings;
    }

    return result;

  } catch (error) {
    return {
      passed: false,
      message: `Index-manifest sync validation error: ${error.message}`
    };
  }
}

function validateManifestConsistency(manifest, sequence) {
  const errors = [];
  const warnings = [];

  // Check ID consistency
  if (manifest.id !== sequence.id) {
    errors.push(`Manifest ID '${manifest.id}' doesn't match sequence ID '${sequence.id}'`);
  }

  // Check version consistency
  if (manifest.version !== sequence.version) {
    errors.push(`Manifest version '${manifest.version}' doesn't match sequence version '${sequence.version}'`);
  }

  // Check entry point
  if (!manifest.entry) {
    errors.push("Manifest missing 'entry' field");
  } else if (manifest.entry !== 'index.ts' && manifest.entry !== 'index.js') {
    warnings.push(`Manifest entry '${manifest.entry}' should typically be 'index.ts' or 'index.js'`);
  }

  // Validate manifest structure
  const requiredFields = ['id', 'version', 'entry'];
  for (const field of requiredFields) {
    if (!manifest[field]) {
      errors.push(`Manifest missing required field: '${field}'`);
    }
  }

  return { errors, warnings };
}

function validateSequenceRegistration(indexContent) {
  // Check for registerSequence call
  const registerPattern = /registerSequence\s*\(/;
  if (!registerPattern.test(indexContent)) {
    return {
      passed: false,
      message: "index.ts must call registerSequence() to register the sequence"
    };
  }

  // Check for sequence import
  const importPattern = /import\s+.*sequence.*from\s+['"]\.\/sequence['"]/i;
  if (!importPattern.test(indexContent)) {
    return {
      passed: false,
      message: "index.ts must import sequence from './sequence'"
    };
  }

  // Check for registry import
  const registryPattern = /import\s+.*registerSequence.*from\s+['"]@\/registry['"]/;
  if (!registryPattern.test(indexContent)) {
    return {
      passed: false,
      message: "index.ts must import registerSequence from '@/registry'"
    };
  }

  return { passed: true };
}

function validateEntryPointMapping(manifest, indexPath) {
  const fileName = path.basename(indexPath);
  const expectedEntry = manifest.entry;

  if (fileName !== expectedEntry) {
    return {
      passed: false,
      message: `Entry point mismatch: manifest.entry is '${expectedEntry}' but file is '${fileName}'`
    };
  }

  return { passed: true };
}

function validateImportStatements(content, sequencePath) {
  const errors = [];
  const warnings = [];

  // Check sequence import format
  const sequenceImportMatch = content.match(/import\s+{([^}]+)}\s+from\s+['"]\.\/sequence['"]/);
  if (sequenceImportMatch) {
    const imports = sequenceImportMatch[1].trim();
    if (imports !== 'sequence') {
      warnings.push(`Sequence import should be '{ sequence }', found '{ ${imports} }'`);
    }
  }

  // Check for unused imports
  const importLines = content.match(/import\s+.*from\s+['"][^'"]+['"]/g) || [];
  for (const importLine of importLines) {
    const importMatch = importLine.match(/import\s+{([^}]+)}/);
    if (importMatch) {
      const imports = importMatch[1].split(',').map(i => i.trim());
      for (const imp of imports) {
        const cleanImport = imp.replace(/\s+as\s+\w+/, '');
        if (!content.includes(cleanImport + '(')) {
          warnings.push(`Imported '${cleanImport}' but not used`);
        }
      }
    }
  }

  return {
    passed: errors.length === 0,
    message: errors.length === 0 ? "Import statements valid" : errors.join(', '),
    warnings: warnings.length > 0 ? warnings : undefined
  };
}
