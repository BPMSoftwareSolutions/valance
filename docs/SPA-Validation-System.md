# 🎼 Symphonic Plugin Architecture (SPA) Validation System

## Overview

The SPA Validation System provides comprehensive Test-Driven Architecture (TDA) validation for Symphonic Plugin Architecture plugins. This system ensures that SPA plugins follow architectural standards, maintain quality, and remain modular and scalable.

## 🏗️ Architecture

The validation system is organized by architectural domains:

```
validators/
├── SPA/                     # 🎼 Symphonic Plugin Architecture
├── AppCore/                 # ⚙️ App-wide rules  
├── Backend/                 # 🔧 Backend services
└── Shared/                  # ✅ Common lint-like rules
```

## 🎯 SPA Validators

### Core Validators (Critical)

| Validator | Purpose | Scope |
|-----------|---------|-------|
| **structure** | Validates directory layout and required files | Plugin directories |
| **sequence-contract** | Validates musical properties and movements | `sequence.ts` files |
| **handler-mapping** | Ensures movements have corresponding handlers | Handler files |
| **index-manifest-sync** | Validates contract synchronization | Entry points |

### Quality Validators (Important)

| Validator | Purpose | Scope |
|-----------|---------|-------|
| **test-coverage** | Ensures comprehensive test coverage | Test files |
| **dependency-scope** | Enforces modularity and isolation | Import statements |

### Enhancement Validators (Recommended)

| Validator | Purpose | Scope |
|-----------|---------|-------|
| **hooks-mapping** | Validates React hooks conventions | Hook files |
| **logic-contract** | Ensures testable business logic | Logic files |
| **visual-schema** | Validates animation configurations | Visual schemas |
| **ai-annotation** | Ensures AI-friendly annotations | All files |

## 🚀 Usage

### Quick Start

```bash
# Run comprehensive SPA validation
node scripts/test-spa-validators.js

# Run specific validator category
npx valence validate --profile spa-comprehensive

# Validate specific plugin
npx valence validate --path testdata/sample-plugins/component-drag-symphony
```

### Integration with CI/CD

```yaml
# .github/workflows/spa-validation.yml
name: SPA Validation
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: node scripts/test-spa-validators.js
```

## 📋 Validation Levels

### 🚨 Critical (Must Pass)
- **Structure**: Plugin layout compliance
- **Sequence Contract**: Musical property validation  
- **Handler Mapping**: Movement-to-handler consistency
- **Index-Manifest Sync**: Contract synchronization

### ⚠️ Important (Should Pass)
- **Test Coverage**: Quality assurance
- **Dependency Scope**: Modularity enforcement

### 💡 Recommended (Nice to Have)
- **Hooks Mapping**: React conventions
- **Logic Contract**: Business logic quality
- **Visual Schema**: Animation standards
- **AI Annotation**: LLM tooling support

## 🎼 SPA Plugin Structure

```
CanvasSequences.component-drag-symphony/
├── manifest.json              # Plugin metadata
├── index.ts                   # Entry point
├── sequence.ts                # Musical definition
├── handlers/                  # Movement implementations
│   ├── onDragStart.ts
│   ├── onDragging.ts
│   └── onDrop.ts
├── hooks/                     # Optional: React hooks
├── logic/                     # Optional: Business logic
├── visuals/                   # Optional: Animations
└── tests/                     # Optional: Test files
```

## 🔧 Configuration

### Profile Configuration

```json
{
  "name": "spa-comprehensive",
  "validators": [
    "SPA/structure",
    "SPA/sequence-contract",
    "SPA/handler-mapping"
  ],
  "validationLevels": {
    "critical": ["SPA/structure", "SPA/sequence-contract"],
    "important": ["SPA/test-coverage"],
    "recommended": ["SPA/ai-annotation"]
  }
}
```

### Validator Configuration

```json
{
  "name": "spa-structure",
  "type": "structure",
  "rules": [{
    "plugin": "validateSpaDirectoryStructure",
    "checkRequiredFiles": true,
    "enforceNamingConventions": true
  }]
}
```

## 📊 Validation Reports

The system generates comprehensive reports in multiple formats:

- **JSON**: Machine-readable results
- **HTML**: Interactive web reports  
- **Markdown**: Documentation-friendly format

## 🛠️ Development

### Adding New Validators

1. Create validator definition in `validators/SPA/`
2. Implement plugin logic in `plugins/`
3. Add to validation profile
4. Write tests and documentation

### Testing Validators

```bash
# Test individual validator
node -e "
import { runValidators } from './core/runValidators.js';
// Test implementation
"

# Test with sample data
node scripts/test-spa-validators.js
```

## 🎯 Best Practices

### For Plugin Developers
- Run validation during development
- Fix critical issues first
- Use AI annotations for clarity
- Maintain test coverage

### For Architecture Teams
- Enforce critical validators in CI
- Review validation reports regularly
- Update validators as architecture evolves
- Document validation requirements

## 🔗 Related Documentation

- [Writing Validators](./wiki/Profiles%20&%20Validators/Writing-a-Validator-JSON.md)
- [Plugin Development](./wiki/Profiles%20&%20Validators/Writing-a-Plugin-JS.md)
- [CI/CD Integration](./wiki/CI-CD%20Integration/GitHub-Actions.md)

---

*The SPA Validation System ensures your symphonic plugins maintain architectural excellence and quality standards.*
