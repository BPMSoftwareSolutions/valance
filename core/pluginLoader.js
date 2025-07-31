import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

export async function loadPlugins() {
  const customOperators = {};
  
  try {
    // Load plugins from both legacy and architecture-specific directories
    const pluginPatterns = [
      'plugins/*.js',
      'plugins/SPA/*.js',
      'plugins/AppCore/*.js',
      'plugins/Backend/*.js',
      'plugins/Shared/*.js',
      'plugins/CIA/*.js'
    ];

    for (const pattern of pluginPatterns) {
      try {
        const pluginFiles = await glob(pattern);

        for (const pluginFile of pluginFiles) {
          try {
            const pluginPath = path.resolve(pluginFile);
            const plugin = await import(`file://${pluginPath.replace(/\\/g, '/')}`);
            if (plugin.operators) {
              Object.assign(customOperators, plugin.operators);
            }
          } catch (error) {
            console.warn(`Failed to load plugin ${pluginFile}: ${error.message}`);
          }
        }
      } catch (error) {
        // Pattern not found, continue
      }
    }
  } catch (error) {
    // No plugins directory or no plugins found
  }
  
  return customOperators;
}