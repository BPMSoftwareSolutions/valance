# Valence

**Valence** is a modular, portable architecture validation engine designed to enforce structural integrity, naming conventions, and domain-specific architectural rules across any codebase. It is built with Node.js and designed for cross-environment execution, including support for AI agent collaboration.

---

## 🧠 Architecture & Technology Stack

- **Runtime**: Node.js (ESM-compatible)
- **Configuration**: JSON-based validator definitions and profiles
- **Plugins**: Optional evaluator plugins in JavaScript or WASM
- **CLI**: Built with `yargs` or `commander`
- **File Access**: Uses glob patterns and the `fs` module
- **No database required**

---

## 🏗️ Core Functionality

Valence performs architecture validation in a portable, agent-executable way:

- **File presence checks** - Validate required files exist
- **Regex and semantic validations** - Pattern matching and content validation
- **Import boundary enforcement** - Control dependencies and module access
- **Domain-specific structure enforcement** - Symphony patterns, sequence definitions
- **Plugin-based evaluator extensions** - Custom validation logic via JavaScript plugins
- **Profile-based validator orchestration** - Bundle validators for comprehensive validation
- **Built-in operators** - mustContain, matchesPattern, fileExists, hasExtension
- **Configuration-driven** - Centralized config with tempo ranges, naming patterns, complexity limits

---

## 💼 Business Domains

Valence is domain-agnostic and can be adapted to:

