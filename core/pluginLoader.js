import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

export async function loadPlugins() {
  const customOperators = {};
  
  try {
    const pluginFiles = await glob('plugins/*.js');
    
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
    // No plugins directory or no plugins found
  }
  
  return customOperators;
}