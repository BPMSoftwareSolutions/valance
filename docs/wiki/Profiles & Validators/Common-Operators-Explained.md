# Common Operators Explained

Valence includes built-in operators for common validation scenarios. Use these before creating custom plugins.

## Content Operators

### mustContain
Checks if file content contains a specific string or pattern.

```json
{
  "operator": "mustContain",
  "value": "export default",
  "message": "File must have a default export"
}
```

**Use Cases:**
- Ensure required imports exist
- Validate presence of specific code patterns
- Check for required comments or documentation

**Examples:**
```json
// Check for React import
{
  "operator": "mustContain",
  "value": "import React",
  "message": "React components must import React"
}

// Ensure JSDoc comments
{
  "operator": "mustContain", 
  "value": "/**",
  "message": "Functions must have JSDoc comments"
}

// Validate sequence export
{
  "operator": "mustContain",
  "value": "export const sequence",
  "message": "File must export a sequence constant"
}
```

### mustNotContain
Checks that file content does NOT contain a specific string or pattern.

```json
{
  "operator": "mustNotContain",
  "value": "console.log",
  "message": "Remove console.log statements before production"
}
```

**Use Cases:**
- Prevent debugging code in production
- Enforce coding standards
- Block deprecated patterns

**Examples:**
```json
// No console statements
{
  "operator": "mustNotContain",
  "value": "console\\.",
  "message": "Remove console statements"
}

// No jQuery usage
{
  "operator": "mustNotContain",
  "value": "\\$\\(",
  "message": "Use modern JavaScript instead of jQuery"
}

// No class components
{
  "operator": "mustNotContain",
  "value": "class.*extends.*Component",
  "message": "Use function components instead of class components"
}
```

### matchesPattern
Validates content against a regular expression pattern.

```json
{
  "operator": "matchesPattern",
  "value": "^export\\s+const\\s+\\w+\\s*=",
  "message": "File must start with an export statement"
}
```

**Use Cases:**
- Validate specific code structure
- Enforce naming conventions in content
- Check format compliance

**Examples:**
```json
// Function naming convention
{
  "operator": "matchesPattern",
  "value": "function\\s+[A-Z][a-zA-Z]*\\(",
  "message": "Functions must use PascalCase naming"
}

// Sequence structure
{
  "operator": "matchesPattern",
  "value": "tempo:\\s*\\d+",
  "message": "Sequence must have numeric tempo"
}

// Import statement format
{
  "operator": "matchesPattern",
  "value": "import\\s+\\{[^}]+\\}\\s+from\\s+['\"][^'\"]+['\"]",
  "message": "Use named imports with proper formatting"
}
```

## Structure Operators

### fileExists
Checks if required files exist in the directory structure.

```json
{
  "operator": "fileExists",
  "value": ["index.js", "README.md", "package.json"],
  "message": "Module must have index.js, README.md, and package.json"
}
```

**Use Cases:**
- Ensure required module files exist
- Validate project structure
- Check for configuration files

**Examples:**
```json
// Component structure
{
  "operator": "fileExists",
  "value": ["Component.jsx", "Component.test.js", "index.js"],
  "message": "Components must have implementation, test, and index files"
}

// Documentation requirements
{
  "operator": "fileExists",
  "value": ["README.md", "CHANGELOG.md"],
  "message": "Projects must have README and CHANGELOG"
}

// Configuration files
{
  "operator": "fileExists",
  "value": [".eslintrc.js", ".prettierrc"],
  "message": "Projects must have ESLint and Prettier configuration"
}
```

### directoryExists
Checks if required directories exist.

```json
{
  "operator": "directoryExists",
  "value": ["src", "test", "docs"],
  "message": "Project must have src, test, and docs directories"
}
```

**Use Cases:**
- Validate project structure
- Ensure required directories exist
- Check for standard layouts

## Naming Operators

### hasExtension
Validates that files have specific extensions.

```json
{
  "operator": "hasExtension",
  "value": [".js", ".ts", ".jsx", ".tsx"],
  "message": "Only JavaScript/TypeScript files allowed"
}
```

**Use Cases:**
- Restrict file types in directories
- Ensure consistent file extensions
- Validate naming conventions

**Examples:**
```json
// Component files
{
  "operator": "hasExtension",
  "value": [".jsx", ".tsx"],
  "message": "React components must use .jsx or .tsx extension"
}

// Test files
{
  "operator": "hasExtension",
  "value": [".test.js", ".spec.js"],
  "message": "Test files must use .test.js or .spec.js extension"
}

// Configuration files
{
  "operator": "hasExtension",
  "value": [".json", ".js"],
  "message": "Config files must be JSON or JavaScript"
}
```

### matchesNamingPattern
Validates file names against a pattern.

```json
{
  "operator": "matchesNamingPattern",
  "value": "^[A-Z][a-zA-Z0-9]*Component\\.(jsx|tsx)$",
  "message": "Component files must use PascalCase and end with 'Component'"
}
```

