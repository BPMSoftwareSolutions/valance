# 🎼 Symphonic Plugin Architecture (SPA)

## 🌟 Overview

The **Symphonic Plugin Architecture (SPA)** is a modular plugin architecture pattern that organizes code using musical metaphors. SPA enables scalable, maintainable plugin ecosystems by enforcing consistent structure, clear contracts, and modular design principles.

## 🎯 Core Concepts

### **Musical Metaphors**
- **🎼 Sequence**: The main plugin definition with musical properties (tempo, key, movements)
- **🎵 Movements**: Individual actions or operations within a sequence
- **🎹 Handlers**: Implementation functions that execute movements
- **🎶 Beats**: Timing and coordination between movements
- **🎺 Conductor**: Runtime system that orchestrates plugin execution

### **Plugin Structure**
```
MyPlugin.component-drag-symphony/
├── manifest.json              # Plugin metadata and configuration
├── index.ts                   # Entry point and exports
├── sequence.ts                # Musical definition and movements
├── handlers/                  # Movement implementations
│   ├── onDragStart.ts
│   ├── onDragging.ts
│   └── onDrop.ts
├── hooks/                     # Optional: React hooks
├── logic/                     # Optional: Business logic
├── visuals/                   # Optional: Animations
└── tests/                     # Optional: Test files
```

## 🏗️ Architecture Patterns

### **Sequence Definition**
```typescript
// sequence.ts
export const sequence = {
  id: "component-drag-symphony",
  name: "Component Drag Symphony",
  version: "1.0.0",
  tempo: 120,                    // Musical tempo (60-180)
  key: "C-major",               // Musical key signature
  movements: [
    {
      label: "onDragStart",
      beat: 1,
      duration: 100,
      description: "Initialize drag operation"
    },
    {
      label: "onDragging", 
      beat: 2,
      duration: 50,
      description: "Handle drag movement"
    },
    {
      label: "onDrop",
      beat: 3, 
      duration: 200,
      description: "Complete drag operation"
    }
  ]
};
```

### **Handler Implementation**
```typescript
// handlers/onDragStart.ts
/**
 * @agent-context Initializes drag operation with element positioning
 */
export const onDragStart = (data: DragStartData) => {
  const { element, startPosition } = data;
  
  // Store initial position
  element.dataset.startX = startPosition.x.toString();
  element.dataset.startY = startPosition.y.toString();
  
  // Add drag styling
  element.classList.add('dragging');
  
  return {
    success: true,
    initialPosition: startPosition
  };
};
```

### **Plugin Entry Point**
```typescript
// index.ts
import { sequence } from './sequence';
import { onDragStart } from './handlers/onDragStart';
import { onDragging } from './handlers/onDragging';
import { onDrop } from './handlers/onDrop';

export const handlers = {
  onDragStart,
  onDragging,
  onDrop
};

export { sequence };

// Register with conductor
export const registerSequence = () => {
  return { sequence, handlers };
};
```

## 🎯 SPA Validators

### **🚨 Critical Validators (Must Pass)**

#### **1. Structure**
- **File**: `validators/SPA/structure.valance.json`
- **Purpose**: Validates directory layout and required files
- **Checks**: manifest.json, sequence.ts, index.ts, handlers/ directory
- **Scope**: All SPA plugin directories

#### **2. Sequence Contract**
- **File**: `validators/SPA/sequence-contract.valance.json`
- **Purpose**: Validates musical properties and movements
- **Checks**: Tempo (60-180), key signatures, movement fields, beat overlaps
- **Scope**: sequence.ts files

#### **3. Handler Mapping**
- **File**: `validators/SPA/handler-mapping.valance.json`
- **Purpose**: Ensures movements have corresponding handlers
- **Checks**: File existence, exports, @agent-context annotations
- **Scope**: Handler files and movement definitions

#### **4. Index-Manifest Sync**
- **File**: `validators/SPA/index-manifest-sync.valance.json`
- **Purpose**: Validates contract synchronization
- **Checks**: ID matching, version sync, registerSequence() calls
- **Scope**: Entry points and manifest files

### **⚠️ Important Validators (Should Pass)**

#### **5. Test Coverage**
- **File**: `validators/SPA/test-coverage.valance.json`
- **Purpose**: Ensures comprehensive test coverage
- **Checks**: Test files exist, coverage thresholds, error scenarios
- **Scope**: Test files and directories

#### **6. Dependency Scope**
- **File**: `validators/SPA/dependency-scope.valance.json`
- **Purpose**: Enforces modularity and isolation
- **Checks**: Import restrictions, external dependencies
- **Scope**: Import statements across plugin

### **💡 Recommended Validators (Nice to Have)**

#### **7. Hooks Mapping**
- **File**: `validators/SPA/hooks-mapping.valance.json`
- **Purpose**: Validates React hooks conventions
- **Checks**: Naming (use* prefix), exports, React patterns
- **Scope**: Hook files and usage

#### **8. Logic Contract**
- **File**: `validators/SPA/logic-contract.valance.json`
- **Purpose**: Ensures testable business logic
- **Checks**: Pure functions, testability, separation of concerns
- **Scope**: Logic files and business rules

#### **9. Visual Schema**
- **File**: `validators/SPA/visual-schema.valance.json`
- **Purpose**: Validates animation configurations
- **Checks**: Animation definitions, timing, visual consistency
- **Scope**: Visual schema files

#### **10. AI Annotation**
- **File**: `validators/SPA/ai-annotation.valance.json`
- **Purpose**: Ensures AI-friendly annotations
- **Checks**: @agent-context comments, documentation quality
- **Scope**: All plugin files

## 🚀 Usage

