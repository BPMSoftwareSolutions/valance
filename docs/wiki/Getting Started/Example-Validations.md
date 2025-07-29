# Example Validations

Learn Valence through practical examples that demonstrate common validation scenarios.

## 🎼 RenderX Sequence Validation

### Valid Sequence Example
```javascript
// test/good-sequence.js
export const sequence = {
  name: "Canvas Component Symphony No. 1",
  description: "A comprehensive sequence that demonstrates proper tempo, key signature, and movement structure with well-defined beats and measures",
  key: "C Major",
  tempo: 120,
  timeSignature: "4/4",
  movements: [
    {
      name: "Initialization Movement",
      measures: [
        {
          beat: 1,
          event: "CANVAS_INIT",
          title: "Initialize Canvas",
          description: "Set up the canvas component with default properties",
          dependencies: []
        },
        {
          beat: 2,
          event: "STATE_SETUP", 
          title: "Setup State",
          description: "Initialize component state and event handlers",
          dependencies: [1]
        }
      ]
    }
  ]
};
```

### Validation Commands
```bash
# Test the good sequence
npm run test-sequence-good
# ✅ PASS sequence-required-fields - All checks passed

# Test comprehensive validation
npm run test-sequence-profile
# ✅ All 8 validators pass

# Generate detailed report
node cli/cli.js --profile renderx-sequence-profile --files "test/good-sequence.js" --format json
```

### Invalid Sequence Example
```javascript
// test/bad-sequence.js
export const sequence = {
  // Missing name
  description: "Bad sequence",  // Too short, no musical terms
  key: "X Minor",  // Invalid key
  tempo: -10,  // Invalid tempo
  movements: [
    {
      // Missing movement name
      measures: [
        {
          beat: 1,
          // Missing event type and title
          dependencies: [5]  // Invalid dependency
        },
        {
          beat: 3,  // Gap in numbering
          event: "bad",  // Invalid format
          title: "Bad Beat"
          // Missing description
        }
      ]
    }
  ]
};
```

### Expected Failures
```bash
npm run test-sequence-bad
# ❌ FAIL sequence-required-fields - Sequence name is required
# ❌ FAIL sequence-musical-properties - Invalid key signature: X Minor
# ❌ FAIL sequence-beats - Beat numbering gap: expected beat 2, found beat 3
```

## 🏗️ Component Structure Validation

### File Structure Validator
```json
// validators/component-structure.json
{
  "name": "component-structure",
  "description": "Validates React component file structure",
  "type": "structure",
  "filePattern": ".*Component\\.jsx?$",
  "rules": [
    {
      "operator": "fileExists",
      "value": ["index.js", "Component.jsx", "Component.test.js"],
      "message": "Component must have index, implementation, and test files"
    }
  ]
}
```

### Usage
```bash
node cli/cli.js --validator component-structure --files "src/components/**/*"
```

## 📝 Naming Convention Validation

### File Naming Validator
```json
// validators/file-naming.json
{
  "name": "file-naming",
  "description": "Enforces consistent file naming conventions",
  "type": "naming",
  "filePattern": ".*\\.(js|ts|jsx|tsx)$",
  "rules": [
    {
      "operator": "matchesPattern",
      "value": "^[A-Z][a-zA-Z0-9]*\\.(js|ts|jsx|tsx)$",
      "message": "Files must use PascalCase naming"
    },
    {
      "operator": "hasExtension",
      "value": [".js", ".ts", ".jsx", ".tsx"],
      "message": "Only JavaScript/TypeScript files allowed"
    }
  ]
}
```

### Test Files
```bash
# Valid files
src/components/Button.jsx      ✅
src/utils/ApiHelper.js         ✅
src/hooks/UseAuth.ts           ✅

# Invalid files  
src/components/button.jsx      ❌ (lowercase)
src/utils/api-helper.js        ❌ (kebab-case)
src/hooks/use_auth.ts          ❌ (snake_case)
```

## 🔌 Plugin-Based Validation

