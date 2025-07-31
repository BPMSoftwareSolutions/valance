
import fs from 'fs/promises';
import path from 'path';
import { loadPlugins } from './pluginLoader.js';

// Cache for loaded plugin evaluators
const pluginCache = new Map();

// Built-in operators
const builtInOperators = {
  mustContain: (content, pattern) => {
    const regex = new RegExp(pattern, 'i');
    return regex.test(content);
  },
  
  matchesPattern: (content, pattern) => {
    const regex = new RegExp(pattern, 'gm');
    return regex.test(content);
  },
  
  fileExists: async (filePath) => {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  },
  
  hasExtension: (filePath, extensions) => {
    const ext = path.extname(filePath).toLowerCase();
    return extensions.includes(ext);
  }
};

export async function runValidators(validators, files) {
  const results = [];
  const customOperators = await loadPlugins();
  const allOperators = { ...builtInOperators, ...customOperators };
  
  for (const validator of validators) {
    try {
      const result = await runSingleValidator(validator, files, allOperators);
      results.push(result);
    } catch (error) {
      results.push({
        validator: validator.name,
        passed: false,
        message: `Validation error: ${error.message}`,
        details: []
      });
    }
  }
  
  return results;
}

async function executePluginRule(content, rule, context) {
  try {
    const pluginName = rule.plugin;

    // Check cache first
    if (pluginCache.has(pluginName)) {
      const plugin = pluginCache.get(pluginName);
      return await plugin.evaluate(content, rule, context);
    }

    // Load plugin dynamically - try architecture-specific path first
    let pluginPath;
    let plugin;

    // Try architecture-specific paths first (SPA/, AppCore/, etc.)
    const architecturePaths = [
      `plugins/SPA/${pluginName.replace('validateSpa', 'validate')}.js`,
      `plugins/AppCore/${pluginName.replace('validateAppCore', 'validate')}.js`,
      `plugins/Backend/${pluginName.replace('validateBackend', 'validate')}.js`,
      `plugins/Shared/${pluginName.replace('validateShared', 'validate')}.js`,
      `plugins/CIA/${pluginName.replace('validateCia', 'validate')}.js`,
      `plugins/${pluginName}.js` // Fallback to legacy path
    ];

    for (const tryPath of architecturePaths) {
      try {
        pluginPath = path.resolve(tryPath);
        plugin = await import(`file://${pluginPath.replace(/\\/g, '/')}`);
        break;
      } catch (error) {
        // Continue to next path
        continue;
      }
    }

    if (!plugin) {
      throw new Error(`Plugin ${pluginName} not found in any architecture directory`);
    }

    if (!plugin.evaluate || typeof plugin.evaluate !== 'function') {
      throw new Error(`Plugin ${pluginName} must export an 'evaluate' function`);
    }

    // Cache the plugin for future use
    pluginCache.set(pluginName, plugin);

    // Execute the plugin evaluator
    return await plugin.evaluate(content, rule, context);

  } catch (error) {
    return {
      passed: false,
      message: `Plugin execution error: ${error.message}`
    };
  }
}

async function runSingleValidator(validator, files, operators) {
  const { name, type, rules, filePattern } = validator;
  
  // Filter files based on validator's file pattern
  let targetFiles = files;
  if (filePattern) {
    const regex = new RegExp(filePattern);
    targetFiles = files.filter(file => regex.test(file));
  }
  
  const details = [];
  let passed = true;
  
  switch (type) {
    case 'content':
      for (const file of targetFiles) {
        const result = await validateFileContent(file, rules, operators);
        if (!result.passed) {
          passed = false;
          details.push(`${file}: ${result.message}`);
        }
      }
      break;
      
    case 'structure':
      const structureResult = await validateStructure(targetFiles, rules, operators);
      passed = structureResult.passed;
      details.push(...structureResult.details);
      break;
      
    case 'naming':
      for (const file of targetFiles) {
        const result = await validateNaming(file, rules, operators);
        if (!result.passed) {
          passed = false;
          details.push(`${file}: ${result.message}`);
        }
      }
      break;
      
    default:
      throw new Error(`Unknown validator type: ${type}`);
  }
  
  return {
    validator: name,
    passed,
    message: passed ? 'All checks passed' : 'Some checks failed',
    details
  };
}

async function validateFileContent(filePath, rules, operators) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');

    for (const rule of rules) {
      // Check if this rule uses a plugin-based evaluator
      if (rule.plugin) {
        const result = await executePluginRule(content, rule, { filePath });
        if (!result.passed) {
          return {
            passed: false,
            message: result.message || `Failed plugin ${rule.plugin} check`
          };
        }
      } else {
        // Use traditional operator-based validation
        const { operator, value, message } = rule;
        const operatorFn = operators[operator];

        if (!operatorFn) {
          throw new Error(`Unknown operator: ${operator}`);
        }

        const result = await operatorFn(content, value);
        if (!result) {
          return {
            passed: false,
            message: message || `Failed ${operator} check`
          };
        }
      }
    }

    return { passed: true };
  } catch (error) {
    return {
      passed: false,
      message: `Error reading file: ${error.message}`
    };
  }
}

async function validateStructure(files, rules, operators) {
  const details = [];
  let passed = true;

  for (const rule of rules) {
    if (rule.plugin) {
      // For structure validation, we pass the files array as content
      const result = await executePluginRule(files, rule, { type: 'structure' });
      if (!result.passed) {
        passed = false;
        details.push(result.message || `Failed plugin ${rule.plugin} check`);
      }
    } else {
      const { operator, value, message } = rule;
      const operatorFn = operators[operator];

      if (!operatorFn) {
        throw new Error(`Unknown operator: ${operator}`);
      }

      const result = await operatorFn(files, value);
      if (!result) {
        passed = false;
        details.push(message || `Failed ${operator} check`);
      }
    }
  }

  return { passed, details };
}

async function validateNaming(filePath, rules, operators) {
  const fileName = path.basename(filePath);

  for (const rule of rules) {
    if (rule.plugin) {
      // For naming validation, we pass the filename as content
      const result = await executePluginRule(fileName, rule, { filePath, type: 'naming' });
      if (!result.passed) {
        return {
          passed: false,
          message: result.message || `Failed plugin ${rule.plugin} check`
        };
      }
    } else {
      const { operator, value, message } = rule;
      const operatorFn = operators[operator];

      if (!operatorFn) {
        throw new Error(`Unknown operator: ${operator}`);
      }

      const result = await operatorFn(fileName, value);
      if (!result) {
        return {
          passed: false,
          message: message || `Failed ${operator} check`
        };
      }
    }
  }

  return { passed: true };
}

