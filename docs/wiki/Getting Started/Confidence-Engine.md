# 🎯 Valence Confidence Engine (VCE)

The **Valence Confidence Engine** transforms traditional binary pass/fail validation into a nuanced, confidence-driven system that helps developers prioritize issues, trust results, and collaborate effectively.

## 🌟 Overview

Traditional validation systems give you binary results: pass or fail. The Confidence Engine adds a crucial dimension: **how confident are we in each violation?**

Every violation now includes:
- **Confidence Score** (0.0-1.0) - How certain we are this is a real issue
- **Rich Metadata** - Code snippets, line numbers, auto-fix suggestions
- **Severity Levels** - Error, Warning, Info with visual indicators
- **Explainable Context** - Why this violation occurred and its impact

## 🎯 Key Features

### **1. Confidence Scoring**
Every violation includes a confidence score from 0.0 (uncertain) to 1.0 (certain):

```json
{
  "rule": "forbiddenImport",
  "message": "Import from src/internal violates architectural rule",
  "confidence": 0.95,
  "severity": "error",
  "line": 12,
  "code": "import x from '../../internal/config';"
}
```

### **2. Threshold Filtering**
Filter violations by confidence level to focus on high-priority issues:

```bash
# Only show violations with 90%+ confidence
node cli/cli.js --validator import-path-validation --files "*.ts" --confidence-threshold 0.9
```

### **3. Enhanced Reporting**
Generate comprehensive reports with confidence analysis:

- **📄 Markdown Reports** - Confidence tables and analysis
- **🌐 HTML Dashboards** - Interactive confidence visualization
- **📋 JSON Data** - Structured data for automation

### **4. False Positive Management**
Override system for managing known false positives:

```bash
# Apply team overrides
node cli/cli.js --validator integration-flow-validation --files "*.tsx" --show-overrides
```

## 🔧 Configuration

### **Global Configuration (.valencerc)**
```json
{
  "confidenceThreshold": 0.8,
  "reportOptions": {
    "includeCodeSnippets": true,
    "showLowConfidence": true,
    "generateReports": true
  }
}
```

### **Validator-Level Configuration**
```json
{
  "name": "import-path-validation",
  "confidenceThreshold": 0.7,
  "rules": [
    {
      "plugin": "validateImports",
      "forbiddenImports": ["src/internal"]
    }
  ]
}
```

## 📊 Confidence Levels

| Level | Range | Description | Action |
|-------|-------|-------------|---------|
| **High** | 90-100% | Very confident this is a real issue | Fix immediately |
| **Medium** | 70-89% | Likely a real issue | Review and fix |
| **Low** | 0-69% | Uncertain, may be false positive | Manual verification needed |

## 🚫 Override System

### **Creating Overrides**
Mark violations as false positives:

```json
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

### **Override Commands**
```bash
# Show override statistics
node cli/cli.js --validator import-path-validation --files "*.ts" --show-overrides

# Apply overrides (default: true)
node cli/cli.js --validator import-path-validation --files "*.ts" --apply-overrides
```

## 📈 Enhanced Output Examples

### **CLI Output with Confidence**
```
❌ FAIL import-path-validation - Found 3 violation(s)
    🟥 Forbidden import detected (Line 12)
      Confidence: 95% | Rule: forbiddenImport
      Code: import x from 'src/internal/config';
      💡 Suggested fix: import x from 'src/public/config';

    🟨 Import path depth incorrect (Line 24)
      Confidence: 85% | Rule: importPathViolation
      ⚠️ This rule may require manual verification.

📋 Override Statistics: 2 total overrides, 1 added this week
```

### **Confidence Analysis**
```
🎯 Confidence Analysis

| Confidence Level | Count | Percentage |
|------------------|-------|------------|
| High (≥90%)      | 8     | 61.5%      |
| Medium (70-89%)  | 5     | 38.5%      |
| Low (<70%)       | 0     | 0.0%       |

⚠️ 0 violations have low confidence and may require manual verification.
```

## 🤖 AI Agent Integration

The Confidence Engine is designed to be AI-agent friendly:

### **Structured Data**
```json
{
  "violations": [
    {
      "rule": "forbiddenImport",
      "confidence": 0.95,
      "severity": "error",
      "autoFixSuggestion": "import x from 'src/public/config';",
      "impact": "Violates architectural boundaries"
    }
  ]
}
```

### **Agent Decision Making**
- **High Confidence (≥90%)** - Auto-fix if suggestion available
- **Medium Confidence (70-89%)** - Flag for human review
- **Low Confidence (<70%)** - Skip or request human verification

## 🎼 Supported Validators

The Confidence Engine currently supports:

### **Import Path Validation**
- **Confidence Factors**: Exact match (100%), prefix match (95%), substring (85%)
- **Auto-fix**: Corrected import paths with proper depth
- **Impact Analysis**: Architectural boundary violations

### **Integration Flow Validation**
- **Confidence Factors**: Handler detection (92%), symphony registration (88%)
- **Auto-fix**: Missing symphony calls and registration patterns
- **Impact Analysis**: Runtime failures and broken musical architecture

### **Legacy Validators**
- **Default Confidence**: 100% for existing validators
- **Backward Compatibility**: Seamless integration with existing rules

## 🚀 Getting Started

1. **Run with Confidence Engine**:
   ```bash
   node cli/cli.js --validator import-path-validation --files "src/**/*.ts" --generate-reports
   ```

2. **Set Confidence Threshold**:
   ```bash
   node cli/cli.js --validator import-path-validation --files "*.ts" --confidence-threshold 0.8
   ```

3. **Generate Enhanced Reports**:
   ```bash
   node cli/cli.js --validator integration-flow-validation --files "*.tsx" --generate-reports --report-dir reports/confidence
   ```

4. **View Results**:
   - Open `reports/validation-report.html` for interactive dashboard
   - Check `reports/validation-report.md` for detailed analysis
   - Use `reports/validation-report.json` for automation

## 🎯 Best Practices

### **For Developers**
- **Start with high confidence** (≥90%) violations first
- **Use auto-fix suggestions** when available
- **Review medium confidence** (70-89%) violations manually
- **Create overrides** for known false positives

### **For Teams**
- **Set team confidence thresholds** in `.valencerc`
- **Share override files** for consistent false positive handling
- **Track confidence trends** to improve validation rules
- **Use reports** for code review and quality metrics

### **For CI/CD**
- **Use confidence thresholds** to prevent noisy builds
- **Generate JSON reports** for automated processing
- **Apply team overrides** in CI environment
- **Track validation quality** over time

---

The Valence Confidence Engine makes validation results **explainable, trustworthy, and actionable** - helping teams build better software with confidence! 🎉
