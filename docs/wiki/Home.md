# 📘 Valence Wiki

Welcome to the **Valence Architecture Validation Engine** documentation!

Valence is a modular, portable architecture validation engine designed to enforce structural integrity, naming conventions, and domain-specific architectural rules across any codebase.

## 🚀 Getting Started

- **[What is Valence?](Getting%20Started/What-is-Valence)** - Core concepts and architecture
- **[Installing & Running](Getting%20Started/Installing-and-Running)** - Setup and first validation
- **[Example Validations](Getting%20Started/Example-Validations)** - Common validation scenarios

## 🔧 Profiles & Validators

- **[Writing a Validator (JSON)](Profiles%20%26%20Validators/Writing-a-Validator-JSON)** - Creating JSON validator definitions
- **[Writing a Plugin (JS)](Profiles%20%26%20Validators/Writing-a-Plugin-JS)** - Custom JavaScript validation logic
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

- ✅ **C# SequenceValidator Migration Complete** - All 8 validators migrated to JavaScript plugins
- ✅ **RenderX Production Validation** - 100% success rate on 6 production sequence files
- ✅ **Comprehensive Reporting** - HTML, JSON, and Markdown report generation
- ✅ **Plugin System** - Custom validation logic support

## Quick Commands

```bash
# Install and test
npm install
npm run test

# Validate RenderX sequences
node cli/cli.js --profile renderx-sequence-profile --files "src/**/*sequence*.ts"

# Generate reports
node cli/cli.js --validator sequence-beats --files "*.js" --format json
```

## Support

- **Issues**: [GitHub Issues](https://github.com/BPMSoftwareSolutions/valance/issues)
- **Discussions**: [GitHub Discussions](https://github.com/BPMSoftwareSolutions/valance/discussions)
- **Documentation**: This wiki

---

*Valence enables consistent, portable architecture governance—whether you're validating symphonies in RenderX or microservices in a distributed system.*
