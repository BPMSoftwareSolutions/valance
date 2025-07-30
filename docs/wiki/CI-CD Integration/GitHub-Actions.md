# GitHub Actions

Integrate Valence validation into your CI/CD pipeline with GitHub Actions for automated architecture governance.

## Basic Workflow

### Simple Validation Workflow
```yaml
# .github/workflows/valence-validation.yml
name: Architecture Validation

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  validate:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm install
      
    - name: Run Valence validation
      run: |
        node cli/cli.js --profile renderx-sequence-profile --files "src/**/*sequence*.ts" --format json > validation-results.json
        
    - name: Check validation results
      run: |
        if [ $(jq '.[] | select(.passed == false) | length' validation-results.json) -gt 0 ]; then
          echo "❌ Validation failed"
          cat validation-results.json
          exit 1
        else
          echo "✅ All validations passed"
        fi
```

## Advanced Workflows

### Multi-Profile Validation
```yaml
name: Comprehensive Architecture Validation

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  validate-sequences:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    - run: npm install
    
    - name: Validate RenderX Sequences
      run: |
        node cli/cli.js --profile renderx-sequence-profile --files "src/**/*sequence*.ts" --format json > sequence-results.json
        
    - name: Upload sequence results
      uses: actions/upload-artifact@v4
      with:
        name: sequence-validation-results
        path: sequence-results.json

  validate-components:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    - run: npm install
    
    - name: Validate React Components
      run: |
        node cli/cli.js --profile react-enterprise-profile --files "src/components/**/*" --format json > component-results.json
        
    - name: Upload component results
      uses: actions/upload-artifact@v4
      with:
        name: component-validation-results
        path: component-results.json

  generate-report:
    needs: [validate-sequences, validate-components]
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    - run: npm install
    
    - name: Download validation results
      uses: actions/download-artifact@v4
      with:
        pattern: '*-validation-results'
        merge-multiple: true
        
    - name: Generate comprehensive report
      run: |
        node scripts/generate-report.js sequence-results.json component-results.json > comprehensive-report.html
        
    - name: Upload report
      uses: actions/upload-artifact@v4
      with:
        name: validation-report
        path: comprehensive-report.html
```

### Conditional Validation
```yaml
name: Smart Validation

on:
  pull_request:
    branches: [ main ]

jobs:
  detect-changes:
    runs-on: ubuntu-latest
    outputs:
      sequences-changed: ${{ steps.changes.outputs.sequences }}
      components-changed: ${{ steps.changes.outputs.components }}
    steps:
    - uses: actions/checkout@v4
    - uses: dorny/paths-filter@v2
      id: changes
      with:
        filters: |
          sequences:
            - 'src/**/*sequence*.ts'
          components:
            - 'src/components/**/*'

  validate-sequences:
    needs: detect-changes
    if: needs.detect-changes.outputs.sequences-changed == 'true'
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    - run: npm install
    - name: Validate changed sequences
      run: node cli/cli.js --profile renderx-sequence-profile --files "src/**/*sequence*.ts"

  validate-components:
    needs: detect-changes
    if: needs.detect-changes.outputs.components-changed == 'true'
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    - run: npm install
    - name: Validate changed components
      run: node cli/cli.js --profile react-enterprise-profile --files "src/components/**/*"
```

## Reporting Integration

### Generate HTML Reports
```yaml
- name: Generate HTML Report
  run: |
    node cli/cli.js --profile renderx-sequence-profile --files "src/**/*sequence*.ts" --format json > results.json
    node scripts/generate-html-report.js results.json > validation-report.html
    
- name: Deploy Report to GitHub Pages
  uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./reports
```

### Slack Notifications
```yaml
- name: Notify Slack on Failure
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: failure
    channel: '#architecture'
    text: |
      🚨 Architecture validation failed in ${{ github.repository }}
      Branch: ${{ github.ref }}
      Commit: ${{ github.sha }}
      View details: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### Teams Integration
```yaml
- name: Notify Teams on Success
  if: success()
  uses: skitionek/notify-microsoft-teams@master
  with:
    webhook_url: ${{ secrets.TEAMS_WEBHOOK }}
    overwrite: |
      {
        "text": "✅ Architecture validation passed for ${{ github.repository }}",
        "sections": [
          {
            "activityTitle": "Validation Results",
            "activitySubtitle": "All architecture rules validated successfully",
            "facts": [
              {"name": "Repository", "value": "${{ github.repository }}"},
              {"name": "Branch", "value": "${{ github.ref }}"},
              {"name": "Commit", "value": "${{ github.sha }}"}
            ]
          }
        ]
      }
