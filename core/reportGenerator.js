/**
 * Enhanced Report Generator with Error Legitimacy Metadata
 * Generates comprehensive reports with confidence scores, severity indicators, and code snippets
 */

import fs from 'fs/promises';
import path from 'path';

export class ReportGenerator {
  constructor(results, options = {}) {
    this.results = results;
    this.options = {
      includeCodeSnippets: true,
      confidenceThreshold: 0.7,
      showLowConfidence: true,
      ...options
    };
  }

  /**
   * Generate Markdown report with enhanced metadata
   */
  generateMarkdownReport() {
    const { passed, failed, totalViolations, lowConfidenceCount } = this.getStatistics();
    
    let report = `# Validation Report\n\n`;
    report += `**Generated:** ${new Date().toLocaleString()}\n`;
    report += `**Files Analyzed:** ${this.getTotalFilesAnalyzed()}\n\n`;
    
    // Summary section
    report += `## 📊 Summary\n\n`;
    report += `- ✅ **Passed:** ${passed} validators\n`;
    report += `- ❌ **Failed:** ${failed} validators\n`;
    report += `- 🔍 **Total Violations:** ${totalViolations}\n`;
    if (lowConfidenceCount > 0) {
      report += `- ⚠️ **Low Confidence:** ${lowConfidenceCount} (may need manual review)\n`;
    }
    report += `\n`;

    // Results section
    report += `## 📋 Validation Results\n\n`;
    
    const failedResults = this.results.filter(r => !r.passed);
    const passedResults = this.results.filter(r => r.passed);
    
    if (failedResults.length > 0) {
      report += `### ❌ FAILED VALIDATORS\n\n`;
      failedResults.forEach(result => {
        report += this.generateValidatorMarkdown(result, false);
      });
    }
    
    if (passedResults.length > 0) {
      report += `### ✅ PASSED VALIDATORS\n\n`;
      passedResults.forEach(result => {
        report += this.generateValidatorMarkdown(result, true);
      });
    }

    // Confidence analysis
    if (totalViolations > 0) {
      report += this.generateConfidenceAnalysis();
    }

    return report;
  }

  /**
   * Generate HTML report with enhanced styling and interactivity
   */
  generateHtmlReport() {
    const { passed, failed, totalViolations, lowConfidenceCount } = this.getStatistics();
    
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Validation Report</title>
    <style>
        ${this.getHtmlStyles()}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 Validation Report</h1>
            <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Files Analyzed:</strong> ${this.getTotalFilesAnalyzed()}</p>
        </div>

        <div class="summary">
            <div class="metric-card passed">
                <h3>${passed}</h3>
                <p>Passed</p>
            </div>
            <div class="metric-card failed">
                <h3>${failed}</h3>
                <p>Failed</p>
            </div>
            <div class="metric-card violations">
                <h3>${totalViolations}</h3>
                <p>Violations</p>
            </div>
            ${lowConfidenceCount > 0 ? `
            <div class="metric-card low-confidence">
                <h3>${lowConfidenceCount}</h3>
                <p>Low Confidence</p>
            </div>` : ''}
        </div>

        <div class="results">
            ${this.results.map(result => this.generateValidatorHtml(result)).join('')}
        </div>

        ${totalViolations > 0 ? this.generateConfidenceAnalysisHtml() : ''}
    </div>
</body>
</html>`;

    return html;
  }

  generateValidatorMarkdown(result, passed) {
    let section = `#### \`${result.validator}\`\n`;
    section += `- **Status:** ${passed ? '✅ PASS' : '❌ FAIL'}\n`;
    section += `- **Message:** ${result.message}\n`;
    
    if (result.violations && result.violations.length > 0) {
      section += `- **Violations:** ${result.violations.length}\n\n`;
      
      result.violations.forEach((violation, index) => {
        const severityIcon = this.getSeverityIcon(violation.severity);
        const confidenceText = `${(violation.confidence * 100).toFixed(0)}%`;
        
        section += `**Violation ${index + 1}:**\n`;
        section += `- ${severityIcon} **${violation.rule}** (Confidence: ${confidenceText})\n`;
        section += `- **Message:** ${violation.message}\n`;
        
        if (violation.line) {
          section += `- **Line:** ${violation.line}\n`;
        }
        
        if (violation.code) {
          section += `- **Code:** \`${violation.code}\`\n`;
        }
        
        if (violation.confidence < this.options.confidenceThreshold) {
          section += `- ⚠️ *This rule may require manual verification.*\n`;
        }
        
        if (violation.details) {
          if (violation.details.autoFixSuggestion) {
            section += `- **💡 Suggested Fix:** \`${violation.details.autoFixSuggestion}\`\n`;
          }
          if (violation.details.impact) {
            section += `- **Impact:** ${violation.details.impact}\n`;
          }
        }
        
        section += `\n`;
      });
    }
    
    if (result.lowConfidenceViolations && result.lowConfidenceViolations.length > 0) {
      section += `- **Low Confidence Violations:** ${result.lowConfidenceViolations.length} (filtered out)\n`;
    }
    
    section += `\n---\n\n`;
    return section;
  }

