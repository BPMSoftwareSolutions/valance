# Adding Validators

Contribute new validators to the Valence ecosystem and help expand architecture validation capabilities.

## Contribution Process

### 1. Identify the Need
Before creating a new validator, consider:
- **Is there an existing validator** that covers this use case?
- **Would a plugin** be more appropriate for complex logic?
- **Is this validator** reusable across different projects?
- **Does it follow** Valence design principles?

### 2. Design the Validator
Plan your validator structure:
```json
{
  "name": "descriptive-validator-name",
  "description": "Clear description of what this validates",
  "type": "content|structure|naming",
  "filePattern": "regex pattern for target files",
  "rules": [
    {
      "operator": "built-in-operator",
      "value": "expected value",
      "message": "Helpful error message"
    }
  ]
}
```

### 3. Create Test Cases
Always include test files:
```
validators/
├── my-new-validator.json
test/
├── valid-example.js      # Should pass validation
├── invalid-example.js    # Should fail validation
└── edge-case-example.js  # Edge cases
```

### 4. Submit Pull Request
Follow the standard GitHub contribution workflow:
1. Fork the repository
2. Create a feature branch
3. Add validator and tests
4. Update documentation
5. Submit pull request

## Validator Categories

### Content Validators
Validate file contents against patterns or rules.

**Good for:**
- Code pattern enforcement
- Import/export validation
- Documentation requirements
- Security checks

**Example Contribution:**
```json
// validators/jsx-accessibility.json
{
  "name": "jsx-accessibility",
  "description": "Ensures JSX elements have proper accessibility attributes",
  "type": "content",
  "filePattern": ".*\\.(jsx|tsx)$",
  "rules": [
    {
      "operator": "mustContain",
      "value": "alt=|aria-label=|aria-labelledby=",
      "message": "Interactive elements must have accessibility attributes"
    }
  ]
}
```

### Structure Validators
Validate file organization and directory structure.

**Good for:**
- Project organization
- Required file presence
- Directory structure enforcement

**Example Contribution:**
```json
// validators/monorepo-structure.json
{
  "name": "monorepo-structure",
  "description": "Validates monorepo package structure",
  "type": "structure",
  "filePattern": "packages/.*",
  "rules": [
    {
      "operator": "fileExists",
      "value": ["package.json", "README.md", "CHANGELOG.md"],
      "message": "Packages must have package.json, README, and CHANGELOG"
    },
    {
      "operator": "directoryExists",
      "value": ["src", "test"],
      "message": "Packages must have src and test directories"
    }
  ]
}
```

### Naming Validators
Validate file and directory naming conventions.

**Good for:**
- Naming consistency
- Convention enforcement
- File extension validation

**Example Contribution:**
```json
// validators/api-route-naming.json
{
  "name": "api-route-naming",
  "description": "Enforces REST API route naming conventions",
  "type": "naming",
  "filePattern": "api/routes/.*\\.js$",
  "rules": [
    {
      "operator": "matchesNamingPattern",
      "value": "^[a-z][a-z0-9-]*\\.js$",
      "message": "API route files must use kebab-case naming"
    }
  ]
}
```

## Plugin Contributions

### When to Create a Plugin
Create a plugin when you need:
- Complex parsing logic
- Cross-file validation
- Configuration-dependent behavior
- Business-specific rules

### Plugin Contribution Template
```javascript
// plugins/validateMyFeature.js
export const operator = "validateMyFeature";

export async function evaluate(content, rule, context) {
  try {
    // Your validation logic here
    const isValid = performValidation(content, rule);
    
    return {
      passed: isValid,
      message: isValid ? "Validation passed" : "Validation failed with specific reason"
    };
    
  } catch (error) {
    return {
      passed: false,
      message: `Plugin error: ${error.message}`
    };
  }
}

function performValidation(content, rule) {
  // Implementation details
  return true;
}
```

## Documentation Requirements

### Validator Documentation
Each validator should include:

```markdown
# Validator Name

## Purpose
Brief description of what this validator checks.

## Usage
```json
{
  "validator": "validator-name",
  "files": "file-pattern"
}
```

## Examples

### Valid Example
```javascript
// Code that passes validation
```

### Invalid Example
```javascript
// Code that fails validation
```

## Configuration
List any configurable parameters.
```

