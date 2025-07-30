# Installing & Running

Get Valence up and running in minutes with this step-by-step guide.

## Prerequisites

- **Node.js** v16 or higher
- **npm** or **yarn** package manager
- **Git** (for cloning the repository)

## Installation

### Option 1: Clone from GitHub
```bash
# Clone the repository
git clone https://github.com/BPMSoftwareSolutions/valance.git
cd valance

# Install dependencies
npm install

# Verify installation
npm run test
```

### Option 2: NPM Package (Future)
```bash
# When published to npm
npm install -g valence-cli
valence --version
```

## First Validation

Let's run your first validation to make sure everything works:

```bash
# Test with built-in sample
npm run test

# Expected output:
# ✅ PASS sequence-definition - All checks passed
```

## Basic Commands

### Single Validator
```bash
# Run one validator on specific files
node cli/cli.js --validator sequence-definition --files "test/**/*.js"
```

### Multiple Validators
```bash
# Run multiple validators
node cli/cli.js --validators sequence-definition component-boundaries --files "**/*.js"
```

### Profile-Based Validation
```bash
# Run a complete validation profile
node cli/cli.js --profile renderx-profile --files "test/**/*.js"
```

### Dry Run Mode
```bash
# See what would be validated without running
node cli/cli.js --validator sequence-definition --files "test/**/*.js" --dry-run
```

### JSON Output
```bash
# Get structured output for CI/CD
node cli/cli.js --validator sequence-definition --files "test/**/*.js" --format json
```

## Available NPM Scripts

```bash
npm run test                    # Basic validation test
npm run test-plugin            # Test plugin-based validation
npm run test-sequence-good     # Test valid sequence
npm run test-sequence-bad      # Test invalid sequence (shows failures)
npm run test-sequence-profile  # Complete RenderX sequence validation
npm run dry-run               # Dry-run mode demonstration
npm run validate-all          # Run all validators
npm run test-profile          # Test profile-based validation
```

## CLI Options Reference

| Option | Short | Description | Example |
|--------|-------|-------------|---------|
| `--profile` | `-p` | Run validators from a profile | `--profile renderx-profile` |
| `--validator` | `-v` | Run a single validator | `--validator sequence-beats` |
| `--validators` | `-vs` | Run multiple validators | `--validators val1 val2` |
| `--files` | `-f` | File pattern to validate | `--files "src/**/*.js"` |
| `--dry-run` | `-d` | Show plan without executing | `--dry-run` |
| `--format` | | Output format | `--format json` |

## Validation Workflow

### 1. Choose Your Approach
- **Single Validator** - Test specific rules
- **Multiple Validators** - Run related checks
- **Profile** - Comprehensive validation

### 2. Specify Files
```bash
# Specific files
--files "src/components/Button.js"

# Glob patterns
--files "src/**/*.js"
--files "test/**/*sequence*.ts"

# Multiple patterns
--files "src/**/*.js" "test/**/*.ts"
```

### 3. Review Results
- **Console Output** - Real-time feedback
- **JSON Format** - For automation
- **Reports** - Generated in `.reports/` folder

## Troubleshooting

### Common Issues

#### "Command not found"
```bash
# Make sure you're in the project directory
cd /path/to/valence

# Use full path to CLI
node cli/cli.js --help
```

#### "No files found"
```bash
# Check your file pattern
node cli/cli.js --validator sequence-definition --files "**/*.js" --dry-run

# Use absolute paths if needed
node cli/cli.js --validator sequence-definition --files "/full/path/to/files/**/*.js"
```

#### "Validator not found"
```bash
# List available validators
ls validators/

# Check validator name matches file name (without .json)
node cli/cli.js --validator sequence-required-fields --files "test/*.js"
```

### Debug Mode
```bash
# Enable verbose output (if implemented)
DEBUG=valence* node cli/cli.js --validator sequence-definition --files "test/**/*.js"
```

## Configuration

### Global Configuration
Create `valence.config.json` in your project root:
```json
{
  "validation": {
    "minTempo": 60,
    "maxTempo": 200,
    "requiredTimeSignature": "4/4"
  },
  "musicalKeys": ["C Major", "D Major", "E Major"],
  "namingConventions": {
    "sequencePattern": "^[A-Z][a-zA-Z\\s]+Symphony No\\. \\d+$"
  }
}
```

### Environment Variables
```bash
# Set custom config path
VALENCE_CONFIG=/path/to/custom/config.json node cli/cli.js --validator test
```

## Next Steps

1. **[Try Examples](Example-Validations.md)** - Run sample validations
2. **[Create Your First Validator](../Profiles%20%26%20Validators/Writing-a-Validator-JSON.md)** - Build custom rules
3. **[Explore RenderX Examples](../Profiles%20%26%20Validators/Domain-Specific-Examples.md)** - See real-world usage
4. **[Set up CI/CD](../CI-CD%20Integration/GitHub-Actions.md)** - Automate validation

---

*Ready to validate? Let's explore some examples!*