- **UI Frameworks** - React, RenderX, Vue.js component validation
- **Component Libraries** - Design system compliance and structure validation
- **Sequence Definitions** - RenderX symphony and sequence validation (migrated from C#)
- **File-based Design Systems** - Asset organization and naming conventions
- **Agent-driven Dev Workflows** - AI-compatible validation for automated development

Each domain is encapsulated by a **Profile** that bundles related validators and metadata.

### 🎼 RenderX Sequence Validation
Comprehensive validation for RenderX sequence definitions including:
- Required fields (name, description, key, tempo, movements)
- Musical properties (key signatures, tempo ranges, time signatures)
- Movement structure and beat validation
- Event type naming conventions
- Documentation quality and complexity metrics

---

## 💾 Data Access Layer

Valence operates without a database:

- All rule logic is file-based
- Validators and profiles are loaded from local disk
- File content is processed in memory using Node’s `fs` module

---

## 🔐 Authentication & Authorization

Valence does not implement authentication or authorization by default. When deployed in remote or CI/CD environments, it defers authentication to the surrounding infrastructure or plugin registry access controls.

---

## ⚙️ Key Configuration Files

- **`valence.config.json`**: Centralized configuration with validation rules, tempo ranges, musical keys, naming patterns
- **`profiles/*.json`**: Domain-specific validator bundles (e.g., renderx-sequence-profile)
- **`validators/*.json`**: Single validator definitions with plugin references
- **`plugins/*.js`**: JavaScript plugins for custom validation logic
- **`plugins/sequenceParser.js`**: Shared utility for parsing sequence objects
- **`cli/cli.js`**: CLI entrypoint with full argument parsing
- **`package.json`**: Project dependencies and NPM scripts
- **`.reports/`**: Generated validation reports (HTML, JSON, Markdown)

---

## 🚀 Deployment Requirements

- Node.js v16 or higher
- No build step needed
- CLI can be linked globally via `npm link`
- Supports both local and remote (plugin-registry based) operation

---

## 📖 Usage

### Installation
```bash
npm install
```

### Basic Commands

#### Run a single validator
```bash
node cli/cli.js --validator sequence-definition --files "test/**/*.js"
```

#### Run multiple validators
```bash
node cli/cli.js --validators sequence-definition component-boundaries --files "**/*.js"
```

#### Run validators from a profile
```bash
node cli/cli.js --profile renderx-profile --files "test/**/*.js"
```

#### Dry-run mode (show what would be validated)
```bash
node cli/cli.js --validator sequence-definition --files "test/**/*.js" --dry-run
```

#### JSON output format
```bash
node cli/cli.js --validator sequence-definition --files "test/**/*.js" --format json
```

### NPM Scripts
```bash
npm run test                    # Run sequence-definition validator on test files
npm run test-plugin            # Test symphony structure plugin validation
npm run test-sequence-good     # Test good sequence validation
npm run test-sequence-bad      # Test bad sequence validation (shows failures)
npm run test-sequence-profile  # Test complete RenderX sequence profile
npm run dry-run               # Dry-run mode
npm run validate-all          # Run all validators on all JS files
npm run test-profile          # Test using renderx-profile
```

### CLI Options
- `--profile, -p`: Run validators from a specific profile
- `--validator, -v`: Run a single validator
- `--validators, -vs`: Run multiple specific validators
- `--files, -f`: File pattern to validate (glob pattern, default: `**/*`)
- `--dry-run, -d`: Show what would be validated without running
- `--format`: Output format (`json` or `table`, default: `table`)

## 🎼 RenderX Sequence Validation

Valence includes comprehensive sequence validation capabilities migrated from C# SequenceValidator:

### Available Sequence Validators
- **`sequence-required-fields`**: Validates name, description, key, tempo, movements
- **`sequence-musical-properties`**: Key signatures, tempo ranges, time signatures
- **`sequence-movements`**: Movement structure and required fields
- **`sequence-beats`**: Beat numbering, dependencies, and properties
- **`sequence-event-types`**: Event type naming conventions
- **`sequence-naming-conventions`**: Sequence name patterns (strict mode)
- **`sequence-documentation`**: Documentation quality (strict mode)
- **`sequence-complexity`**: Complexity metrics (strict mode)

### RenderX Validation Examples
```bash
# Validate RenderX sequences with comprehensive profile
node cli/cli.js --profile renderx-sequence-profile --files ".testdata/RenderX/src/**/*sequence*.ts"

# Individual validator testing
node cli/cli.js --validator sequence-beats --files "path/to/sequence.ts"

# Generate JSON report for CI/CD
node cli/cli.js --profile renderx-sequence-profile --files "src/**/*sequence*.ts" --format json > .reports/validation-report.json
```

### Production Validation Results
✅ **6 RenderX sequence files validated successfully**
✅ **100% pass rate across all 8 validators**
✅ **Zero validation failures - production ready**

## 🔌 Plugin System

Valence supports custom validation logic through JavaScript plugins:

### Plugin Interface
```javascript
export const operator = "customValidator";

export async function evaluate(content, rule, context) {
  // Custom validation logic
  return {
    passed: boolean,
    message?: string
  };
}
```

### Using Plugins in Validators
```json
{
  "name": "custom-validator",
  "type": "content",
  "filePattern": ".*\\.js$",
  "rules": [
    {
      "plugin": "customValidator",
      "customOption": true,
      "message": "Custom validation failed"
    }
  ]
}
```

## ⚙️ Configuration System

Valence uses `valence.config.json` for centralized configuration:

```json
{
  "validation": {
    "minTempo": 60,
    "maxTempo": 200,
    "requiredTimeSignature": "4/4",
    "maxBeatsPerSequence": 12,
    "minDescriptionLength": 20
  },
  "musicalKeys": ["C Major", "D Major", "E Major", ...],
  "namingConventions": {
    "sequencePattern": "^[A-Z][a-zA-Z\\s]+Symphony No\\. \\d+$",
    "eventTypePattern": "^[A-Z_]{4,}$"
  },
  "complexity": {
    "maxBeatsWarning": 12,
    "maxMovementsWarning": 3
  }
}
```

## 📊 Reporting

Valence generates comprehensive validation reports in multiple formats:

- **HTML Dashboard**: Visual reports with charts and status indicators
- **JSON Reports**: Structured data for CI/CD integration
- **Markdown Summaries**: Executive summaries for stakeholders
- **Console Output**: Real-time validation feedback

Reports are automatically saved to the `.reports/` folder with timestamps.

---

Valence enables consistent, portable architecture governance—whether you're validating symphonies in RenderX or microservices in a distributed system.