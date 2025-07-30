# Writing a Validator (JSON)

Learn how to create JSON validator definitions that define your architecture validation rules.

## Validator Structure

Every validator is a JSON file in the `validators/` directory with this structure:

```json
{
  "name": "validator-name",
  "description": "What this validator checks",
  "type": "content|structure|naming",
  "filePattern": "regex pattern for matching files",
  "rules": [
    {
      "operator": "built-in-operator",
      "value": "expected value",
      "message": "Error message if validation fails"
    }
  ]
}
```

## Validation Types

### Content Validation
Validates the contents of files against patterns or rules.

```json
{
  "name": "react-component-validation",
  "description": "Ensures React components follow best practices",
  "type": "content",
  "filePattern": ".*Component\\.(jsx|tsx)$",
  "rules": [
    {
      "operator": "mustContain",
      "value": "export default",
      "message": "React components must have a default export"
    },
    {
      "operator": "mustContain", 
      "value": "import React",
      "message": "React components must import React"
    }
  ]
}
```

### Structure Validation
Validates file organization and presence of required files.

```json
{
  "name": "module-structure",
  "description": "Ensures modules have required files",
  "type": "structure", 
  "filePattern": "src/modules/.*",
  "rules": [
    {
      "operator": "fileExists",
      "value": ["index.js", "README.md", "package.json"],
      "message": "Modules must have index.js, README.md, and package.json"
    }
  ]
}
```

### Naming Validation
Validates file and directory naming conventions.

```json
{
  "name": "component-naming",
  "description": "Enforces PascalCase for component files",
  "type": "naming",
  "filePattern": ".*Component\\.(jsx|tsx)$",
  "rules": [
    {
      "operator": "matchesPattern",
      "value": "^[A-Z][a-zA-Z0-9]*Component\\.(jsx|tsx)$",
      "message": "Component files must use PascalCase and end with 'Component'"
    }
  ]
}
```

## Built-in Operators

### mustContain
Checks if file content contains a specific string or pattern.

```json
{
  "operator": "mustContain",
  "value": "export const sequence",
  "message": "File must export a sequence constant"
}
```

### matchesPattern
Validates content against a regular expression.

```json
{
  "operator": "matchesPattern", 
  "value": "^export\\s+const\\s+\\w+\\s*=",
  "message": "File must start with an export statement"
}
```

### fileExists
Checks if required files exist (structure validation).

```json
{
  "operator": "fileExists",
  "value": ["index.js", "types.ts"],
  "message": "Module must have index.js and types.ts files"
}
```

### hasExtension
Validates file extensions (naming validation).

```json
{
  "operator": "hasExtension",
  "value": [".js", ".ts", ".jsx", ".tsx"],
  "message": "Only JavaScript/TypeScript files allowed"
}
```

## Advanced Examples

### Sequence Definition Validator
```json
{
  "name": "sequence-required-fields",
  "description": "Validates that sequence has all required fields",
  "type": "content",
  "filePattern": ".*sequence.*\\.(js|json)$",
  "rules": [
    {
      "plugin": "validateSequenceRequiredFields",
      "message": "Sequence required fields validation failed"
    }
  ]
}
```

### Import Restrictions
```json
{
  "name": "no-lodash-imports",
  "description": "Prevents importing lodash library",
  "type": "content",
  "filePattern": ".*\\.(js|ts|jsx|tsx)$",
  "rules": [
    {
      "operator": "mustNotContain",
      "value": "import.*from.*['\"]lodash['\"]",
      "message": "Use native JavaScript instead of lodash"
    }
  ]
}
```

### Documentation Requirements
```json
{
  "name": "component-documentation",
  "description": "Ensures components have proper documentation",
  "type": "content",
  "filePattern": ".*Component\\.(jsx|tsx)$",
  "rules": [
    {
      "operator": "mustContain",
      "value": "/**",
      "message": "Components must have JSDoc comments"
    },
    {
      "operator": "mustContain",
      "value": "@param",
      "message": "Components must document their props"
    }
  ]
}
```

## File Pattern Examples