  generateValidatorHtml(result) {
    const passed = result.passed;
    const statusClass = passed ? 'passed' : 'failed';
    const statusIcon = passed ? '✅' : '❌';
    
    let html = `
    <div class="validator-result ${statusClass}">
        <div class="validator-header">
            <h3>${statusIcon} ${result.validator}</h3>
            <p>${result.message}</p>
        </div>`;
    
    if (result.violations && result.violations.length > 0) {
      html += `<div class="violations">`;
      
      result.violations.forEach((violation, index) => {
        const severityClass = violation.severity?.toLowerCase() || 'error';
        const confidenceText = `${(violation.confidence * 100).toFixed(0)}%`;
        const isLowConfidence = violation.confidence < this.options.confidenceThreshold;
        
        html += `
        <div class="violation ${severityClass} ${isLowConfidence ? 'low-confidence' : ''}">
            <div class="violation-header">
                <span class="severity-icon">${this.getSeverityIcon(violation.severity)}</span>
                <span class="rule-name">${violation.rule}</span>
                <span class="confidence">Confidence: ${confidenceText}</span>
                ${violation.line ? `<span class="line">Line ${violation.line}</span>` : ''}
            </div>
            <div class="violation-message">${violation.message}</div>
            ${violation.code ? `<div class="code-snippet"><code>${violation.code}</code></div>` : ''}
            ${isLowConfidence ? '<div class="low-confidence-warning">⚠️ This rule may require manual verification.</div>' : ''}
            ${violation.details?.autoFixSuggestion ? `<div class="auto-fix">💡 Suggested fix: <code>${violation.details.autoFixSuggestion}</code></div>` : ''}
            ${violation.details?.impact ? `<div class="impact">Impact: ${violation.details.impact}</div>` : ''}
        </div>`;
      });
      
      html += `</div>`;
    }
    
    if (result.lowConfidenceViolations && result.lowConfidenceViolations.length > 0) {
      html += `<div class="low-confidence-summary">📋 ${result.lowConfidenceViolations.length} low-confidence violations were filtered out</div>`;
    }
    
    html += `</div>`;
    return html;
  }

  generateConfidenceAnalysis() {
    const allViolations = this.getAllViolations();
    const highConfidence = allViolations.filter(v => v.confidence >= 0.9).length;
    const mediumConfidence = allViolations.filter(v => v.confidence >= 0.7 && v.confidence < 0.9).length;
    const lowConfidence = allViolations.filter(v => v.confidence < 0.7).length;
    
    let analysis = `## 🎯 Confidence Analysis\n\n`;
    analysis += `| Confidence Level | Count | Percentage |\n`;
    analysis += `|------------------|-------|------------|\n`;
    analysis += `| High (≥90%) | ${highConfidence} | ${((highConfidence / allViolations.length) * 100).toFixed(1)}% |\n`;
    analysis += `| Medium (70-89%) | ${mediumConfidence} | ${((mediumConfidence / allViolations.length) * 100).toFixed(1)}% |\n`;
    analysis += `| Low (<70%) | ${lowConfidence} | ${((lowConfidence / allViolations.length) * 100).toFixed(1)}% |\n\n`;
    
    if (lowConfidence > 0) {
      analysis += `⚠️ **${lowConfidence} violations have low confidence** and may require manual verification.\n\n`;
    }
    
    return analysis;
  }