### Plugin Documentation
Plugins need more detailed documentation:

```markdown
# Plugin Name

## Purpose
Detailed description of the validation logic.

## Parameters
- `parameter1`: Description and type
- `parameter2`: Description and type

## Usage
```json
{
  "plugin": "pluginName",
  "parameter1": "value",
  "parameter2": "value"
}
```

## Implementation Details
Explain the validation algorithm and any dependencies.
```

## Quality Standards

### Code Quality
- **Clean Code** - Follow established patterns
- **Error Handling** - Comprehensive error handling
- **Performance** - Efficient validation logic
- **Testing** - Complete test coverage

### Documentation Quality
- **Clear Examples** - Both valid and invalid cases
- **Usage Instructions** - How to use the validator
- **Parameter Documentation** - All options explained
- **Edge Cases** - Document known limitations

### Test Coverage
- **Happy Path** - Valid cases pass
- **Error Cases** - Invalid cases fail appropriately
- **Edge Cases** - Boundary conditions handled
- **Performance** - Large files don't cause issues

## Review Process

### Automated Checks
All contributions go through:
- **Linting** - Code style validation
- **Testing** - All tests must pass
- **Documentation** - README updates required
- **Performance** - No significant performance regression

### Manual Review
Maintainers review for:
- **Design Consistency** - Follows Valence patterns
- **Usefulness** - Solves real problems
- **Quality** - Well-implemented and tested
- **Documentation** - Clear and complete

## Contribution Examples

### Recent Successful Contributions

#### Security Validator
```json
// validators/no-hardcoded-secrets.json
{
  "name": "no-hardcoded-secrets",
  "description": "Prevents hardcoded secrets in source code",
  "type": "content",
  "filePattern": ".*\\.(js|ts|jsx|tsx)$",
  "rules": [
    {
      "operator": "mustNotContain",
      "value": "(password|secret|key)\\s*=\\s*['\"][^'\"]{8,}['\"]",
      "message": "Avoid hardcoding secrets in source code"
    }
  ]
}
```

#### Database Migration Validator
```json
// validators/migration-structure.json
{
  "name": "migration-structure",
  "description": "Validates database migration file structure",
  "type": "content",
  "filePattern": "migrations/.*\\.sql$",
  "rules": [
    {
      "operator": "mustContain",
      "value": "-- Migration:",
      "message": "Migrations must have descriptive comments"
    },
    {
      "operator": "mustContain",
      "value": "BEGIN;.*COMMIT;",
      "message": "Migrations must be wrapped in transactions"
    }
  ]
}
```

## Getting Help

### Before Contributing
- **Check Issues** - See if someone else is working on it
- **Discuss Ideas** - Use GitHub Discussions for design questions
- **Review Examples** - Study existing validators for patterns

### During Development
- **Ask Questions** - Use GitHub Discussions
- **Share Progress** - Draft PRs for early feedback
- **Test Thoroughly** - Include comprehensive test cases

### After Submission
- **Respond to Feedback** - Address review comments promptly
- **Update Documentation** - Keep docs in sync with changes
- **Monitor Usage** - Help users who adopt your validator

## Recognition

### Contributor Credits
- **README** - Contributors listed in main README
- **Release Notes** - New validators highlighted in releases
- **Documentation** - Author attribution in validator docs

### Validator Adoption
Track your validator's impact:
- **Usage Statistics** - How many projects use it
- **Issue Reports** - Help improve based on user feedback
- **Feature Requests** - Evolve based on community needs

## Next Steps

1. **[Study Examples](../Profiles%20%26%20Validators/Domain-Specific-Examples.md)** - Learn from existing validators
2. **[Join Discussions](https://github.com/BPMSoftwareSolutions/valance/discussions)** - Connect with the community
3. **[Check Issues](https://github.com/BPMSoftwareSolutions/valance/issues)** - Find contribution opportunities
4. **[Submit Your First Validator](https://github.com/BPMSoftwareSolutions/valance/pulls)** - Make your first contribution

---

*Ready to contribute? The community is waiting for your validator ideas!*
