# Writing a Plugin (JS)

Create custom JavaScript plugins to implement complex validation logic that goes beyond built-in operators.

## Plugin Interface

Every plugin must export two things:

```javascript
// plugins/myPlugin.js
export const operator = "myPluginName";

export async function evaluate(content, rule, context) {
  // Your validation logic here
  return {
    passed: boolean,
    message?: string
  };
}
```

## Basic Plugin Example

### Simple Content Validator
```javascript
// plugins/validateExports.js
export const operator = "validateExports";

export async function evaluate(content, rule, context) {
  try {
    // Check if file has proper exports
    const hasDefaultExport = /export\s+default/.test(content);
    const hasNamedExports = /export\s+\{/.test(content);
    
    if (!hasDefaultExport && !hasNamedExports) {
      return {
        passed: false,
        message: "File must have at least one export (default or named)"
      };
    }
    
    return {
      passed: true,
      message: "Export validation passed"
    };
    
  } catch (error) {
    return {
      passed: false,
      message: `Plugin error: ${error.message}`
    };
  }
}
```

### Using the Plugin
```json
// validators/export-validation.json
{
  "name": "export-validation",
  "description": "Ensures files have proper exports",
  "type": "content",
  "filePattern": ".*\\.(js|ts)$",
  "rules": [
    {
      "plugin": "validateExports",
      "message": "Export validation failed"
    }
  ]
}
```

## Advanced Plugin Examples

### Sequence Validation Plugin
```javascript
// plugins/validateSequenceRequiredFields.js
import { parseSequenceFromContent } from './sequenceParser.js';

export const operator = "validateSequenceRequiredFields";

export async function evaluate(content, rule, context) {
  try {
    const sequence = parseSequenceFromContent(content);
    
    if (!sequence) {
      return {
        passed: false,
        message: "Could not parse sequence object from content"
      };
    }

    const errors = [];

    // Validate required fields
    if (!sequence.name || sequence.name.trim() === '') {
      errors.push("Sequence name is required");
    }

    if (!sequence.description || sequence.description.trim() === '') {
      errors.push("Sequence description is required");
    }

    if (!sequence.key || sequence.key.trim() === '') {
      errors.push("Musical key is required");
    }

    if (!sequence.tempo || sequence.tempo <= 0) {
      errors.push("Tempo must be greater than 0");
    }

    if (!sequence.movements || !Array.isArray(sequence.movements) || sequence.movements.length === 0) {
      errors.push("Sequence must have at least one movement");
    }

    if (errors.length > 0) {
      return {
        passed: false,
        message: `Required fields validation failed: ${errors.join(', ')}`
      };
    }

    return {
      passed: true,
      message: "All required fields are present and valid"
    };

  } catch (error) {
    return {
      passed: false,
      message: `Plugin error: ${error.message}`
    };
  }
}
```

### Configuration-Aware Plugin
```javascript
// plugins/validateImportRestrictions.js
import { loadConfig } from './sequenceParser.js';

export const operator = "validateImportRestrictions";

export async function evaluate(content, rule, context) {
  try {
    const config = await loadConfig();
    const forbiddenImports = rule.forbiddenImports || config.forbiddenImports || [];
    const allowedImports = rule.allowedImports || config.allowedImports || [];
    
    const errors = [];
    
    // Check for forbidden imports
    for (const forbidden of forbiddenImports) {
      const regex = new RegExp(`import.*from\\s+['"]${forbidden}['"]`, 'g');
      if (regex.test(content)) {
        errors.push(`Forbidden import: ${forbidden}`);
      }
    }
    
    // If allowedImports is specified, ensure only those are used
    if (allowedImports.length > 0) {
      const importMatches = content.match(/import.*from\s+['"]([^'"]+)['"]/g) || [];
      
      for (const match of importMatches) {
        const importPath = match.match(/from\s+['"]([^'"]+)['"]/)[1];
        
        if (!allowedImports.some(allowed => importPath.startsWith(allowed))) {
          errors.push(`Import not in allowed list: ${importPath}`);
        }
      }
    }
    
    return {
      passed: errors.length === 0,
      message: errors.length > 0 ? errors.join(', ') : 'All imports are valid'
    };
    
  } catch (error) {
    return {
      passed: false,
      message: `Plugin error: ${error.message}`
    };
  }
}
```

## Plugin Parameters

Plugins can receive configuration through the rule object:

### Plugin with Parameters
```javascript
// plugins/validateComplexity.js
export const operator = "validateComplexity";