### **Quick Validation**
```bash
# Run comprehensive SPA validation
node cli/cli.js --profile spa-comprehensive --files "plugins/**/*symphony*"

# Validate specific plugin
node cli/cli.js --profile spa-comprehensive --files "plugins/component-drag-symphony"

# Test SPA validators
node scripts/test-spa-validators.js
```

### **Plugin Development**
```bash
# Create new SPA plugin structure
mkdir MyPlugin.my-feature-symphony
cd MyPlugin.my-feature-symphony

# Create required files
touch manifest.json sequence.ts index.ts
mkdir handlers hooks logic visuals tests

# Validate during development
node cli/cli.js --profile spa-comprehensive --files "." --generate-reports
```

### **CI/CD Integration**
```yaml
# .github/workflows/spa-validation.yml
name: SPA Architecture Validation
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: node cli/cli.js --profile spa-comprehensive --files "plugins/**/*symphony*"
```

## 📋 Validation Levels

### **🚨 Critical (Must Pass)**
- **Structure**: Plugin layout compliance
- **Sequence Contract**: Musical property validation
- **Handler Mapping**: Movement-to-handler consistency
- **Index-Manifest Sync**: Contract synchronization

### **⚠️ Important (Should Pass)**
- **Test Coverage**: Quality assurance requirements
- **Dependency Scope**: Modularity enforcement

### **💡 Recommended (Nice to Have)**
- **Hooks Mapping**: React conventions
- **Logic Contract**: Business logic quality
- **Visual Schema**: Animation standards
- **AI Annotation**: LLM tooling support

## 🔧 Configuration

### **SPA Comprehensive Profile**
```json
{
  "name": "spa-comprehensive",
  "description": "Comprehensive validation for SPA plugins",
  "validators": [
    "SPA/structure",
    "SPA/sequence-contract", 
    "SPA/handler-mapping",
    "SPA/index-manifest-sync",
    "SPA/hooks-mapping",
    "SPA/logic-contract",
    "SPA/dependency-scope",
    "SPA/test-coverage",
    "SPA/visual-schema",
    "SPA/ai-annotation"
  ],
  "validationLevels": {
    "critical": [
      "SPA/structure",
      "SPA/sequence-contract",
      "SPA/handler-mapping",
      "SPA/index-manifest-sync"
    ],
    "important": [
      "SPA/test-coverage",
      "SPA/dependency-scope"
    ],
    "recommended": [
      "SPA/hooks-mapping",
      "SPA/logic-contract",
      "SPA/visual-schema",
      "SPA/ai-annotation"
    ]
  }
}
```

## 🎼 Plugin Development Guide

### **1. Create Plugin Structure**
```bash
mkdir MyFeature.my-feature-symphony
cd MyFeature.my-feature-symphony
```

### **2. Define Manifest**
```json
{
  "id": "my-feature-symphony",
  "name": "My Feature Symphony",
  "version": "1.0.0",
  "description": "Description of plugin functionality",
  "author": "Developer Name",
  "type": "symphony"
}
```

### **3. Create Sequence Definition**
```typescript
export const sequence = {
  id: "my-feature-symphony",
  name: "My Feature Symphony",
  version: "1.0.0",
  tempo: 120,
  key: "C-major",
  movements: [
    // Define your movements here
  ]
};
```

### **4. Implement Handlers**
```typescript
// handlers/myHandler.ts
export const myHandler = (data: any) => {
  // Implementation here
  return { success: true };
};
```

### **5. Create Entry Point**
```typescript
// index.ts
import { sequence } from './sequence';
import { myHandler } from './handlers/myHandler';

export const handlers = { myHandler };
export { sequence };
export const registerSequence = () => ({ sequence, handlers });
```

## 📊 Migration Patterns

### **From Monolithic to SPA**
1. **Identify Components**: Break down monolithic code into logical components
2. **Define Movements**: Map component actions to musical movements
3. **Extract Handlers**: Move implementation logic to handler functions
4. **Create Sequence**: Define musical properties and movement coordination
5. **Validate**: Run SPA validators to ensure compliance

### **Example Migration**
```typescript
// Before: Monolithic component
class DragComponent {
  onMouseDown() { /* ... */ }
  onMouseMove() { /* ... */ }
  onMouseUp() { /* ... */ }
}

// After: SPA Plugin
// sequence.ts - Define movements
// handlers/onDragStart.ts - Extract onMouseDown logic
// handlers/onDragging.ts - Extract onMouseMove logic  
// handlers/onDrop.ts - Extract onMouseUp logic
```

## 🎯 Best Practices

### **For Plugin Developers**
- Follow SPA directory structure consistently
- Use meaningful movement names and descriptions
- Add @agent-context annotations for AI tooling
- Implement comprehensive test coverage
- Keep handlers pure and testable

### **For Architecture Teams**
- Enforce critical SPA validators in CI/CD
- Review plugin quality through validation reports
- Maintain consistent musical metaphors
- Update SPA patterns as architecture evolves

## 🔗 Related Documentation

- [CIA (Conductor Integration Architecture)](CIA-Conductor-Integration-Architecture.md) - Runtime safety for SPA plugins
- [Test-Driven Architecture](../Methodologies/Test-Driven-Architecture.md) - TDA methodology used by SPA
- [Valence Confidence Engine](../Getting%20Started/Confidence-Engine.md) - Confidence-driven validation

---

*SPA enables scalable, maintainable plugin ecosystems through musical metaphors and modular design principles.* 🎼✨

**Note**: `component-drag-symphony` is just one example implementation of the SPA pattern. The architecture itself supports any type of plugin that follows the musical metaphor structure.
