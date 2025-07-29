# Domain-Specific Examples (e.g., RenderX)

Real-world examples of Valence validation in production environments, featuring the complete RenderX sequence validation system.

## 🎼 RenderX Sequence Validation

### Overview
RenderX sequences are musical-inspired architectural definitions that describe component interactions and state flows. Valence includes comprehensive validation migrated from the original C# SequenceValidator.

### Production Results
✅ **6 RenderX sequence files validated**  
✅ **100% success rate across all 8 validators**  
✅ **Zero validation failures - production ready**

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

### RenderX Profile
```json
// profiles/renderx-sequence-profile.json
{
  "name": "renderx-sequence-profile",
  "description": "Comprehensive validation profile for RenderX sequence definitions",
  "validators": [
    "sequence-required-fields",
    "sequence-musical-properties", 
    "sequence-movements",
    "sequence-beats",
    "sequence-event-types",
    "sequence-naming-conventions",
    "sequence-documentation",
    "sequence-complexity"
  ]
}
```

### Production Validation Example
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
