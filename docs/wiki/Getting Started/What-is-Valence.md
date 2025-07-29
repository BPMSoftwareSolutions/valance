# What is Valence?

**Valence** is a modular, portable architecture validation engine designed to enforce structural integrity, naming conventions, and domain-specific architectural rules across any codebase.

## Core Concepts

### 🏗️ Architecture Validation
Valence validates your codebase against predefined architectural rules, ensuring:
- **Structural Integrity** - Files exist where they should
- **Naming Conventions** - Consistent naming patterns
- **Content Validation** - Code follows required patterns
- **Domain Rules** - Business-specific validation logic

### 🔧 Modular Design
- **Validators** - Individual validation rules defined in JSON
- **Plugins** - Custom JavaScript validation logic
- **Profiles** - Collections of validators for comprehensive validation
- **Operators** - Built-in validation functions (mustContain, matchesPattern, etc.)

### 🎯 Portable & Agent-Friendly
- **Cross-platform** - Runs on any Node.js environment
- **AI Compatible** - Designed for AI agent collaboration
- **No Database** - File-based configuration and execution
- **CLI First** - Command-line interface for automation

## Key Features

### ✅ Built-in Validation Types
- **Content Validation** - Validate file contents against patterns
- **Structure Validation** - Ensure proper file organization
- **Naming Validation** - Enforce naming conventions

### 🔌 Plugin System
- **Custom Logic** - Write JavaScript plugins for complex validation
- **Shared Utilities** - Reusable parsing and configuration functions
- **Context Aware** - Plugins receive file path and validation context

### 📊 Comprehensive Reporting
- **Multiple Formats** - HTML dashboards, JSON for CI/CD, Markdown summaries
- **Real-time Feedback** - Console output during validation
- **Detailed Results** - Specific error messages and suggestions

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CLI Interface │    │  Core Engine    │    │   Validators    │
│                 │───▶│                 │───▶│                 │
│ • Arguments     │    │ • File Loading  │    │ • JSON Rules    │
│ • Output Format │    │ • Validation    │    │ • Plugin Logic  │
│ • Dry Run       │    │ • Reporting     │    │ • Operators     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Profiles      │
                       │                 │
                       │ • Validator     │
                       │   Collections   │
                       │ • Domain Rules  │
                       └─────────────────┘
```

## Use Cases

### 🎼 RenderX Sequence Validation
- **Symphony Definitions** - Validate musical sequence structures
- **Beat Validation** - Ensure proper beat numbering and dependencies
- **Event Types** - Enforce naming conventions for events
- **Documentation** - Validate description quality and completeness

### 🏢 Enterprise Architecture
- **Module Boundaries** - Enforce import restrictions
- **Naming Standards** - Consistent file and class naming
- **Code Organization** - Proper folder structure
- **Documentation** - Required comments and documentation

### 🤖 AI-Driven Development
- **Rule Generation** - AI agents can create validation rules
- **Auto-Remediation** - Automated fixes for common violations
- **Quality Gates** - Prevent architectural drift in AI-generated code

## Why Valence?

### 🚀 **Portable**
- No database dependencies
- Runs anywhere Node.js runs
- File-based configuration
- Easy to version control

### 🔧 **Extensible**
- Plugin system for custom logic
- JSON-based rule definitions
- Configurable validation parameters
- Domain-specific profiles

### 🤖 **AI-Friendly**
- Designed for agent collaboration
- Clear, structured output
- Programmatic interface
- Automated rule generation

### 📊 **Production-Ready**
- Comprehensive error handling
- Multiple output formats
- CI/CD integration
- Real-world validated (RenderX)

## Next Steps

1. **[Install Valence](Installing-and-Running)** - Get up and running
2. **[Try Examples](Example-Validations)** - See validation in action
3. **[Create Validators](Writing-a-Validator-JSON)** - Build your own rules
4. **[Write Plugins](Writing-a-Plugin-JS)** - Add custom logic

---

*Ready to enforce architectural consistency across your codebase? Let's get started!*
