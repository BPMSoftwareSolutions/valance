# 🏗️ Architectural Validators

Advanced validators for enforcing architectural patterns, import boundaries, and integration flows. These validators were migrated from C# and enhanced with the Valence Confidence Engine.

## 📋 Overview

The architectural validators ensure that your codebase follows established architectural patterns and prevents common integration issues:

- **Import Path Validation** - Enforces import path conventions and prevents forbidden dependencies
- **Integration Flow Validation** - Ensures UI components properly integrate with backend systems
- **Runtime Binding Validation** - Validates function bindings and prevents "function is not defined" errors
- **Sequence Registration Validation** - Ensures musical sequences are registered before being called
- **Symphony Structure Validation** - Validates musical architecture patterns (RenderX-specific)

## 🔍 Import Path Validation

### Purpose
Prevents architectural boundary violations by validating import paths and detecting forbidden dependencies.

### Configuration
```json
{
  "name": "import-path-validation",
  "description": "Validates import paths follow architectural conventions",
  "type": "content", 
  "filePattern": ".*\\.(ts|js)$",
  "confidenceThreshold": 0.7,
  "rules": [
    {
      "plugin": "validateImports",
      "forbiddenImports": [
        "src/internal",
        "src/infra", 
        "private/",
        "internal/"
      ],
      "importRules": [
        {
          "filePattern": ".*symphony.*sequence\\.ts$",
          "importPattern": "EventBus",
          "expectedPattern": "../../../../EventBus.ts",
          "description": "EventBus imports must be 4 levels up from symphony directory"
        },
        {
          "filePattern": ".*symphony.*sequence\\.ts$",
          "importPattern": "MusicalConductor",
          "expectedPattern": "../../../index.ts", 
          "description": "Conductor imports must be 3 levels up from symphony directory"
        }
      ]
    }
  ]
}
```

### Features

#### **🚫 Forbidden Import Detection**
Prevents imports from restricted directories:
```typescript
// ❌ Forbidden - violates architectural boundaries
import { InternalService } from 'src/internal/services/InternalService';
import { DatabaseConnection } from 'src/infra/database/connection';

// ✅ Allowed - follows architectural patterns  
import { PublicService } from 'src/public/services/PublicService';
import { ApiClient } from 'src/api/client';
```

#### **📏 Path Depth Validation**
Ensures correct relative import depths:
```typescript
// ❌ Wrong depth - should be 4 levels up
import { EventBus } from '../../../EventBus.js';

// ✅ Correct depth - 4 levels up from symphony directory
import { EventBus } from '../../../../EventBus.ts';
```

#### **🎯 Confidence Scoring**
- **95% Confidence** - Exact forbidden pattern match
- **90% Confidence** - Path depth violations with specific rules
- **85% Confidence** - Substring matches and pattern variations

#### **💡 Auto-fix Suggestions**
```bash
🟥 EventBus imports must be 4 levels up from symphony directory (Line 2)
  Confidence: 85% | Rule: importPathViolation
  Code: import ... from '../../../EventBus.js';
  💡 Suggested fix: ../../../../EventBus.ts
```

### Usage Examples
```bash
# Basic validation
node cli/cli.js --validator import-path-validation --files "src/**/*.ts"

# High confidence only
node cli/cli.js --validator import-path-validation --files "src/**/*.ts" --confidence-threshold 0.9

# Generate detailed reports
node cli/cli.js --validator import-path-validation --files "src/**/*.ts" --generate-reports
```

## 🔗 Integration Flow Validation

### Purpose
Validates that UI event handlers properly integrate with backend systems, preventing runtime "Sequence not found" errors.

### Configuration
```json
{
  "name": "integration-flow-validation",
  "description": "Validates integration flow between UI handlers and backend sequences",
  "type": "content",
  "filePattern": ".*\\.(ts|tsx|js|jsx)$", 
  "confidenceThreshold": 0.8,
  "rules": [
    {
      "plugin": "validateIntegrationFlow",
      "checkSymphonyRegistration": true,
      "validateUIHandlers": true,
      "expectedIntegrationPattern": "UI Event → Handler → Symphony Call → Sequence"
    }
  ]
}
```