```

## Custom Actions

### Reusable Valence Action
```yaml
# .github/actions/valence-validate/action.yml
name: 'Valence Validation'
description: 'Run Valence architecture validation'
inputs:
  profile:
    description: 'Validation profile to use'
    required: true
  files:
    description: 'File pattern to validate'
    required: true
  format:
    description: 'Output format (json or table)'
    required: false
    default: 'table'
    
runs:
  using: 'composite'
  steps:
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm install
      shell: bash
      
    - name: Run validation
      run: |
        node cli/cli.js --profile ${{ inputs.profile }} --files "${{ inputs.files }}" --format ${{ inputs.format }}
      shell: bash
```

### Using the Custom Action
```yaml
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: ./.github/actions/valence-validate
      with:
        profile: 'renderx-sequence-profile'
        files: 'src/**/*sequence*.ts'
        format: 'json'
```

## Matrix Validation

### Multiple Profile Testing
```yaml
jobs:
  validate:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        profile: 
          - renderx-sequence-profile
          - react-enterprise-profile
          - microservice-profile
        include:
          - profile: renderx-sequence-profile
            files: 'src/**/*sequence*.ts'
          - profile: react-enterprise-profile
            files: 'src/components/**/*'
          - profile: microservice-profile
            files: 'services/**/*'
            
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    - run: npm install
    
    - name: Validate with ${{ matrix.profile }}
      run: |
        node cli/cli.js --profile ${{ matrix.profile }} --files "${{ matrix.files }}"
```

## Security Considerations

### Secure Secrets Usage
```yaml
- name: Validate with custom config
  run: |
    echo "${{ secrets.VALENCE_CONFIG }}" > valence.config.json
    node cli/cli.js --profile secure-profile --files "src/**/*"
  env:
    VALENCE_CONFIG: ${{ secrets.VALENCE_CONFIG }}
```

### Dependency Scanning
```yaml
- name: Audit dependencies
  run: npm audit --audit-level high
  
- name: Check for vulnerabilities
  uses: actions/dependency-review-action@v3
```

## Performance Optimization

### Caching Strategy
```yaml
- name: Cache Valence results
  uses: actions/cache@v3
  with:
    path: .valence-cache
    key: valence-${{ hashFiles('src/**/*') }}-${{ hashFiles('validators/**/*') }}
    restore-keys: |
      valence-${{ hashFiles('src/**/*') }}-
      valence-
```

### Parallel Execution
```yaml
jobs:
  validate:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        chunk: [1, 2, 3, 4]
    steps:
    - uses: actions/checkout@v4
    - name: Split files for parallel processing
      run: |
        find src -name "*.ts" | split -n l/${{ strategy.job-total }}/${{ matrix.chunk }} - chunk-${{ matrix.chunk }}.txt
    - name: Validate chunk
      run: |
        while read file; do
          node cli/cli.js --validator sequence-required-fields --files "$file"
        done < chunk-${{ matrix.chunk }}.txt
```

## Troubleshooting

### Common Issues

#### Node.js Version Mismatch
```yaml
- name: Debug Node version
  run: |
    node --version
    npm --version
    which node
```

#### File Pattern Issues
```yaml
- name: Debug file patterns
  run: |
    echo "Files found:"
    find . -name "*sequence*.ts" -type f
    node cli/cli.js --validator sequence-required-fields --files "**/*sequence*.ts" --dry-run
```

#### Permission Issues
```yaml
- name: Fix permissions
  run: |
    chmod +x cli/cli.js
    ls -la cli/
```

## Best Practices

### ✅ Do
- **Cache Dependencies** - Use npm cache for faster builds
- **Fail Fast** - Stop on first validation failure
- **Parallel Execution** - Run independent validations in parallel
- **Clear Reporting** - Generate readable reports
- **Secure Secrets** - Use GitHub secrets for sensitive config

### ❌ Don't
- **Ignore Failures** - Always fail the build on validation errors
- **Run Unnecessary Validations** - Use conditional execution
- **Hardcode Paths** - Use dynamic file discovery
- **Skip Documentation** - Document your validation workflows

## Next Steps

1. **[Set up Validation Badges](Validation-Badges.md)** - Show validation status
2. **[Use AI for Rules](../Agents%20%26%20Automation/Using-AI-to-Generate-Rules.md)** - Generate validation rules
3. **[Auto-fix Violations](Auto-Fix-Architecture-Violations.md)** - Automated remediation
4. **[Monitor Metrics](../Profiles%20%26%20Validators/Domain-Specific-Examples.md#reporting)** - Track validation trends

---

*Ready to show validation status? Let's create validation badges!*
