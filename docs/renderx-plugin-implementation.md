# RenderX Plugin System Implementation Guide

## Overview

This guide shows how to implement the runtime TypeScript plugin loading solution in the RenderX application.

## Current Status

✅ **Completed**: 
- Vite middleware for TypeScript transformation
- MusicalConductor updated with CommonJS loading approach
- Build scripts updated to use CommonJS format

❌ **Remaining**: 
- Implement proper dependency resolution for complex plugins

## Implementation Steps

### 1. Update MusicalConductor with Dependency Resolution

The current implementation in `MusicalConductor.ts` needs to be enhanced with the pre-loading approach:

```typescript
/**
 * Load plugin module with full dependency resolution
 */
private async loadPluginModule(pluginPath: string): Promise<any> {
  try {
    console.log(`🔄 Loading plugin module: ${pluginPath}`);
    
    // Extract plugin directory from path
    const pluginDir = pluginPath.substring(0, pluginPath.lastIndexOf('/'));
    const moduleCache = new Map<string, any>();
    
    // Helper function to load dependencies recursively
    const loadDependency = async (relativePath: string): Promise<any> => {
      const absolutePath = `${pluginDir}/${relativePath.replace("./", "")}`;
      const fullPath = absolutePath.endsWith('.js') ? absolutePath : `${absolutePath}.js`;
      
      if (moduleCache.has(fullPath)) {
        return moduleCache.get(fullPath);
      }
      
      console.log(`📦 Loading dependency: ${relativePath} -> ${fullPath}`);
      
      // Fetch dependency code
      const response = await fetch(fullPath);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const depCode = await response.text();
      
      // Create CommonJS environment for dependency
      const depModuleExports: any = {};
      const depModule = { exports: depModuleExports };
      
      // Nested require function
      const nestedRequire = (nestedPath: string) => {
        const resolvedPath = `${pluginDir}/${nestedPath.replace("./", "")}.js`;
        return moduleCache.get(resolvedPath) || {};
      };
      
      // Execute dependency
      const depWrappedCode = `
        (function(exports, require, module, console) {
          ${depCode}
          return module.exports;
        })
      `;
      
      const depModuleFactory = eval(depWrappedCode);
      const depResult = depModuleFactory(depModuleExports, nestedRequire, depModule, console);
      
      // Cache result
      moduleCache.set(fullPath, depResult);
      return depResult;
    };
    
    // Pre-load known dependencies for RenderX plugins
    console.log("🔄 Pre-loading plugin dependencies...");
    
    // Load common dependencies (adjust based on actual plugin structure)
    try {
      await loadDependency("./sequence");
    } catch (e) {
      console.log("No sequence.js dependency found");
    }
    
    try {
      await loadDependency("./handlers/index");
    } catch (e) {
      console.log("No handlers/index.js dependency found");
    }
    
    // Add other common dependencies as needed
    
    // Create synchronous require function
    const require = (relativePath: string) => {
      const absolutePath = `${pluginDir}/${relativePath.replace("./", "")}`;
      const fullPath = absolutePath.endsWith('.js') ? absolutePath : `${absolutePath}.js`;
      
      if (moduleCache.has(fullPath)) {
        console.log(`📋 Using cached module: ${relativePath}`);
        return moduleCache.get(fullPath);
      }
      
      console.warn(`⚠️ Module not found in cache: ${relativePath}`);
      return {};
    };
    
    // Load main plugin
    const response = await fetch(pluginPath);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const pluginCode = await response.text();
    console.log(`📦 Plugin code fetched (${pluginCode.length} chars)`);
    
    // Create CommonJS environment for main plugin
    const moduleExports: any = {};
    const module = { exports: moduleExports };
    
    // Execute main plugin
    const wrappedCode = `
      (function(exports, require, module, console) {
        ${pluginCode}
        return module.exports;
      })
    `;
    
    const moduleFactory = eval(wrappedCode);
    const pluginModule = moduleFactory(moduleExports, require, module, console);
    
    console.log(`✅ Plugin module loaded:`, Object.keys(pluginModule));
    return pluginModule;
    
  } catch (error) {
    console.error(`❌ Failed to load plugin module ${pluginPath}:`, error);
    throw error;
  }
}
```

### 2. Plugin Structure Analysis

