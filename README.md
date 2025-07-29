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

- File presence checks
- Regex and semantic validations
- Import boundary enforcement
- Domain-specific structure enforcement (e.g., symphony patterns)
- Plugin-based evaluator extensions
- Profile-based validator orchestration

---

## 💼 Business Domains

Valence is domain-agnostic and can be adapted to:

- UI Frameworks like React or RenderX
- Component libraries
- File-based design systems
- Agent-driven dev workflows

Each domain is encapsulated by a **Profile** that bundles related validators and metadata.

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

- `profiles/*.json`: Domain-specific validator bundles
- `validators/*.json`: Single validator definitions
- `plugins/*.js`: JavaScript plugins for advanced logic
- `cli/cli.js`: CLI entrypoint
- `package.json`: Project dependencies and metadata

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
npm run test          # Run sequence-definition validator on test files
npm run dry-run       # Dry-run mode
npm run validate-all  # Run all validators on all JS files
npm run test-profile  # Test using renderx-profile
```

### CLI Options
- `--profile, -p`: Run validators from a specific profile
- `--validator, -v`: Run a single validator
- `--validators, -vs`: Run multiple specific validators
- `--files, -f`: File pattern to validate (glob pattern, default: `**/*`)
- `--dry-run, -d`: Show what would be validated without running
- `--format`: Output format (`json` or `table`, default: `table`)

---

Valence enables consistent, portable architecture governance—whether you're validating symphonies in RenderX or microservices in a distributed system.