### Features

#### **🎼 Symphony Registration Validation**
Ensures symphonies are properly registered:
```typescript
// ✅ Properly registered symphony
const CANVAS_COMPONENT_DRAG_SEQUENCE = {
  name: 'Canvas Component Drag Symphony No. 4',
  // ... sequence definition
};

// In conductor registration:
conductor.registerSequence(CANVAS_COMPONENT_DRAG_SEQUENCE);
```

#### **🖱️ UI Handler Integration**
Validates event handlers call correct symphonies:
```typescript
// ✅ Proper integration
const handleDragStart = (event) => {
  // Handler properly calls symphony
  conductor.startSequence('canvas-component-drag-symphony', {
    element: event.target,
    position: { x: event.clientX, y: event.clientY }
  });
};

// ❌ Missing symphony call - will be flagged
const handleDragStart = (event) => {
  // Direct manipulation without symphony coordination
  event.target.style.position = 'absolute';
};
```

#### **🎯 Confidence Scoring**
- **95% Confidence** - Symphony name mismatch (wrong sequence called)
- **92% Confidence** - Missing symphony call in event handler
- **88% Confidence** - Symphony not registered anywhere

#### **⚡ Runtime Error Prevention**
Detects issues before deployment:
```bash
🟥 Event handler 'handleCanvasDrag' does not call corresponding musical sequence (Line 42)
  Confidence: 92% | Rule: MissingSymphonyCall
  Expected: conductor.startSequence('canvas-component-drag-symphony', ...)
  Impact: Symphony beats will never execute, breaking the musical architecture
```

### Architecture Patterns Validated

#### **✅ Proper Integration Pattern**
```
UI Event → Event Handler → Symphony Call → Musical Sequence → Coordinated Actions
```

#### **❌ Anti-Pattern Detection**
```
UI Event → Event Handler → Direct Actions (No Symphony Coordination)
```

### Usage Examples
```bash
# Validate UI integration flows
node cli/cli.js --validator integration-flow-validation --files "src/**/*.tsx"

# Show override statistics
node cli/cli.js --validator integration-flow-validation --files "src/**/*.tsx" --show-overrides

# Generate integration flow report
node cli/cli.js --validator integration-flow-validation --files "src/**/*.tsx" --generate-reports
```

## 🔗 Runtime Binding Validation

### Purpose
Validates runtime function bindings and scope issues that could cause "function is not defined" errors at runtime.

### Configuration
```json
{
  "name": "runtime-binding-validation",
  "description": "Validates runtime function bindings and scope issues",
  "type": "content",
  "filePattern": ".*\\.(ts|tsx|js|jsx)$",
  "confidenceThreshold": 0.7,
  "rules": [
    {
      "plugin": "validateRuntimeBinding",
      "checkFunctionBindings": true,
      "validateScopeAccess": true,
      "detectCrossScopeReferences": true,
      "verbose": false
    }
  ]
}
```

### Features

#### **🚫 Undefined Function Detection**
Detects functions that are called but not defined in accessible scope:
```typescript
// ❌ Function not defined
const Component = () => {
  const handleClick = () => {
    undefinedFunction(); // Will be flagged
  };
  return <button onClick={handleClick}>Click</button>;
};

// ✅ Function properly defined
const Component = () => {
  const definedFunction = () => {
    console.log('Defined function');
  };

  const handleClick = () => {
    definedFunction(); // Valid
  };

  return <button onClick={handleClick}>Click</button>;
};
```

#### **🔍 Cross-Component Scope Validation**
Detects functions called across component boundaries:
```typescript
// ❌ Cross-component scope violation
const ComponentA = () => {
  const privateFunction = () => {
    console.log('Private to ComponentA');
  };
  return <div>Component A</div>;
};

const ComponentB = () => {
  const handleClick = () => {
    privateFunction(); // Scope violation - will be flagged
  };
  return <button onClick={handleClick}>Click</button>;
};

// ✅ Proper prop passing
const ComponentA = ({ onAction }) => {
  const handleClick = () => {
    onAction('data'); // Valid - passed as prop
  };
  return <button onClick={handleClick}>Click</button>;
};
```

