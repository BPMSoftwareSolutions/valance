import fs from 'fs';
import path from 'path';

export const operator = "validateSpaPluginDirectoryCompliance";

export async function evaluate(pluginDirectory, rule, context) {
  try {
    const pluginPath = context.pluginPath || pluginDirectory;

    // Check if this is a SPA plugin directory
    if (!pluginPath.includes('symphony')) {
      return {
        passed: true,
        message: "Not a SPA plugin directory, skipping validation"
      };
    }

    const errors = [];
    const warnings = [];
    const suggestions = [];

    // 1. Check for forbidden TypeScript files
    const forbiddenFilesCheck = await checkForbiddenFiles(pluginPath);
    if (!forbiddenFilesCheck.passed) {
      errors.push(...forbiddenFilesCheck.errors);
      suggestions.push(...forbiddenFilesCheck.suggestions);
    }

    // 2. Check for required files
    const requiredFilesCheck = await checkRequiredFiles(pluginPath);
    if (!requiredFilesCheck.passed) {
      errors.push(...requiredFilesCheck.errors);
      suggestions.push(...requiredFilesCheck.suggestions);
    }

    // 3. Check export compliance (only if required files exist)
    if (requiredFilesCheck.passed) {
      const exportComplianceCheck = await checkExportCompliance(pluginPath);
      if (!exportComplianceCheck.passed) {
        errors.push(...exportComplianceCheck.errors);
        suggestions.push(...exportComplianceCheck.suggestions);
      }
    }

    // 4. Check directory structure integrity
    const structureCheck = await checkDirectoryStructure(pluginPath);
    if (!structureCheck.passed) {
      warnings.push(...structureCheck.warnings);
    }

    const result = {
      passed: errors.length === 0,
      confidence: errors.length === 0 ? 0.95 : 0.8,
      message: errors.length === 0
        ? "SPA plugin directory compliance validation passed"
        : `SPA plugin directory compliance failed: ${errors.join('; ')}`
    };

    if (warnings.length > 0) {
      result.warnings = warnings;
    }

    if (suggestions.length > 0) {
      result.suggestions = suggestions;
    }

    // Add detailed metadata
    result.metadata = {
      pluginPath: pluginPath,
      pluginName: path.basename(pluginPath),
      hasForbiddenFiles: !forbiddenFilesCheck.passed,
      hasRequiredFiles: requiredFilesCheck.passed,
      isExportCompliant: requiredFilesCheck.passed ? exportComplianceCheck.passed : false,
      structuralIntegrity: structureCheck.passed,
      filesFound: await getDirectoryFiles(pluginPath)
    };

    return result;

  } catch (error) {
    return {
      passed: false,
      confidence: 0.5,
      message: `SPA plugin directory validation error: ${error.message}`
    };
  }
}

async function checkForbiddenFiles(pluginPath) {
  const forbiddenFiles = ['index.ts', 'sequence.ts'];
  const errors = [];
  const suggestions = [];
  
  for (const forbiddenFile of forbiddenFiles) {
    const filePath = path.join(pluginPath, forbiddenFile);
    if (fs.existsSync(filePath)) {
      errors.push(`CRITICAL: Forbidden TypeScript file found: ${forbiddenFile}`);
      suggestions.push(`Remove ${forbiddenFile} - runtime directories should only contain .js files`);
    }
  }

  return {
    passed: errors.length === 0,
    errors: errors,
    suggestions: suggestions
  };
}

async function checkRequiredFiles(pluginPath) {
  const requiredFiles = ['index.js', 'sequence.js', 'manifest.json'];
  const errors = [];
  const suggestions = [];
  
  for (const requiredFile of requiredFiles) {
    const filePath = path.join(pluginPath, requiredFile);
    if (!fs.existsSync(filePath)) {
      errors.push(`CRITICAL: Required file missing: ${requiredFile}`);
      suggestions.push(`Add ${requiredFile} to plugin directory`);
    }
  }

  return {
    passed: errors.length === 0,
    errors: errors,
    suggestions: suggestions
  };
}

async function checkExportCompliance(pluginPath) {
  const errors = [];
  const suggestions = [];

  // Check index.js exports
  const indexPath = path.join(pluginPath, 'index.js');
  if (fs.existsSync(indexPath)) {
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    
    // Check for sequence export
    const hasSequenceExport = /sequence:\s*\(\)\s*=>\s*\w+\./.test(indexContent) ||
                             /__export\([^)]*,\s*\{[^}]*sequence:/.test(indexContent);
    
    if (!hasSequenceExport) {
      errors.push("CRITICAL: index.js missing required 'sequence' export");
      suggestions.push("Add sequence export: sequence: () => SEQUENCE_NAME");
    }

    // Check for CIA plugin export
    const hasCiaPlugin = /var\s+\w*Plugin\s*=\s*\{[^}]*mount[^}]*\}/.test(indexContent) ||
                        /stdin_default\s*=\s*\w*Plugin/.test(indexContent) ||
                        /default:\s*\(\)\s*=>\s*\w*Plugin/.test(indexContent);
    
    if (!hasCiaPlugin) {
      errors.push("CRITICAL: index.js missing CIA-compliant plugin interface");
      suggestions.push("Add CIA plugin with mount/unmount methods");
    }
  }

  return {
    passed: errors.length === 0,
    errors: errors,
    suggestions: suggestions
  };
}

async function checkDirectoryStructure(pluginPath) {
  const warnings = [];
  
  // Check for common plugin subdirectories
  const commonDirs = ['handlers', 'logic', 'hooks', 'components'];
  const foundDirs = [];
  
  for (const dir of commonDirs) {
    const dirPath = path.join(pluginPath, dir);
    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
      foundDirs.push(dir);
    }
  }

  if (foundDirs.length === 0) {
    warnings.push("Plugin has minimal structure - consider organizing code into subdirectories");
  }

  return {
    passed: true, // Structure warnings don't fail validation
    warnings: warnings,
    foundDirectories: foundDirs
  };
}

async function getDirectoryFiles(pluginPath) {
  try {
    const files = fs.readdirSync(pluginPath);
    return files.filter(file => {
      const filePath = path.join(pluginPath, file);
      return fs.statSync(filePath).isFile();
    });
  } catch (error) {
    return [];
  }
}