export async function evaluate(content, rule, context) {
  try {
    const maxLines = rule.maxLines || 100;
    const maxFunctions = rule.maxFunctions || 10;
    const maxComplexity = rule.maxComplexity || 10;
    
    const lines = content.split('\n').length;
    const functions = (content.match(/function\s+\w+/g) || []).length;
    
    // Simple cyclomatic complexity approximation
    const complexity = (content.match(/if|else|while|for|switch|case|\?/g) || []).length;
    
    const errors = [];
    
    if (lines > maxLines) {
      errors.push(`File too long: ${lines} lines (max: ${maxLines})`);
    }
    
    if (functions > maxFunctions) {
      errors.push(`Too many functions: ${functions} (max: ${maxFunctions})`);
    }
    
    if (complexity > maxComplexity) {
      errors.push(`Complexity too high: ${complexity} (max: ${maxComplexity})`);
    }
    
    return {
      passed: errors.length === 0,
      message: errors.length > 0 ? errors.join(', ') : 'Complexity within limits'
    };
    
  } catch (error) {
    return {
      passed: false,
      message: `Plugin error: ${error.message}`
    };
  }
}
```

### Using Parameters
```json
{
  "name": "complexity-check",
  "description": "Validates code complexity metrics",
  "type": "content",
  "filePattern": ".*\\.(js|ts)$",
  "rules": [
    {
      "plugin": "validateComplexity",
      "maxLines": 150,
      "maxFunctions": 15,
      "maxComplexity": 12,
      "message": "Code complexity validation failed"
    }
  ]
}
```

## Context Object

The context object provides additional information about the validation:

```javascript
export async function evaluate(content, rule, context) {
  // context contains:
  // - filePath: string - path to the file being validated
  // - type: string - validation type ('content', 'structure', 'naming')
  
  console.log(`Validating file: ${context.filePath}`);
  console.log(`Validation type: ${context.type}`);
  
  // Use context for file-specific logic
  if (context.filePath.includes('test')) {
    // Different validation for test files
  }
  
  // Your validation logic here
}
```

## Shared Utilities

Create shared utilities for common functionality:

### Parser Utility
```javascript
// plugins/sequenceParser.js
export function parseSequenceFromContent(content) {
  try {
    // Try to execute the JavaScript and extract the sequence
    const moduleExports = {};
    const mockModule = { exports: moduleExports };
    
    // Replace export statements with assignments
    let modifiedContent = content
      .replace(/export\s+const\s+(\w+)\s*=\s*/g, 'moduleExports.$1 = ');
    
    // Execute the modified content
    const func = new Function('moduleExports', 'module', modifiedContent + '\nreturn moduleExports;');
    const result = func(moduleExports, mockModule);
    
    return result.sequence || null;
    
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
    return getDefaultConfig();
  }
}

export function getDefaultConfig() {
  return {
    validation: {
      minTempo: 60,
      maxTempo: 200,
      requiredTimeSignature: "4/4"
    },
    musicalKeys: ["C Major", "D Major", "E Major"],
    forbiddenImports: ["lodash", "moment"],
    allowedImports: ["react", "react-dom"]
  };
}
```

### Using Shared Utilities
```javascript
// plugins/validateSequenceBeats.js
import { parseSequenceFromContent, loadConfig } from './sequenceParser.js';

export const operator = "validateSequenceBeats";

export async function evaluate(content, rule, context) {
  const config = await loadConfig();
  const sequence = parseSequenceFromContent(content);
  
  // Use parsed sequence and config for validation
  // ...
}
```

## Error Handling

Always include comprehensive error handling:

```javascript
export async function evaluate(content, rule, context) {
  try {
    // Main validation logic
    
  } catch (error) {
    // Log error for debugging
    console.error(`Plugin ${operator} error:`, error);
    
    return {
      passed: false,
      message: `Plugin execution error: ${error.message}`
    };
  }
}
```

## Testing Plugins

### Create Test Files
```javascript
// test/plugin-test.js
export const sequence = {
  name: "Test Sequence",
  description: "A test sequence for plugin validation",
  key: "C Major",
  tempo: 120,
  movements: []
};
```

### Test Commands
```bash
# Test your plugin
node cli/cli.js --validator sequence-required-fields --files "test/plugin-test.js"

# Debug with verbose output
node cli/cli.js --validator sequence-required-fields --files "test/plugin-test.js" --format json
```

## Plugin Best Practices

### ✅ Do
- **Handle Errors Gracefully** - Always wrap in try-catch
- **Provide Clear Messages** - Specific, actionable error messages
- **Use Shared Utilities** - Reuse common parsing and config logic
- **Validate Input** - Check that content and rule parameters are valid
- **Document Parameters** - Comment what rule parameters are expected

### ❌ Don't
- **Ignore Errors** - Always handle and report errors
- **Use Synchronous I/O** - Use async/await for file operations
- **Hardcode Values** - Use configuration and rule parameters
- **Modify Global State** - Keep plugins pure and stateless
- **Skip Validation** - Always validate inputs and handle edge cases

## Plugin Templates

### Basic Plugin Template
```javascript
// plugins/myPlugin.js
export const operator = "myPlugin";

export async function evaluate(content, rule, context) {
  try {
    // Your validation logic here
    const isValid = true; // Replace with actual validation
    
    return {
      passed: isValid,
      message: isValid ? "Validation passed" : "Validation failed"
    };
    
  } catch (error) {
    return {
      passed: false,
      message: `Plugin error: ${error.message}`
    };
  }
}
```

### Configuration-Aware Template
```javascript
// plugins/configAwarePlugin.js
import { loadConfig } from './sequenceParser.js';

export const operator = "configAwarePlugin";

export async function evaluate(content, rule, context) {
  try {
    const config = await loadConfig();
    const ruleValue = rule.customValue || config.defaultValue || 'fallback';
    
    // Your validation logic using config and rule parameters
    
    return {
      passed: true,
      message: "Validation completed"
    };
    
  } catch (error) {
    return {
      passed: false,
      message: `Plugin error: ${error.message}`
    };
  }
}
```

## Next Steps

1. **[Learn Built-in Operators](Common-Operators-Explained)** - Understand when to use plugins vs operators
2. **[See Real Examples](Domain-Specific-Examples)** - Study production plugin implementations
3. **[Create Profiles](Domain-Specific-Examples#creating-profiles)** - Bundle your plugins with validators
4. **[Set up CI/CD](GitHub-Actions)** - Automate plugin-based validation

---

*Ready to explore built-in operators? Let's see what's available!*
