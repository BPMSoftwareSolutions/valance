# 📘 Valence Wiki

Welcome to the **Valence Architecture Validation Engine** documentation!

Valence is a modular, portable architecture validation engine designed to enforce structural integrity, naming conventions, and domain-specific architectural rules across any codebase.

## 🎯 **NEW: Valence Confidence Engine**

The **Valence Confidence Engine (VCE)** transforms traditional binary pass/fail validation into a nuanced, confidence-driven system that helps developers prioritize issues, trust results, and collaborate effectively.

**Key Features:**
- **🎯 Confidence Scoring** - Every violation includes a confidence score (0.0-1.0)
- **🔍 Explainable Results** - Rich metadata with code snippets and auto-fix suggestions
- **⚙️ Threshold Filtering** - Filter violations by confidence levels
- **🚫 False Positive Management** - Override system for managing known false positives
- **📊 Enhanced Reporting** - Confidence-aware HTML, Markdown, and JSON reports

[Learn more about the Confidence Engine →](Getting%20Started/Confidence-Engine.md)

## 🏗️ Architectures

Valence supports comprehensive validation for major architectural systems:

### **🧠 CIA (Conductor Integration Architecture)**
Runtime safety validation system for secure plugin mounting and execution.

**Key Features:**
- **🛡️ Runtime Safety** - Validates plugins before mounting to prevent crashes
- **🔄 Graceful Degradation** - System continues operating when plugins fail
- **⚙️ Error Recovery** - Handles malformed plugins without system impact
- **📊 Comprehensive Testing** - Validates error scenarios and edge cases

[Learn more about CIA →](Architectures/CIA-Conductor-Integration-Architecture.md)

### **🎼 SPA (Symphonic Plugin Architecture)**
Modular plugin architecture pattern using musical metaphors for scalable design.

**Key Features:**
- **🎵 Musical Structure** - Sequences, movements, handlers, and beats
- **📁 Standardized Layout** - Consistent directory structure and contracts
- **🔧 Modular Design** - Isolated, testable, and maintainable plugins
- **🤖 AI-Friendly** - Enhanced annotations for LLM tooling

[Learn more about SPA →](Architectures/SPA-Symphonic-Plugin-Architecture.md)

## 📐 Methodologies

### **🎯 TDA (Test-Driven Architecture)**
Validation-driven architectural methodology where constraints guide implementation.

**Key Features:**
- **✅ Validation-First Design** - Define validators before implementing architecture
- **🏗️ Constraint-Driven** - Let validation rules guide architectural decisions
- **🔄 Continuous Validation** - Integrate validation into development workflow
- **📊 Quality Metrics** - Measurable architectural health and compliance

[Learn more about TDA →](Methodologies/Test-Driven-Architecture.md)

## 🚀 Getting Started

- **[What is Valence?](Getting%20Started/What-is-Valence.md)** - Core concepts and architecture
- **[Installing & Running](Getting%20Started/Installing-and-Running.md)** - Setup and first validation
- **[Example Validations](Getting%20Started/Example-Validations.md)** - Common validation scenarios

## 🔧 Profiles & Validators

- **[Writing a Validator (JSON)](Profiles%20%26%20Validators/Writing-a-Validator-JSON.md)** - Creating JSON validator definitions
- **[Writing a Plugin (JS)](Profiles%20%26%20Validators/Writing-a-Plugin-JS.md)** - Custom JavaScript validation logic
- **[Architectural Validators](Profiles%20%26%20Validators/Architectural-Validators.md)** - Import paths, integration flows, and symphony structure
- **[Common Operators Explained](Profiles%20%26%20Validators/Common-Operators-Explained.md)** - Built-in validation operators
- **[Domain-Specific Examples (e.g., RenderX)](Profiles%20%26%20Validators/Domain-Specific-Examples.md)** - Real-world validation cases

## 🤖 Agents & Automation

- **[Using AI to Generate Rules](Agents%20%26%20Automation/Using-AI-to-Generate-Rules.md)** - AI-assisted rule creation

## 🔄 CI/CD Integration

- **[GitHub Actions](CI-CD%20Integration/GitHub-Actions.md)** - Automated validation in CI/CD

## 🔄 Migration

- **[C# to JavaScript Migration Status](Migration/C%23-to-JavaScript-Migration-Status.md)** - Track migration progress from C# validators

## 🤝 Contributing

- **[Adding Validators](Contributing/Adding-Validators.md)** - Contributing new validators

---

## 🎼 Featured: RenderX Sequence Validation

Valence includes comprehensive sequence validation capabilities migrated from C# SequenceValidator:

✅ **8 Validators** - Complete validation coverage
✅ **100% Success Rate** - Production-validated on RenderX codebase
✅ **Plugin Architecture** - Modular and extensible

[Learn more about RenderX Integration →](Profiles%20%26%20Validators/Domain-Specific-Examples.md#renderx-sequence-validation)

## Recent Updates

- 🧠 **NEW: CIA (Conductor Integration Architecture)** - Runtime safety validation for plugin mounting
- 🎼 **NEW: SPA (Symphonic Plugin Architecture)** - Modular plugin architecture with musical metaphors
- 📐 **NEW: TDA (Test-Driven Architecture)** - Validation-driven architectural methodology
- 🎯 **NEW: Valence Confidence Engine** - Confidence-driven validation with explainable results
- ✅ **Complete CIA Validator Suite** - 5 validators for runtime safety (100% success rate)
- ✅ **Complete SPA Validator Suite** - 10 validators for plugin architecture compliance
- ✅ **Enhanced Reporting System** - Confidence scores, code snippets, and auto-fix suggestions
- ✅ **False Positive Override System** - Team collaboration features for managing known issues
- ✅ **C# SequenceValidator Migration Complete** - All 8 validators migrated to JavaScript plugins
- ✅ **RenderX Production Validation** - 100% success rate on 57 production files

## Quick Commands

```bash
# Install and test
npm install
npm run test

# Validate with Confidence Engine
node cli/cli.js --validator import-path-validation --files "src/**/*.ts" --generate-reports --confidence-threshold 0.8

# Validate SPA plugins
node cli/cli.js --profile spa-comprehensive --files "plugins/**/*symphony*"

# Validate CIA conductor safety
node cli/cli.js --profile cia-comprehensive --files "src/**/*conductor*"

# Validate RenderX with comprehensive profile
node cli/cli.js --profile renderx-comprehensive-profile --files "testdata/RenderX/src/**/*"

# Apply false positive overrides
node cli/cli.js --validator integration-flow-validation --files "src/**/*.tsx" --show-overrides
```

## Support

- **Issues**: [GitHub Issues](https://github.com/BPMSoftwareSolutions/valance/issues)
- **Discussions**: [GitHub Discussions](https://github.com/BPMSoftwareSolutions/valance/discussions)
- **Documentation**: This wiki

---

*Valence enables consistent, portable architecture governance—whether you're validating symphonies in RenderX or microservices in a distributed system.*