#### **🎯 Confidence Scoring**
- **90% Confidence** - Clear undefined function references
- **85% Confidence** - Cross-component scope violations
- **80% Confidence** - Potential prop or context usage

#### **💡 Auto-fix Suggestions**
```bash
🟥 Function 'handleSubmit' is referenced but not defined in accessible scope (Line 15)
  Confidence: 90% | Rule: UndefinedFunction
  💡 Suggested fix: Define 'handleSubmit' in the same component scope or pass as prop
```

### Usage Examples
```bash
# Basic validation
node cli/cli.js --validator runtime-binding-validation --files "src/**/*.tsx"

# High confidence only
node cli/cli.js --validator runtime-binding-validation --files "src/**/*.tsx" --confidence-threshold 0.9

# Generate detailed reports
node cli/cli.js --validator runtime-binding-validation --files "src/**/*.tsx" --generate-reports
```

## 🎼 Sequence Registration Validation

### Purpose
Validates that musical sequences are properly registered before being called, preventing runtime "Sequence not found" errors.

### Configuration
```json
{
  "name": "sequence-registration-validation",
  "description": "Validates that musical sequences are properly registered before being called",
  "type": "content",
  "filePattern": ".*\\.(ts|tsx|js|jsx)$",
  "confidenceThreshold": 0.8,
  "rules": [
    {
      "plugin": "validateSequenceRegistration",
      "checkSequenceRegistrations": true,
      "validateRegistrationTiming": true,
      "detectMissingRegistrations": true,
      "handleBulkRegistrations": true,
      "verbose": false
    }
  ]
}
```

### Features

#### **🎵 Missing Registration Detection**
Detects sequences that are called but never registered:
```typescript
// ❌ Sequence called but not registered
const Component = () => {
  const handleClick = () => {
    conductor.startSequence('unregistered-symphony', {}); // Will be flagged
  };
  return <button onClick={handleClick}>Start</button>;
};

// ✅ Sequence properly registered
const REGISTERED_SEQUENCE = {
  name: 'registered-symphony',
  movements: [{ name: 'action', beats: ['beat1', 'beat2'] }]
};

conductor.defineSequence('registered-symphony', REGISTERED_SEQUENCE);

const Component = () => {
  const handleClick = () => {
    conductor.startSequence('registered-symphony', {}); // Valid
  };
  return <button onClick={handleClick}>Start</button>;
};
```

#### **⏰ Registration Timing Validation**
Detects timing issues where sequences might be called before registration:
```typescript
// ❌ Potential timing issue
const App = () => {
  useEffect(() => {
    // Called immediately on app load
    conductor.startSequence('init-symphony', {}); // Might be called before registration
  }, []);

  return <ComponentWithRegistration />;
};

const ComponentWithRegistration = () => {
  useEffect(() => {
    // Registration happens in useEffect - might be too late
    conductor.defineSequence('init-symphony', SEQUENCE);
  }, []);

  return <div>Component</div>;
};
```

#### **📦 Bulk Registration Support**
Handles bulk registration patterns:
```typescript
// ✅ Bulk registration pattern
const ALL_CANVAS_SEQUENCES = [
  { name: 'canvas-drag-symphony', movements: [...] },
  { name: 'canvas-drop-symphony', movements: [...] }
];

const registerAllSequences = () => {
  ALL_CANVAS_SEQUENCES.forEach(seq => {
    conductor.registerSequence(seq);
  });
};

registerAllSequences(); // Bulk registration

// Valid calls covered by bulk registration
conductor.startSequence('canvas-drag-symphony', {});
conductor.startSequence('canvas-drop-symphony', {});
```

#### **🎯 Confidence Scoring**
- **95% Confidence** - Clear missing registrations
- **90% Confidence** - Timing issues with registration order
- **85% Confidence** - Potential bulk registration coverage

#### **💡 Registration Suggestions**
```bash
🟥 Sequence 'canvas-resize-symphony' is called but not registered (Line 23)
  Confidence: 95% | Rule: MissingRegistration
  💡 Suggested fix: Create registration in hooks.ts: conductor.defineSequence('canvas-resize-symphony', SEQUENCE)
```