Current RenderX plugins have this structure:
```
public/plugins/
├── App.app-shell-symphony/
│   ├── index.js (compiled from index.ts)
│   ├── sequence.js (compiled from sequence.ts)
│   ├── handlers/
│   │   └── index.js
│   └── components/
├── Canvas.component-drag-symphony/
│   ├── index.js
│   ├── sequence.js
│   ├── handlers/
│   ├── hooks/
│   └── logic/
└── ...
```

### 3. Dependency Discovery

For automatic dependency discovery, analyze the compiled JavaScript to find `require()` calls:

```typescript
/**
 * Extract dependencies from CommonJS code
 */
private extractDependencies(code: string): string[] {
  const requireRegex = /require\s*\(\s*["']([^"']+)["']\s*\)/g;
  const dependencies: string[] = [];
  let match;
  
  while ((match = requireRegex.exec(code)) !== null) {
    const dep = match[1];
    if (dep.startsWith('./') || dep.startsWith('../')) {
      dependencies.push(dep);
    }
  }
  
  return [...new Set(dependencies)]; // Remove duplicates
}
```

### 4. Error Handling Enhancement

Add comprehensive error handling for plugin loading:

```typescript
/**
 * Enhanced error handling for plugin loading
 */
private handlePluginError(error: any, pluginPath: string): PluginMountResult {
  const errorMessage = error.message || 'Unknown error';
  
  if (errorMessage.includes('Cannot use import statement')) {
    return {
      success: false,
      error: `Plugin ${pluginPath} uses ES modules. Please recompile with CommonJS format.`,
      plugin: null
    };
  }
  
  if (errorMessage.includes('is not a function')) {
    return {
      success: false,
      error: `Plugin ${pluginPath} has missing dependencies. Check require() calls.`,
      plugin: null
    };
  }
  
  if (errorMessage.includes('HTTP 404')) {
    return {
      success: false,
      error: `Plugin file not found: ${pluginPath}`,
      plugin: null
    };
  }
  
  return {
    success: false,
    error: `Failed to load plugin ${pluginPath}: ${errorMessage}`,
    plugin: null
  };
}
```

### 5. Testing Strategy

Create a test plugin to verify the implementation:

```typescript
// public/plugins/test-complex/index.ts
import { testSequence } from './sequence';
import { testHandlers } from './handlers/index';

export const testPlugin = {
  name: 'Test Complex Plugin',
  sequence: testSequence,
  handlers: testHandlers,
  
  init() {
    console.log('Test complex plugin initialized');
    return 'Test plugin loaded successfully';
  }
};

export default testPlugin;
```

### 6. Performance Monitoring

Add performance metrics to track plugin loading:

```typescript
/**
 * Performance monitoring for plugin loading
 */
private async loadPluginWithMetrics(pluginPath: string): Promise<PluginMountResult> {
  const startTime = performance.now();
  
  try {
    const plugin = await this.loadPluginModule(pluginPath);
    const loadTime = performance.now() - startTime;
    
    console.log(`⏱️ Plugin loaded in ${loadTime.toFixed(2)}ms: ${pluginPath}`);
    
    return {
      success: true,
      plugin,
      loadTime,
      error: null
    };
  } catch (error) {
    const loadTime = performance.now() - startTime;
    console.error(`⏱️ Plugin failed to load in ${loadTime.toFixed(2)}ms: ${pluginPath}`);
    
    return this.handlePluginError(error, pluginPath);
  }
}
```

## Deployment Checklist

### Development Environment:
- [ ] Vite middleware configured
- [ ] Plugin build scripts updated to CommonJS
- [ ] MusicalConductor updated with dependency resolution
- [ ] Test plugins created and verified
- [ ] Error handling implemented

### Production Environment:
- [ ] Plugin pre-compilation process
- [ ] Security validation for plugin sources
- [ ] Performance monitoring enabled
- [ ] Fallback mechanisms for failed plugins
- [ ] Plugin versioning system

## Migration Path

### Phase 1: Basic Implementation
1. Update MusicalConductor with enhanced loadPluginModule
2. Test with existing simple plugins
3. Verify error handling

### Phase 2: Complex Plugin Support  
1. Implement dependency pre-loading
2. Test with multi-file plugins
3. Add performance monitoring

### Phase 3: Production Optimization
1. Add security validation
2. Implement plugin caching strategies
3. Add hot-reloading support

## Expected Results

After implementation:
- ✅ All existing RenderX plugins should load successfully
- ✅ Complex plugins with dependencies will work
- ✅ TypeScript plugins can be developed and loaded at runtime
- ✅ No application rebuilds required for plugin changes
- ✅ Comprehensive error handling and logging
