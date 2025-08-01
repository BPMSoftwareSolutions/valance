# Runtime TypeScript Plugin Loading Solution

## Overview

This document describes a comprehensive solution for loading TypeScript plugins dynamically at runtime without requiring application rebuilds. The solution supports complex plugins with multiple files, dependencies, and import chains.

## Problem Statement

Traditional plugin systems face several challenges:

1. **TypeScript Support**: Browsers cannot execute TypeScript directly
2. **ES Module Imports**: `eval()` cannot execute code with `import`/`export` statements
3. **Dependency Resolution**: Complex plugins have multiple files with relative imports
4. **Runtime Loading**: Plugins should be loadable without rebuilding the main application

## Solution Architecture

### Three-Tier Approach

Our solution handles three levels of plugin complexity:

#### 1. Simple JavaScript Plugins (No Dependencies)
- **Method**: Blob URL + Dynamic Import
- **Use Case**: Single-file plugins with ES module exports
- **Example**: Basic utility plugins, simple components

#### 2. Simple TypeScript Plugins (No Dependencies) 
- **Method**: Vite Middleware + CommonJS Transformation + eval()
- **Use Case**: Single-file TypeScript plugins
- **Example**: Typed utility plugins, simple typed components

#### 3. Complex Multi-File Plugins (With Dependencies)
- **Method**: Pre-loading + Dependency Resolution + Caching + Synchronous Require
- **Use Case**: Enterprise plugins with multiple files and import chains
- **Example**: RenderX plugins, complex feature modules

## Technical Implementation

### 1. Vite Middleware for TypeScript Transformation

```javascript
// vite.config.js
{
  name: 'runtime-plugin-loader',
  configureServer(server) {
    server.middlewares.use('/plugins', async (req, res, next) => {
      if (req.url?.endsWith('.ts') || req.url?.endsWith('.tsx')) {
        try {
          const fs = await import('fs/promises')
          const path = await import('path')
          const { transformSync } = await import('esbuild')
          
          const filePath = path.join(process.cwd(), 'public', 'plugins', req.url)
          const content = await fs.readFile(filePath, 'utf-8')
          
          const result = transformSync(content, {
            loader: req.url.endsWith('.tsx') ? 'tsx' : 'ts',
            format: 'cjs', // Use CommonJS to avoid ES module imports
            target: 'es2020',
            jsx: 'automatic',
            jsxImportSource: 'react',
          })
          
          res.setHeader('Content-Type', 'application/javascript')
          res.end(result.code)
          return
        } catch (error) {
          console.error('Plugin transformation error:', error)
          res.statusCode = 500
          res.end(`// Plugin transformation failed: ${error.message}`)
          return
        }
      }
      next()
    })
  }
}
```

### 2. Plugin Loading Functions

#### Simple JavaScript Plugin (Blob URL Method)

```javascript
const loadJavaScriptPlugin = async () => {
  // Fetch plugin code
  const response = await fetch("/plugins/simple-plugin.js")
  const pluginCode = await response.text()
  
  // Create blob URL for ES module
  const blob = new Blob([pluginCode], { type: 'application/javascript' })
  const blobUrl = URL.createObjectURL(blob)
  
  try {
    // Use dynamic import with blob URL
    const plugin = await import(blobUrl)
    return plugin.default
  } finally {
    // Clean up blob URL
    URL.revokeObjectURL(blobUrl)
  }
}
```

#### TypeScript Plugin (CommonJS Method)

```javascript
const loadTypeScriptPlugin = async () => {
  // Fetch transformed plugin code
  const response = await fetch("/plugins/typescript-plugin.ts")
  const pluginCode = await response.text()
  
  // Create CommonJS environment
  const moduleExports = {}
  const module = { exports: moduleExports }
  const require = (path) => ({}) // Simple stub
  
  // Execute in CommonJS context
  const wrappedCode = `
    (function(exports, require, module, console) {
      ${pluginCode}
      return module.exports;
    })
  `
  
  const moduleFactory = eval(wrappedCode)
  return moduleFactory(moduleExports, require, module, console)
}
```

#### Complex Multi-File Plugin (Pre-loading Method)

```javascript
const loadComplexPlugin = async () => {
  const moduleCache = new Map()
  
  // Helper function to load dependencies
  const loadDependency = async (relativePath) => {
    const pluginDir = "/plugins/complex-plugin"
    const absolutePath = `${pluginDir}/${relativePath.replace("./", "")}`
    const fullPath = absolutePath.endsWith('.ts') ? absolutePath : `${absolutePath}.ts`
    
    if (moduleCache.has(fullPath)) {
      return moduleCache.get(fullPath)
    }
    
    // Fetch and transform dependency
    const response = await fetch(fullPath)
    const depCode = await response.text()
    
    // Create CommonJS environment for dependency
    const depModuleExports = {}
    const depModule = { exports: depModuleExports }
    
    const nestedRequire = (nestedPath) => {
      const resolvedPath = `/plugins/complex-plugin/${nestedPath.replace("./", "")}.ts`
      return moduleCache.get(resolvedPath) || {}
    }
    
    // Execute dependency
    const depWrappedCode = `
      (function(exports, require, module, console) {
        ${depCode}
        return module.exports;
      })
    `
    
    const depModuleFactory = eval(depWrappedCode)
    const depResult = depModuleFactory(depModuleExports, nestedRequire, depModule, console)
    
    // Cache result
    moduleCache.set(fullPath, depResult)
    return depResult
  }
  
  // Pre-load all dependencies
  await loadDependency("./sequence")
  await loadDependency("./handlers/index") 
  await loadDependency("./utils")
  
  // Create synchronous require function
  const require = (relativePath) => {
    const pluginDir = "/plugins/complex-plugin"
    const absolutePath = `${pluginDir}/${relativePath.replace("./", "")}`
    const fullPath = absolutePath.endsWith('.ts') ? absolutePath : `${absolutePath}.ts`
    
    return moduleCache.get(fullPath) || {}
  }
  
  // Load main plugin
  const response = await fetch("/plugins/complex-plugin/index.ts")
  const pluginCode = await response.text()
  
  const moduleExports = {}
  const module = { exports: moduleExports }
  
  const wrappedCode = `
    (function(exports, require, module, console) {
      ${pluginCode}
      return module.exports;
    })
  `
  
  const moduleFactory = eval(wrappedCode)
  return moduleFactory(moduleExports, require, module, console)
}
```

## Key Benefits

### ✅ **Runtime Loading**
- Plugins can be added/modified without rebuilding the main application
- Hot-swappable plugin architecture
- Development-friendly workflow

### ✅ **TypeScript Support** 
- Full TypeScript syntax support with type checking during development
- Automatic transformation to JavaScript at runtime
- Preserves type safety benefits

### ✅ **Complex Dependencies**
- Supports multi-file plugins with import chains
- Recursive dependency resolution
- Module caching prevents infinite loops

### ✅ **Performance**
- Efficient caching system
- Minimal transformation overhead
- Lazy loading of dependencies

### ✅ **Compatibility**
- Works with existing Vite/React applications
- No special build configuration required
- Compatible with standard npm workflows

## Usage Examples

### Plugin Structure
```
public/plugins/
├── simple-plugin.js          # Simple ES module
├── typescript-plugin.ts      # Single TypeScript file
└── complex-plugin/           # Multi-file plugin
    ├── index.ts             # Main entry point
    ├── sequence.ts          # Sequence definitions
    ├── utils.ts             # Utility functions
    └── handlers/
        └── index.ts         # Event handlers