  generateConfidenceAnalysisHtml() {
    const allViolations = this.getAllViolations();
    const highConfidence = allViolations.filter(v => v.confidence >= 0.9).length;
    const mediumConfidence = allViolations.filter(v => v.confidence >= 0.7 && v.confidence < 0.9).length;
    const lowConfidence = allViolations.filter(v => v.confidence < 0.7).length;
    
    return `
    <div class="confidence-analysis">
        <h2>🎯 Confidence Analysis</h2>
        <div class="confidence-chart">
            <div class="confidence-bar high" style="width: ${(highConfidence / allViolations.length) * 100}%">
                High (≥90%): ${highConfidence}
            </div>
            <div class="confidence-bar medium" style="width: ${(mediumConfidence / allViolations.length) * 100}%">
                Medium (70-89%): ${mediumConfidence}
            </div>
            <div class="confidence-bar low" style="width: ${(lowConfidence / allViolations.length) * 100}%">
                Low (<70%): ${lowConfidence}
            </div>
        </div>
        ${lowConfidence > 0 ? `<p class="low-confidence-note">⚠️ <strong>${lowConfidence} violations have low confidence</strong> and may require manual verification.</p>` : ''}
    </div>`;
  }

  getStatistics() {
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const totalViolations = this.results.reduce((sum, r) => sum + (r.violations?.length || 0), 0);
    const lowConfidenceCount = this.getAllViolations().filter(v => v.confidence < this.options.confidenceThreshold).length;
    
    return { passed, failed, totalViolations, lowConfidenceCount };
  }

  getAllViolations() {
    return this.results.flatMap(r => r.violations || []);
  }

  getTotalFilesAnalyzed() {
    return this.options.totalFilesAnalyzed || 'N/A';
  }

  getSeverityIcon(severity) {
    switch (severity?.toLowerCase()) {
      case 'error': return '🟥';
      case 'warning': return '🟨';
      case 'info': return '🟦';
      default: return '🔸';
    }
  }

  getHtmlStyles() {
    return `
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #333; margin: 0; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric-card { padding: 20px; border-radius: 8px; text-align: center; color: white; }
        .metric-card.passed { background: #28a745; }
        .metric-card.failed { background: #dc3545; }
        .metric-card.violations { background: #fd7e14; }
        .metric-card.low-confidence { background: #6c757d; }
        .metric-card h3 { margin: 0; font-size: 2em; }
        .validator-result { margin-bottom: 20px; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
        .validator-result.passed .validator-header { background: #d4edda; color: #155724; }
        .validator-result.failed .validator-header { background: #f8d7da; color: #721c24; }
        .validator-header { padding: 15px 20px; }
        .validator-header h3 { margin: 0; }
        .violations { padding: 20px; background: #f8f9fa; }
        .violation { margin-bottom: 15px; padding: 15px; border-radius: 6px; border-left: 4px solid #ddd; }
        .violation.error { border-left-color: #dc3545; background: #fff5f5; }
        .violation.warning { border-left-color: #ffc107; background: #fffbf0; }
        .violation.info { border-left-color: #17a2b8; background: #f0f9ff; }
        .violation.low-confidence { opacity: 0.8; }
        .violation-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; font-weight: bold; }
        .confidence { background: #e9ecef; padding: 2px 8px; border-radius: 4px; font-size: 0.9em; }
        .line { background: #007bff; color: white; padding: 2px 8px; border-radius: 4px; font-size: 0.9em; }
        .code-snippet { background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; margin: 10px 0; }
        .low-confidence-warning { color: #856404; background: #fff3cd; padding: 8px; border-radius: 4px; margin: 10px 0; }
        .auto-fix { color: #155724; background: #d4edda; padding: 8px; border-radius: 4px; margin: 10px 0; }
        .impact { color: #721c24; font-style: italic; margin: 10px 0; }
        .confidence-analysis { margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px; }
        .confidence-chart { margin: 20px 0; }
        .confidence-bar { padding: 10px; margin: 5px 0; border-radius: 4px; color: white; text-align: center; }
        .confidence-bar.high { background: #28a745; }
        .confidence-bar.medium { background: #ffc107; color: #212529; }
        .confidence-bar.low { background: #dc3545; }
    `;
  }
}

/**
 * Generate and save reports
 */
export async function generateReports(results, outputDir = 'reports', options = {}) {
  const generator = new ReportGenerator(results, options);
  
  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });
  
  // Generate Markdown report
  const markdownReport = generator.generateMarkdownReport();
  await fs.writeFile(path.join(outputDir, 'validation-report.md'), markdownReport);
  
  // Generate HTML report
  const htmlReport = generator.generateHtmlReport();
  await fs.writeFile(path.join(outputDir, 'validation-report.html'), htmlReport);
  
  // Generate JSON report
  const jsonReport = JSON.stringify(results, null, 2);
  await fs.writeFile(path.join(outputDir, 'validation-report.json'), jsonReport);
  
  return {
    markdown: path.join(outputDir, 'validation-report.md'),
    html: path.join(outputDir, 'validation-report.html'),
    json: path.join(outputDir, 'validation-report.json')
  };
}
