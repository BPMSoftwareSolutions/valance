# Domain-Specific Examples (e.g., RenderX)

Real-world examples of Valence validation in production environments, featuring the complete RenderX sequence validation system.

## 🎼 RenderX Sequence Validation

### Overview
RenderX sequences are musical-inspired architectural definitions that describe component interactions and state flows. Valence includes comprehensive validation migrated from the original C# SequenceValidator.

### Production Results
✅ **57 RenderX files validated** (complete codebase)
✅ **100% success rate across all 13 validators**
✅ **Zero validation failures - production ready**
✅ **Confidence Engine integration** - Enhanced reporting with confidence scores

### Complete Validator Suite

#### 1. Required Fields Validator
```json
// validators/sequence-required-fields.json
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

**Validates:**
- `name` - Sequence identifier
- `description` - Detailed description
- `key` - Musical key signature
- `tempo` - BPM value
- `movements` - Array of movements

#### 2. Musical Properties Validator
```json
// validators/sequence-musical-properties.json
{
  "name": "sequence-musical-properties",
  "description": "Validates musical properties like key signature, tempo range",
  "type": "content",
  "filePattern": ".*sequence.*\\.(js|json)$",
  "rules": [
    {
      "plugin": "validateSequenceMusicalProperties",
      "strictMode": false,
      "message": "Musical properties validation failed"
    }
  ]
}
```

**Validates:**
- Key signatures (C Major, D Minor, etc.)
- Tempo ranges (60-200 BPM)
- Time signatures (4/4 standard)

#### 3. Beats Validation
```json
// validators/sequence-beats.json
{
  "name": "sequence-beats",
  "description": "Validates beat structure, numbering, dependencies",
  "type": "content",
  "filePattern": ".*sequence.*\\.(js|json)$",
  "rules": [
    {
      "plugin": "validateSequenceBeats",
      "includeWarnings": false,
      "message": "Beat validation failed"
    }
  ]
}
```

**Validates:**
- Sequential beat numbering (1, 2, 3...)
- Valid dependencies between beats
- Required beat properties (event, title, description)

### RenderX Comprehensive Profile
```json
// profiles/renderx-comprehensive-profile.json
{
  "name": "renderx-comprehensive-profile",
  "description": "Complete validation profile for RenderX architecture including sequences, imports, and integration flows",
  "validators": [
    "sequence-required-fields",
    "sequence-musical-properties",
    "sequence-movements",
    "sequence-beats",
    "sequence-event-types",
    "sequence-naming-conventions",
    "sequence-documentation",
    "sequence-complexity",
    "symphony-structure",
    "import-path-validation",
    "integration-flow-validation",
    "runtime-binding-validation",
    "sequence-registration-validation"
  ]
}
```

### New Architectural Validators

#### 9. Import Path Validation
```json
// validators/import-path-validation.json
{
  "name": "import-path-validation",
  "description": "Validates import paths follow architectural conventions and prevent forbidden dependencies",
  "type": "content",
  "filePattern": ".*\\.(ts|js)$",
  "confidenceThreshold": 0.7,
  "rules": [
    {
      "plugin": "validateImports",
      "forbiddenImports": ["src/internal", "src/infra", "private/"],
      "importRules": [
        {
          "filePattern": ".*symphony.*sequence\\.ts$",
          "importPattern": "EventBus",
          "expectedPattern": "../../../../EventBus.ts",
          "description": "EventBus imports must be 4 levels up from symphony directory"
        }
      ]
    }
  ]
}
```

**Features:**
- **🎯 Confidence Scoring** - Each violation includes confidence level (70-95%)
- **🔍 Auto-fix Suggestions** - Provides corrected import paths
- **🚫 Forbidden Import Detection** - Prevents architectural boundary violations
- **📏 Path Depth Validation** - Ensures correct relative import depths

#### 10. Integration Flow Validation
```json
// validators/integration-flow-validation.json
{
  "name": "integration-flow-validation",
  "description": "Validates integration flow between UI event handlers and musical sequences",
  "type": "content",
  "filePattern": ".*\\.(ts|tsx|js|jsx)$",
  "confidenceThreshold": 0.8,
  "rules": [
    {
      "plugin": "validateIntegrationFlow",
      "checkSymphonyRegistration": true,
      "validateUIHandlers": true
    }
  ]
}
```

**Features:**
- **🎼 Symphony Registration Validation** - Ensures symphonies are properly registered
- **🖱️ UI Handler Integration** - Validates event handlers call correct symphonies
- **⚡ Runtime Error Prevention** - Detects "Sequence not found" errors before deployment
- **🎯 High Confidence Detection** - 88-95% confidence in violations

#### 11. Runtime Binding Validation
```json
// validators/runtime-binding-validation.json
{
  "name": "runtime-binding-validation",
  "description": "Validates runtime function bindings and prevents 'function is not defined' errors",
  "type": "content",
  "filePattern": ".*\\.(ts|tsx|js|jsx)$",
  "confidenceThreshold": 0.7,
  "rules": [
    {
      "plugin": "validateRuntimeBinding",
      "checkFunctionBindings": true,
      "validateScopeAccess": true,
      "detectCrossScopeReferences": true
    }
  ]
}
```

**Features:**
- **🚫 Undefined Function Detection** - Catches functions called but not defined
- **🔍 Cross-Component Scope Validation** - Detects scope boundary violations
- **🎯 Smart Confidence Scoring** - 80-90% confidence based on context analysis
- **💡 Auto-fix Suggestions** - Provides solutions for binding issues

#### 12. Sequence Registration Validation
```json
// validators/sequence-registration-validation.json
{
  "name": "sequence-registration-validation",
  "description": "Validates that musical sequences are registered before being called",
  "type": "content",
  "filePattern": ".*\\.(ts|tsx|js|jsx)$",
  "confidenceThreshold": 0.8,
  "rules": [
    {
      "plugin": "validateSequenceRegistration",
      "checkSequenceRegistrations": true,
      "validateRegistrationTiming": true,
      "detectMissingRegistrations": true,
      "handleBulkRegistrations": true
    }
  ]
}
```

**Features:**
- **🎵 Missing Registration Detection** - Prevents "Sequence not found" runtime errors
- **⏰ Registration Timing Validation** - Ensures proper registration order
- **📦 Bulk Registration Support** - Handles complex registration patterns
- **🎯 High Confidence Detection** - 85-95% confidence in violations

### Production Validation Example
```bash
# Validate complete RenderX architecture with Confidence Engine
node cli/cli.js --profile renderx-comprehensive-profile --files "testdata/RenderX/src/**/*" --generate-reports