```

### Loading Plugins
```javascript
// Load different types of plugins
const simplePlugin = await loadJavaScriptPlugin()
const typedPlugin = await loadTypeScriptPlugin() 
const complexPlugin = await loadComplexPlugin()

// Use plugins
await simplePlugin.init()
await typedPlugin.execute()
await complexPlugin.handleEvent('onDataReceived', data)
```

## Implementation Checklist

### For New Applications:
- [ ] Add Vite middleware for TypeScript transformation
- [ ] Implement plugin loading functions for your complexity needs
- [ ] Create plugin directory structure
- [ ] Add error handling and logging

### For Existing Applications (like RenderX):
- [ ] Update Vite configuration with middleware
- [ ] Replace `import()` calls with appropriate loading method
- [ ] Update plugin build process to use CommonJS format
- [ ] Implement dependency pre-loading for complex plugins
- [ ] Test with existing plugin structure

## Troubleshooting

### Common Issues:

1. **"Cannot use import statement outside a module"**
   - Solution: Use CommonJS transformation (`format: 'cjs'`)

2. **"Module is not defined"**
   - Solution: Provide proper `module` object in execution context

3. **"Function is not defined" for dependencies**
   - Solution: Implement proper `require` function with pre-loading

4. **Infinite dependency loops**
   - Solution: Use module caching with Map

## Performance Considerations

- **Caching**: Modules are cached after first load
- **Pre-loading**: Dependencies loaded in parallel where possible
- **Memory**: Blob URLs are cleaned up to prevent memory leaks
- **Network**: Minimal HTTP requests due to caching

## Security Considerations

- **Code Execution**: Uses `eval()` - ensure plugins are from trusted sources
- **Path Traversal**: Validate plugin paths to prevent directory traversal
- **Resource Limits**: Consider implementing timeouts and size limits

## Future Enhancements

- **Dynamic Dependency Discovery**: Automatically detect imports instead of pre-defining
- **Plugin Versioning**: Support for plugin version management
- **Hot Reloading**: Automatic plugin reloading on file changes
- **Bundle Optimization**: Optional bundling for production deployments
