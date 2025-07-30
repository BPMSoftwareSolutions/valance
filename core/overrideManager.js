/**
 * Override Manager for False Positive Handling
 * Allows users to mark violations as false positives and track them for improvement
 */

import fs from 'fs/promises';
import path from 'path';

export class OverrideManager {
  constructor(overrideFilePath = '.valence-overrides.json') {
    this.overrideFilePath = overrideFilePath;
    this.overrides = new Map();
  }

  /**
   * Load overrides from file
   */
  async loadOverrides() {
    try {
      const content = await fs.readFile(this.overrideFilePath, 'utf8');
      const data = JSON.parse(content);
      
      for (const [key, override] of Object.entries(data.overrides || {})) {
        this.overrides.set(key, override);
      }
      
      return this.overrides;
    } catch (error) {
      // File doesn't exist or is invalid, start with empty overrides
      return this.overrides;
    }
  }

  /**
   * Save overrides to file
   */
  async saveOverrides() {
    const data = {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      overrides: Object.fromEntries(this.overrides)
    };
    
    await fs.writeFile(this.overrideFilePath, JSON.stringify(data, null, 2));
  }

  /**
   * Generate a unique key for a violation
   */
  generateViolationKey(violation, filePath) {
    const components = [
      violation.rule,
      filePath,
      violation.line || 'unknown',
      violation.message.substring(0, 50) // First 50 chars of message
    ];
    
    return Buffer.from(components.join('|')).toString('base64').substring(0, 16);
  }

  /**
   * Add an override for a violation
   */
  async addOverride(violation, filePath, reason, user = 'unknown') {
    const key = this.generateViolationKey(violation, filePath);
    
    const override = {
      violationKey: key,
      rule: violation.rule,
      filePath,
      line: violation.line,
      message: violation.message,
      status: 'false_positive',
      reason,
      addedBy: user,
      addedAt: new Date().toISOString(),
      originalConfidence: violation.confidence
    };
    
    this.overrides.set(key, override);
    await this.saveOverrides();
    
    return key;
  }

  /**
   * Check if a violation is overridden
   */
  isOverridden(violation, filePath) {
    const key = this.generateViolationKey(violation, filePath);
    return this.overrides.has(key);
  }

  /**
   * Get override information for a violation
   */
  getOverride(violation, filePath) {
    const key = this.generateViolationKey(violation, filePath);
    return this.overrides.get(key);
  }

  /**
   * Apply overrides to validation results
   */
  applyOverrides(results) {
    return results.map(result => {
      if (!result.violations) return result;

      const activeViolations = [];
      const overriddenViolations = [];

      for (const violation of result.violations) {
        if (this.isOverridden(violation, violation.filePath || violation.file)) {
          const override = this.getOverride(violation, violation.filePath || violation.file);
          overriddenViolations.push({
            ...violation,
            status: 'false_positive',
            overrideReason: override.reason,
            overriddenBy: override.addedBy,
            overriddenAt: override.addedAt
          });
        } else {
          activeViolations.push(violation);
        }
      }

      return {
        ...result,
        violations: activeViolations,
        overriddenViolations,
        passed: activeViolations.length === 0
      };
    });
  }

  /**
   * Get statistics about overrides
   */
  getOverrideStatistics() {
    const overrides = Array.from(this.overrides.values());
    
    const stats = {
      total: overrides.length,
      byRule: {},
      byUser: {},
      recent: overrides.filter(o => {
        const addedAt = new Date(o.addedAt);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return addedAt > weekAgo;
      }).length
    };

    for (const override of overrides) {
      stats.byRule[override.rule] = (stats.byRule[override.rule] || 0) + 1;
      stats.byUser[override.addedBy] = (stats.byUser[override.addedBy] || 0) + 1;
    }

    return stats;
  }

  /**
   * Remove an override
   */
  async removeOverride(violationKey) {
    const removed = this.overrides.delete(violationKey);
    if (removed) {
      await this.saveOverrides();
    }
    return removed;
  }

  /**
   * List all overrides
   */
  listOverrides() {
    return Array.from(this.overrides.values());
  }

  /**
   * Export overrides for sharing or backup
   */
  exportOverrides() {
    return {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      overrides: Object.fromEntries(this.overrides)
    };
  }

  /**
   * Import overrides from another system
   */
  async importOverrides(data, merge = true) {
    if (!merge) {
      this.overrides.clear();
    }

    for (const [key, override] of Object.entries(data.overrides || {})) {
      this.overrides.set(key, {
        ...override,
        importedAt: new Date().toISOString()
      });
    }

    await this.saveOverrides();
    return this.overrides.size;
  }
}

/**
 * CLI helper for managing overrides
 */
export async function createOverrideFromCLI(violationData, reason, user) {
  const manager = new OverrideManager();
  await manager.loadOverrides();
  
  const key = await manager.addOverride(
    violationData.violation,
    violationData.filePath,
    reason,
    user
  );
  
  console.log(`✅ Override created with key: ${key}`);
  console.log(`   Rule: ${violationData.violation.rule}`);
  console.log(`   File: ${violationData.filePath}`);
  console.log(`   Reason: ${reason}`);
  
  return key;
}

/**
 * Generate override template for easy creation
 */
export function generateOverrideTemplate(violation, filePath) {
  return {
    violationKey: 'auto-generated',
    rule: violation.rule,
    filePath,
    line: violation.line,
    message: violation.message,
    status: 'false_positive',
    reason: 'TODO: Explain why this is a false positive',
    addedBy: 'TODO: Your name/email',
    addedAt: new Date().toISOString(),
    originalConfidence: violation.confidence
  };
}