# Results:
# Found 57 files matching pattern
# ✅ PASS sequence-required-fields - All checks passed
# ✅ PASS sequence-musical-properties - All checks passed
# ✅ PASS sequence-movements - All checks passed
# ✅ PASS sequence-beats - All checks passed
# ✅ PASS sequence-event-types - All checks passed
# ✅ PASS sequence-naming-conventions - All checks passed
# ✅ PASS sequence-documentation - All checks passed
# ✅ PASS sequence-complexity - All checks passed
# ✅ PASS symphony-structure - All checks passed
# ✅ PASS import-path-validation - All checks passed
# ✅ PASS integration-flow-validation - All checks passed
# ✅ PASS runtime-binding-validation - All checks passed
# ✅ PASS sequence-registration-validation - All checks passed

# Enhanced Confidence Engine Output:
# 📊 Generating comprehensive reports...
# ✅ Reports generated:
#    📄 Markdown: reports/validation-report.md
#    🌐 HTML: reports/validation-report.html
#    📋 JSON: reports/validation-report.json
```

### Confidence Engine Integration
```bash
# Filter by confidence level (only show high-confidence violations)
node cli/cli.js --validator import-path-validation --files "src/**/*.ts" --confidence-threshold 0.9

# Example output with confidence scores:
# ❌ FAIL import-path-validation - Found 3 violation(s)
#     🟥 Forbidden import detected: 'src/internal/services' (Line 12)
#       Confidence: 95% | Rule: forbiddenImport
#       Code: import x from 'src/internal/services';
#       💡 Suggested fix: import x from 'src/public/services';