### Common Patterns
```json
// All JavaScript files
"filePattern": ".*\\.(js|jsx)$"

// TypeScript files only
"filePattern": ".*\\.(ts|tsx)$"

// Component files
"filePattern": ".*Component\\.(jsx|tsx)$"

// Test files
"filePattern": ".*\\.(test|spec)\\.(js|ts)$"

// Specific directories
"filePattern": "src/components/.*"

// Sequence files
"filePattern": ".*sequence.*\\.(js|ts|json)$"
```

### Complex Patterns
```json
// Files in specific subdirectories
"filePattern": "(src|lib)/.*\\.(js|ts)$"

// Exclude test files
"filePattern": "^(?!.*\\.(test|spec)\\.).*\\.(js|ts)$"

// Only files with specific naming
"filePattern": ".*[A-Z][a-zA-Z]*\\.(js|ts)$"
```

## Multiple Rules

Validators can have multiple rules that all must pass:

```json
{
  "name": "comprehensive-component-check",
  "description": "Complete component validation",
  "type": "content",
  "filePattern": ".*Component\\.(jsx|tsx)$",
  "rules": [
    {
      "operator": "mustContain",
      "value": "import React",
      "message": "Must import React"
    },
    {
      "operator": "mustContain",
      "value": "export default",
      "message": "Must have default export"
    },
    {
      "operator": "matchesPattern",
      "value": "function\\s+\\w+Component",
      "message": "Must be a function component"
    },
    {
      "operator": "mustNotContain",
      "value": "class.*extends.*Component",
      "message": "Use function components, not class components"
    }
  ]
}
```

## Plugin-Based Rules

For complex validation logic, use plugins:

```json
{
  "name": "sequence-beats-validation",
  "description": "Validates beat structure and dependencies",
  "type": "content", 
  "filePattern": ".*sequence.*\\.(js|ts)$",
  "rules": [
    {
      "plugin": "validateSequenceBeats",
      "includeWarnings": false,
      "message": "Sequence beats validation failed"
    }
  ]
}
```

## Testing Your Validator

### 1. Create Test Files
```javascript
// test/valid-component.jsx
import React from 'react';

export default function TestComponent() {
  return <div>Test</div>;
}

// test/invalid-component.jsx  
function TestComponent() {
  return <div>Test</div>;
}
// Missing React import and default export
```

### 2. Test the Validator
```bash
# Test with valid file
node cli/cli.js --validator react-component-validation --files "test/valid-component.jsx"
# ✅ PASS

# Test with invalid file
node cli/cli.js --validator react-component-validation --files "test/invalid-component.jsx"
# ❌ FAIL - Must import React
```

### 3. Debug with Dry Run
```bash
node cli/cli.js --validator react-component-validation --files "test/**/*.jsx" --dry-run
```

## Best Practices

### ✅ Do
- **Clear Names** - Use descriptive validator names
- **Specific Patterns** - Target exact file types you want to validate
- **Helpful Messages** - Provide actionable error messages
- **Test Thoroughly** - Test with both valid and invalid files

### ❌ Don't
- **Overly Broad Patterns** - Avoid matching unintended files
- **Vague Messages** - Don't use generic error messages
- **Too Many Rules** - Keep validators focused on specific concerns
- **Complex Logic in JSON** - Use plugins for complex validation

## Common Validator Templates

### Basic Content Validator
```json
{
  "name": "my-validator",
  "description": "Validates specific content requirements",
  "type": "content",
  "filePattern": ".*\\.js$",
  "rules": [
    {
      "operator": "mustContain",
      "value": "required-pattern",
      "message": "File must contain required pattern"
    }
  ]
}
```

### File Structure Validator
```json
{
  "name": "my-structure-validator", 
  "description": "Ensures required files exist",
  "type": "structure",
  "filePattern": "src/.*",
  "rules": [
    {
      "operator": "fileExists",
      "value": ["index.js"],
      "message": "Directory must have index.js"
    }
  ]
}
```

## Next Steps

1. **[Learn About Plugins](Writing-a-Plugin-JS.md)** - Add custom validation logic
2. **[Explore Built-in Operators](Common-Operators-Explained.md)** - See all available operators
3. **[Create Profiles](Domain-Specific-Examples.md#creating-profiles)** - Bundle validators together
4. **[Set up CI/CD](../CI-CD%20Integration/GitHub-Actions.md)** - Automate your validation

---

*Ready to add custom logic? Let's create a plugin!*
