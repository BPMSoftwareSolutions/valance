import fs from 'fs/promises';
import path from 'path';

export const operator = "validatePluginDirectory";

export async function evaluate(content, rule, context) {
  try {
    const filePath = context.filePath;
    if (!filePath || typeof filePath !== 'string') {
      return {
        passed: true,
        message: "No valid file path provided, skipping plugin directory validation"
      };
    }

    const errors = [];
    const warnings = [];

    // Check if this is a plugin directory by looking for manifest.json
    const dirPath = path.dirname(filePath);
    const manifestPath = path.join(dirPath, 'manifest.json');
    
    let isPluginDirectory = false;
    try {
      await fs.access(manifestPath);
      isPluginDirectory = true;
    } catch {
      // Not a plugin directory, check if parent directories are plugin directories
      const parentDir = path.dirname(dirPath);
      const parentManifestPath = path.join(parentDir, 'manifest.json');
      try {
        await fs.access(parentManifestPath);
        isPluginDirectory = true;
      } catch {
        // Not in a plugin directory
      }
    }

    if (!isPluginDirectory) {
      return {
        passed: true,
        message: "Not a plugin directory, skipping plugin directory validation"
      };
    }

    const pluginDir = isPluginDirectory ? dirPath : path.dirname(dirPath);
    const pluginName = path.basename(pluginDir);

    // Check domain-based naming convention
    if (rule.checkDomainNaming) {
      const namingValidation = validateDomainNaming(pluginName, rule);
      if (!namingValidation.passed) {
        errors.push(namingValidation.message);
      }
    }

    // Validate runtime purity (no TypeScript files)
    if (rule.validateRuntimePurity) {
      const purityValidation = await validateRuntimePurity(pluginDir, rule);
      if (!purityValidation.passed) {
        errors.push(purityValidation.message);
      }
      if (purityValidation.warnings) {
        warnings.push(...purityValidation.warnings);
      }
    }

    // Check required files
    if (rule.checkRequiredFiles) {
      const filesValidation = await validateRequiredFiles(pluginDir, rule);
      if (!filesValidation.passed) {
        errors.push(filesValidation.message);
      }
    }

    // Validate directory structure
    if (rule.validateDirectoryStructure) {
      const structureValidation = await validateDirectoryStructure(pluginDir, rule);
      if (!structureValidation.passed) {
        warnings.push(structureValidation.message);
      }
    }

    if (errors.length > 0) {
      return {
        passed: false,
        message: `Plugin directory validation failed for ${pluginName}: ${errors.join('; ')}`
      };
    }

    return {
      passed: true,
      message: `Plugin directory validation passed for ${pluginName}`,
      warnings: warnings.length > 0 ? warnings : undefined
    };

  } catch (error) {
    return {
      passed: false,
      message: `Plugin directory validation error: ${error.message}`
    };
  }
}

function validateDomainNaming(pluginName, rule) {
  const namingPattern = new RegExp(rule.domainNamingPattern || 
    "^[A-Z][a-zA-Z0-9]*\\.[a-z][a-z0-9-]*-symphony$");

  if (!namingPattern.test(pluginName)) {
    return {
      passed: false,
      message: `Plugin name '${pluginName}' doesn't follow Domain.functionality-symphony convention`
    };
  }

  return {
    passed: true,
    message: `Plugin name '${pluginName}' follows domain-based naming convention`
  };
}

async function validateRuntimePurity(pluginDir, rule) {
  const errors = [];
  const warnings = [];
  const forbiddenExtensions = rule.runtimePurityRules?.forbiddenExtensions || ['.ts', '.tsx', '.d.ts'];
  const excludePatterns = rule.runtimePurityRules?.excludePatterns || ['node_modules/', '.git/', 'tests/'];

  try {
    const typeScriptFiles = await findTypeScriptFiles(pluginDir, forbiddenExtensions, excludePatterns);
    
    if (typeScriptFiles.length > 0) {
      errors.push(`Found ${typeScriptFiles.length} TypeScript files in runtime plugin directory: ${typeScriptFiles.slice(0, 5).join(', ')}${typeScriptFiles.length > 5 ? '...' : ''}`);
    } else {
      warnings.push("Runtime purity maintained - no TypeScript files found");
    }

  } catch (error) {
    errors.push(`Error checking runtime purity: ${error.message}`);
  }

  return {
    passed: errors.length === 0,
    message: errors.length > 0 ? errors.join('; ') : "Runtime purity validation passed",
    warnings: warnings.length > 0 ? warnings : undefined
  };
}

async function findTypeScriptFiles(dir, forbiddenExtensions, excludePatterns) {
  const typeScriptFiles = [];
  
  async function scanDirectory(currentDir) {
    try {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        const relativePath = path.relative(dir, fullPath);
        
        // Skip excluded patterns
        if (excludePatterns.some(pattern => relativePath.includes(pattern))) {
          continue;
        }
        
        if (entry.isDirectory()) {
          await scanDirectory(fullPath);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (forbiddenExtensions.includes(ext)) {
            typeScriptFiles.push(relativePath);
          }
        }
      }
    } catch (error) {
      // Directory might not exist or be accessible
    }
  }
  
  await scanDirectory(dir);
  return typeScriptFiles;
}

async function validateRequiredFiles(pluginDir, rule) {
  const requiredFiles = rule.requiredFiles || ['manifest.json', 'index.js', 'sequence.js'];
  const missingFiles = [];

  for (const requiredFile of requiredFiles) {
    const filePath = path.join(pluginDir, requiredFile);
    try {
      await fs.access(filePath);
    } catch {
      missingFiles.push(requiredFile);
    }
  }

  if (missingFiles.length > 0) {
    return {
      passed: false,
      message: `Missing required files: ${missingFiles.join(', ')}`
    };
  }

  return {
    passed: true,
    message: "All required files present"
  };
}

async function validateDirectoryStructure(pluginDir, rule) {
  const warnings = [];
  const optionalDirectories = rule.optionalDirectories || ['handlers/', 'hooks/', 'logic/', 'components/'];

  for (const optionalDir of optionalDirectories) {
    const dirPath = path.join(pluginDir, optionalDir);
    try {
      const stat = await fs.stat(dirPath);
      if (stat.isDirectory()) {
        warnings.push(`Found optional directory: ${optionalDir}`);
      }
    } catch {
      // Directory doesn't exist, which is fine for optional directories
    }
  }

  return {
    passed: true,
    message: "Directory structure validation completed",
    warnings: warnings.length > 0 ? warnings : undefined
  };
}