# Apply false positive overrides
node cli/cli.js --validator integration-flow-validation --files "src/**/*.tsx" --show-overrides
# 📋 Override Statistics: 2 total overrides, 1 added this week
```

### Valid RenderX Sequence Structure
```typescript
// CanvasSequences.component-drag-symphony/sequence.ts
export const sequence = {
  name: "Canvas Component Drag Symphony No. 1",
  description: "Comprehensive sequence for canvas component drag operations with proper tempo and movement structure",
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
          description: "Set up canvas component with default properties",
          dependencies: []
        },
        {
          beat: 2,
          event: "DRAG_START",
          title: "Start Drag Operation", 
          description: "Begin component drag interaction",
          dependencies: [1]
        }
      ]
    }
  ]
};
```

## 🏢 Enterprise React Application

### Component Validation Suite
```json
// profiles/react-enterprise-profile.json
{
  "name": "react-enterprise-profile",
  "description": "Enterprise React application validation",
  "validators": [
    "react-component-structure",
    "react-naming-conventions",
    "react-import-restrictions",
    "react-documentation",
    "react-testing-requirements"
  ]
}
```

### Component Structure Validator
```json
// validators/react-component-structure.json
{
  "name": "react-component-structure",
  "description": "Validates React component file structure",
  "type": "structure",
  "filePattern": "src/components/.*/.*Component\\.(jsx|tsx)$",
  "rules": [
    {
      "operator": "fileExists",
      "value": ["index.js", "Component.jsx", "Component.test.js", "Component.stories.js"],
      "message": "Components must have index, implementation, test, and story files"
    }
  ]
}
```

### Import Restrictions
```json
// validators/react-import-restrictions.json
{
  "name": "react-import-restrictions", 
  "description": "Prevents importing forbidden modules",
  "type": "content",
  "filePattern": "src/.*\\.(jsx|tsx)$",
  "rules": [
    {
      "plugin": "validateImportRestrictions",
      "forbiddenImports": ["lodash", "moment", "jquery"],
      "allowedImports": ["react", "react-dom", "@company/design-system"],
      "message": "Use approved libraries only"
    }
  ]
}
```

## 🏗️ Microservices Architecture

### Service Structure Profile
```json
// profiles/microservice-profile.json
{
  "name": "microservice-profile",
  "description": "Microservice architecture validation",
  "validators": [
    "service-structure",
    "api-documentation",
    "docker-requirements",
    "health-check-endpoints"
  ]
}
```

### Service Structure Validator
```json
// validators/service-structure.json
{
  "name": "service-structure",
  "description": "Validates microservice directory structure",
  "type": "structure", 
  "filePattern": "services/.*",
  "rules": [
    {
      "operator": "fileExists",
      "value": ["Dockerfile", "package.json", "README.md", "openapi.yaml"],
      "message": "Services must have Docker, package, README, and API spec files"
    },
    {
      "operator": "directoryExists",
      "value": ["src", "test", "docs"],
      "message": "Services must have src, test, and docs directories"
    }
  ]
}
```

### API Documentation Validator
```json
// validators/api-documentation.json
{
  "name": "api-documentation",
  "description": "Ensures API endpoints are documented",
  "type": "content",
  "filePattern": ".*\\.js$",
  "rules": [
    {
      "operator": "mustContain",
      "value": "@swagger",
      "message": "API endpoints must have Swagger documentation"
    },
    {
      "plugin": "validateOpenAPISpec",
      "specFile": "openapi.yaml",
      "message": "API spec validation failed"
    }
  ]
}
```

## 📱 Mobile App Architecture

### Flutter Project Profile
```json
// profiles/flutter-profile.json
{
  "name": "flutter-profile", 
  "description": "Flutter mobile app validation",
  "validators": [
    "flutter-structure",
    "dart-naming-conventions",
    "widget-documentation",
    "state-management"
  ]
}
```

### Widget Structure Validator
```json
// validators/flutter-structure.json
{
  "name": "flutter-structure",
  "description": "Validates Flutter widget structure",
  "type": "content",
  "filePattern": "lib/.*\\.dart$",
  "rules": [
    {
      "operator": "mustContain",
      "value": "class.*extends.*StatelessWidget|class.*extends.*StatefulWidget",
      "message": "Dart files must contain widget classes"
    },
    {
      "operator": "mustContain",
      "value": "@override\\s+Widget\\s+build",
      "message": "Widgets must override build method"
    }
  ]
}
```

## 🎨 Design System Validation

### Component Library Profile
```json
// profiles/design-system-profile.json
{
  "name": "design-system-profile",
  "description": "Design system component validation", 
  "validators": [
    "component-props-documentation",
    "storybook-stories",
    "accessibility-requirements",
    "design-tokens-usage"
  ]
}
```

### Storybook Requirements
```json
// validators/storybook-stories.json
{
  "name": "storybook-stories",
  "description": "Ensures components have Storybook stories",
  "type": "structure",
  "filePattern": "src/components/.*Component\\.(jsx|tsx)$",
  "rules": [
    {
      "operator": "fileExists",
      "value": ["Component.stories.js"],
      "message": "Components must have Storybook stories"
    }
  ]
}
```

## Creating Profiles

### Profile Structure
```json
{
  "name": "profile-name",
  "description": "What this profile validates",
  "validators": [
    "validator-1",
    "validator-2", 
    "validator-3"
  ]
}
```

### Profile Best Practices

#### ✅ Do
- **Logical Grouping** - Group related validators
- **Clear Names** - Use descriptive profile names
- **Comprehensive Coverage** - Include all relevant validators
- **Domain-Specific** - Tailor to specific use cases

#### ❌ Don't
- **Too Many Validators** - Keep profiles focused
- **Conflicting Rules** - Avoid contradictory validators
- **Generic Profiles** - Make profiles domain-specific
- **Missing Dependencies** - Ensure all referenced validators exist

### Testing Profiles
```bash
# Test profile with dry run
node cli/cli.js --profile my-profile --files "src/**/*" --dry-run

# Run profile validation
node cli/cli.js --profile my-profile --files "src/**/*"

# Generate profile report
node cli/cli.js --profile my-profile --files "src/**/*" --format json > .reports/profile-report.json
```

## Configuration Integration

### Domain-Specific Config
```json
// valence.config.json
{
  "renderx": {
    "validation": {
      "minTempo": 60,
      "maxTempo": 200,
      "requiredTimeSignature": "4/4"
    },
    "musicalKeys": ["C Major", "D Major", "E Major"]
  },
  "react": {
    "forbiddenImports": ["lodash", "moment"],
    "allowedImports": ["react", "react-dom"],
    "maxComponentLines": 200
  },
  "microservices": {
    "requiredFiles": ["Dockerfile", "README.md"],
    "maxServiceComplexity": 15
  }
}
```

## Next Steps

1. **[Set up CI/CD](GitHub-Actions)** - Automate domain-specific validation
2. **[Create Custom Plugins](Writing-a-Plugin-JS)** - Add domain-specific logic
3. **[Generate Reports](GitHub-Actions#reporting)** - Track validation metrics
4. **[Use AI Assistance](Using-AI-to-Generate-Rules)** - Generate domain rules

---

*Ready to automate validation? Let's set up CI/CD integration!*
