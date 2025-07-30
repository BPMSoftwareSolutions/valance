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

[Learn more about the Confidence Engine →](Getting%20Started/Confidence-Engine)

## 🚀 Getting Started

- **[What is Valence?](Getting%20Started/What-is-Valence)** - Core concepts and architecture
- **[Installing & Running](Getting%20Started/Installing-and-Running)** - Setup and first validation
- **[Example Validations](Getting%20Started/Example-Validations)** - Common validation scenarios

## 🔧 Profiles & Validators

- **[Writing a Validator (JSON)](Profiles%20%26%20Validators/Writing-a-Validator-JSON)** - Creating JSON validator definitions
- **[Writing a Plugin (JS)](Profiles%20%26%20Validators/Writing-a-Plugin-JS)** - Custom JavaScript validation logic
- **[Architectural Validators](Profiles%20%26%20Validators/Architectural-Validators)** - Import paths, integration flows, and symphony structure
- **[Common Operators Explained](Profiles%20%26%20Validators/Common-Operators-Explained)** - Built-in validation operators
- **[Domain-Specific Examples (e.g., RenderX)](Profiles%20%26%20Validators/Domain-Specific-Examples)** - Real-world validation cases

## 🤖 Agents & Automation

- **[Using AI to Generate Rules](Agents%20%26%20Automation/Using-AI-to-Generate-Rules)** - AI-assisted rule creation

## 🔄 CI/CD Integration

- **[GitHub Actions](CI-CD%20Integration/GitHub-Actions)** - Automated validation in CI/CD

## 🤝 Contributing

- **[Adding Validators](Contributing/Adding-Validators)** - Contributing new validators

---

## 🎼 Featured: RenderX Sequence Validation

Valence includes comprehensive sequence validation capabilities migrated from C# SequenceValidator:

✅ **8 Validators** - Complete validation coverage
✅ **100% Success Rate** - Production-validated on RenderX codebase
✅ **Plugin Architecture** - Modular and extensible

[Learn more about RenderX Integration →](Profiles%20%26%20Validators/Domain-Specific-Examples#renderx-sequence-validation)

## Recent Updates

- 🎯 **NEW: Valence Confidence Engine** - Confidence-driven validation with explainable results
- ✅ **ImportPathValidator & IntegrationFlowValidator Migration** - C# validators migrated to JavaScript plugins
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