### Custom Plugin Example
```javascript
// plugins/validateImports.js
export const operator = "validateImports";

export async function evaluate(content, rule, context) {
  const forbiddenImports = rule.forbiddenImports || [];
  const errors = [];
  
  for (const forbidden of forbiddenImports) {
    const regex = new RegExp(`import.*from\\s+['"]${forbidden}['"]`, 'g');
    if (regex.test(content)) {
      errors.push(`Forbidden import: ${forbidden}`);
    }
  }
  
  return {
    passed: errors.length === 0,
    message: errors.length > 0 ? errors.join(', ') : 'All imports are valid'
  };
}
```

### Plugin Validator Definition
```json
// validators/import-restrictions.json
{
  "name": "import-restrictions",
  "description": "Prevents importing forbidden modules",
  "type": "content",
  "filePattern": ".*\\.(js|ts|jsx|tsx)$",
  "rules": [
    {
      "plugin": "validateImports",
      "forbiddenImports": ["lodash", "moment"],
      "message": "Use native alternatives instead of heavy libraries"
    }
  ]
}
```

## 📊 Profile-Based Validation

### Complete Validation Profile
```json
// profiles/frontend-profile.json
{
  "name": "frontend-profile",
  "description": "Comprehensive frontend code validation",
  "validators": [
    "component-structure",
    "file-naming", 
    "import-restrictions",
    "sequence-required-fields"
  ]
}
```

### Running Profiles
```bash
# Validate entire frontend codebase
node cli/cli.js --profile frontend-profile --files "src/**/*"

# Generate comprehensive report
node cli/cli.js --profile frontend-profile --files "src/**/*" --format json > .reports/frontend-validation.json
```

## 🚀 Real-World Production Example

### RenderX Production Validation
```bash
# Validate actual RenderX sequences
node cli/cli.js --profile renderx-sequence-profile --files ".testdata/RenderX/src/**/*sequence*.ts"

# Results:
# Found 6 files matching pattern
# ✅ PASS sequence-required-fields - All checks passed
# ✅ PASS sequence-musical-properties - All checks passed  
# ✅ PASS sequence-movements - All checks passed
# ✅ PASS sequence-beats - All checks passed
# ✅ PASS sequence-event-types - All checks passed
# ✅ PASS sequence-naming-conventions - All checks passed
# ✅ PASS sequence-documentation - All checks passed
# ✅ PASS sequence-complexity - All checks passed
# 
# Passed: 8, Failed: 0, Total: 8
```

## 🔍 Debugging Validation Issues

### Dry Run for Planning
```bash
# See what will be validated
node cli/cli.js --validator sequence-beats --files "src/**/*.js" --dry-run

# Output:
# Loaded validator: sequence-beats
# Found 3 files matching pattern: src/**/*.js
# Would validate:
#   - src/sequences/LoginSequence.js
#   - src/sequences/PaymentSequence.js  
#   - src/sequences/CheckoutSequence.js
```

### Verbose Output
```bash
# Get detailed validation information
node cli/cli.js --validator sequence-beats --files "test/bad-sequence.js" --format json

# Shows specific error details:
# {
#   "validator": "sequence-beats",
#   "passed": false,
#   "message": "Beat numbering gap: expected beat 2, found beat 3",
#   "details": ["Invalid dependency: beat 5 does not exist"]
# }
```

## 📈 Progressive Validation

### Start Simple
```bash
# 1. Test one file with one validator
node cli/cli.js --validator sequence-required-fields --files "test/good-sequence.js"
```

### Add Complexity
```bash
# 2. Test multiple validators
node cli/cli.js --validators sequence-required-fields sequence-beats --files "test/*.js"
```

### Full Validation
```bash
# 3. Use comprehensive profile
node cli/cli.js --profile renderx-sequence-profile --files "src/**/*sequence*.js"
```

## Next Steps

1. **[Create Your Own Validator](Writing-a-Validator-JSON)** - Build custom validation rules
2. **[Write a Plugin](Writing-a-Plugin-JS)** - Add custom validation logic
3. **[Explore Built-in Operators](Common-Operators-Explained)** - Learn available validation functions
4. **[Set up CI/CD](GitHub-Actions)** - Automate validation in your pipeline

---

*Ready to create your own validation rules? Let's build a validator!*