### Usage Examples
```bash
# Validate sequence registrations
node cli/cli.js --validator sequence-registration-validation --files "src/**/*.tsx"

# Check timing issues
node cli/cli.js --validator sequence-registration-validation --files "src/App.tsx" --confidence-threshold 0.8

# Generate registration report
node cli/cli.js --validator sequence-registration-validation --files "src/**/*.tsx" --generate-reports
```

## 🎼 Symphony Structure Validation

### Purpose
Validates RenderX musical architecture patterns and symphony organization.

### Configuration
```json
{
  "name": "symphony-structure",
  "description": "Validates symphony directory structure and organization",
  "type": "structure",
  "filePattern": ".*symphony.*",
  "rules": [
    {
      "plugin": "validateSymphonyStructure",
      "requiredFiles": ["sequence.ts", "hooks.ts"],
      "namingConventions": true,
      "organizationPatterns": true
    }
  ]
}
```

### Features
- **📁 Directory Structure** - Validates symphony folder organization
- **📝 Required Files** - Ensures sequence.ts and hooks.ts exist
- **🏷️ Naming Conventions** - Validates symphony naming patterns
- **🔗 Cross-references** - Validates symphony-to-sequence relationships

## 🎯 Confidence Engine Integration

All architectural validators support the Valence Confidence Engine:

### **Confidence Levels**
| Level | Range | Description | Action |
|-------|-------|-------------|---------|
| **High** | 90-100% | Very confident violation | Fix immediately |
| **Medium** | 70-89% | Likely violation | Review and fix |
| **Low** | 0-69% | Uncertain, may be false positive | Manual verification |

### **Enhanced Reporting**
```bash
# Generate confidence-aware reports
node cli/cli.js --validator import-path-validation --files "src/**/*.ts" --generate-reports

# View HTML dashboard with confidence visualization
open reports/validation-report.html

# Check confidence analysis
cat reports/validation-report.md | grep -A 10 "Confidence Analysis"
```

### **False Positive Management**
```json
// .valence-overrides.json
{
  "version": "1.0",
  "overrides": {
    "abc123": {
      "rule": "forbiddenImport",
      "filePath": "test/example.ts",
      "status": "false_positive", 
      "reason": "Test file - not production code",
      "addedBy": "developer@example.com"
    }
  }
}
```

## 🚀 Production Usage

### **RenderX Integration**
```bash
# Complete architectural validation
node cli/cli.js --profile renderx-comprehensive-profile --files "testdata/RenderX/src/**/*"

# Results: 13/13 validators pass, 57 files analyzed, 0 violations
```

### **CI/CD Integration**
```yaml
# .github/workflows/validation.yml
- name: Architectural Validation
  run: |
    node cli/cli.js --profile renderx-comprehensive-profile \
      --files "src/**/*" \
      --confidence-threshold 0.8 \
      --generate-reports \
      --apply-overrides
```

### **Team Configuration**
```json
// .valencerc
{
  "confidenceThreshold": 0.8,
  "validators": {
    "import-path-validation": {
      "confidenceThreshold": 0.7
    },
    "integration-flow-validation": {
      "confidenceThreshold": 0.8
    }
  }
}
```

## 📈 Benefits

### **For Developers**
- **🎯 Prioritized Issues** - Confidence scores help focus on real problems
- **⚡ Faster Fixes** - Auto-fix suggestions speed up resolution
- **🔍 Better Context** - Rich metadata explains violations clearly

### **For Teams**
- **🤝 Collaboration** - Override system manages false positives
- **📊 Quality Metrics** - Track architectural compliance over time
- **🔄 Continuous Improvement** - Confidence analysis improves rules

### **For Architecture**
- **🏗️ Boundary Enforcement** - Prevents architectural violations
- **⚡ Runtime Error Prevention** - Catches integration issues early
- **📐 Consistency** - Enforces consistent patterns across codebase

---

The architectural validators provide **comprehensive, confidence-driven validation** that helps teams maintain clean architecture and prevent integration issues! 🎉