**Use Cases:**
- Enforce naming conventions
- Validate file naming patterns
- Ensure consistency across projects

**Examples:**
```json
// PascalCase components
{
  "operator": "matchesNamingPattern",
  "value": "^[A-Z][a-zA-Z0-9]*\\.(jsx|tsx)$",
  "message": "Component files must use PascalCase"
}

// kebab-case utilities
{
  "operator": "matchesNamingPattern",
  "value": "^[a-z][a-z0-9-]*\\.js$",
  "message": "Utility files must use kebab-case"
}

// Test file naming
{
  "operator": "matchesNamingPattern",
  "value": "^[a-zA-Z0-9-]+\\.(test|spec)\\.(js|ts)$",
  "message": "Test files must follow naming convention"
}
```

## Advanced Operators

### containsAllOf
Checks that content contains ALL specified patterns.

```json
{
  "operator": "containsAllOf",
  "value": ["import React", "export default", "function"],
  "message": "React components must import React, export default, and be functions"
}
```

### containsAnyOf
Checks that content contains AT LEAST ONE of the specified patterns.

```json
{
  "operator": "containsAnyOf",
  "value": ["class", "function", "const.*=.*=>"],
  "message": "File must contain a class, function, or arrow function"
}
```

### lineCount
Validates the number of lines in a file.

```json
{
  "operator": "lineCount",
  "value": {"min": 10, "max": 500},
  "message": "Files must be between 10 and 500 lines"
}
```

## Operator Combinations

You can combine multiple operators in a single validator:

```json
{
  "name": "react-component-validation",
  "description": "Comprehensive React component validation",
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
      "operator": "mustNotContain",
      "value": "class.*extends",
      "message": "Use function components, not class components"
    },
    {
      "operator": "matchesPattern",
      "value": "function\\s+\\w+Component",
      "message": "Must be a function component"
    }
  ]
}
```

## When to Use Operators vs Plugins

### Use Built-in Operators When:
- ✅ Simple string/pattern matching
- ✅ File existence checks
- ✅ Basic naming validation
- ✅ Standard content validation

### Use Plugins When:
- 🔌 Complex parsing required (JSON, AST)
- 🔌 Cross-file validation
- 🔌 Configuration-dependent logic
- 🔌 Business-specific rules
- 🔌 Multi-step validation processes

## Operator Reference

| Operator | Type | Purpose | Value Type |
|----------|------|---------|------------|
| `mustContain` | Content | String must be present | string |
| `mustNotContain` | Content | String must NOT be present | string |
| `matchesPattern` | Content | Content matches regex | string (regex) |
| `containsAllOf` | Content | All patterns present | array of strings |
| `containsAnyOf` | Content | At least one pattern present | array of strings |
| `fileExists` | Structure | Required files exist | array of strings |
| `directoryExists` | Structure | Required directories exist | array of strings |
| `hasExtension` | Naming | File has specific extension | array of strings |
| `matchesNamingPattern` | Naming | Filename matches pattern | string (regex) |
| `lineCount` | Content | File has specific line count | object {min, max} |

## Common Patterns

### React Component Validation
```json
{
  "rules": [
    {"operator": "mustContain", "value": "import React"},
    {"operator": "mustContain", "value": "export default"},
    {"operator": "hasExtension", "value": [".jsx", ".tsx"]},
    {"operator": "matchesNamingPattern", "value": "^[A-Z][a-zA-Z0-9]*\\.(jsx|tsx)$"}
  ]
}
```

### Module Structure Validation
```json
{
  "rules": [
    {"operator": "fileExists", "value": ["index.js", "README.md"]},
    {"operator": "directoryExists", "value": ["src", "test"]},
    {"operator": "mustContain", "value": "export"}
  ]
}
```

### Code Quality Validation
```json
{
  "rules": [
    {"operator": "mustNotContain", "value": "console\\.log"},
    {"operator": "mustNotContain", "value": "debugger"},
    {"operator": "mustContain", "value": "/**"},
    {"operator": "lineCount", "value": {"max": 300}}
  ]
}
```

## Testing Operators

```bash
# Test single operator
node cli/cli.js --validator my-validator --files "test/sample.js"

# Debug with dry run
node cli/cli.js --validator my-validator --files "test/**/*.js" --dry-run

# Get detailed output
node cli/cli.js --validator my-validator --files "test/sample.js" --format json
```

## Next Steps

1. **[See Real Examples](Domain-Specific-Examples)** - Study operator usage in production
2. **[Create Complex Validators](Writing-a-Validator-JSON)** - Combine operators effectively
3. **[Write Plugins](Writing-a-Plugin-JS)** - When operators aren't enough
4. **[Build Profiles](Domain-Specific-Examples#creating-profiles)** - Bundle validators together

---

*Ready to see operators in action? Let's explore real-world examples!*
