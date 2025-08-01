import { useState } from "react";

function App() {
  const [jsPluginResult, setJsPluginResult] = useState(null);
  const [tsPluginResult, setTsPluginResult] = useState(null);
  const [complexPluginResult, setComplexPluginResult] = useState(null);
  const [reactPluginResult, setReactPluginResult] = useState(null);
  const [jsError, setJsError] = useState(null);
  const [tsError, setTsError] = useState(null);
  const [complexError, setComplexError] = useState(null);
  const [reactError, setReactError] = useState(null);

  const loadJavaScriptPlugin = async () => {
    try {
      console.log("Loading JavaScript plugin...");

      // Fetch the plugin code from our middleware
      const response = await fetch("/plugins/simple-plugin.js");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const pluginCode = await response.text();
      console.log("Plugin code fetched:", pluginCode.substring(0, 100) + "...");

      // Use blob URL approach for ES modules (simple plugins without dependencies)
      const blob = new Blob([pluginCode], { type: "application/javascript" });
      const blobUrl = URL.createObjectURL(blob);

      try {
        // Use dynamic import with the blob URL
        const plugin = await import(/* @vite-ignore */ blobUrl);
        console.log("JavaScript plugin loaded:", plugin);

        const result = plugin.default.init();
        const message = plugin.default.getMessage();
        const randomNum = plugin.default.getRandomNumber();

        setJsPluginResult({
          initResult: result,
          message: message,
          randomNumber: randomNum,
          pluginName: plugin.default.name,
        });
        setJsError(null);
      } finally {
        // Clean up the blob URL to prevent memory leaks
        URL.revokeObjectURL(blobUrl);
      }
    } catch (error) {
      console.error("Failed to load JavaScript plugin:", error);
      setJsError(error.message);
      setJsPluginResult(null);
    }
  };

  const loadTypeScriptPlugin = async () => {
    try {
      console.log("Loading TypeScript plugin...");

      // Fetch the transformed plugin code from our middleware
      const response = await fetch("/plugins/typescript-plugin.ts");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const pluginCode = await response.text();
      console.log(
        "TypeScript plugin code fetched:",
        pluginCode.substring(0, 100) + "..."
      );

      // Create a CommonJS-like environment for the pre-compiled JavaScript
      const moduleExports = {};
      const module = { exports: moduleExports };

      // Create a simple require function for relative imports
      const require = (path) => {
        console.warn(
          `⚠️ Plugin tried to require: ${path} - this may not work in runtime loading`
        );
        return {}; // Return empty object for now
      };

      // Wrap the plugin code in a CommonJS-like environment
      const wrappedCode = `
        (function(exports, require, module, console) {
          ${pluginCode}
          return module.exports;
        })
      `;

      const moduleFactory = eval(wrappedCode);
      const plugin = moduleFactory(moduleExports, require, module, console);

      console.log("TypeScript plugin loaded:", plugin);

      // For CommonJS, the plugin might be in plugin.default or plugin.typescriptPlugin or plugin
      const actualPlugin = plugin.default || plugin.typescriptPlugin || plugin;

      const result = actualPlugin.init();
      const message = actualPlugin.getMessage();
      const calculation = actualPlugin.calculate(5, 3);

      setTsPluginResult({
        initResult: result,
        message: message,
        calculation: calculation,
        pluginName: actualPlugin.info.name,
      });
      setTsError(null);
    } catch (error) {
      console.error("Failed to load TypeScript plugin:", error);
      setTsError(error.message);
      setTsPluginResult(null);
    }
  };

  const loadComplexPlugin = async () => {
    try {
      console.log("Loading Complex plugin...");

      // Fetch the transformed plugin code from our middleware
      const response = await fetch("/plugins/complex-plugin/index.ts");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const pluginCode = await response.text();
      console.log(
        "Complex plugin code fetched:",
        pluginCode.substring(0, 100) + "..."
      );

      // Create a CommonJS-like environment for the pre-compiled JavaScript
      const moduleExports = {};
      const module = { exports: moduleExports };

      // Pre-load all dependencies first
      const moduleCache = new Map();

      // Helper function to load a single dependency
      const loadDependency = async (relativePath) => {
        try {
          // Resolve relative path to absolute path
          const pluginDir = "/plugins/complex-plugin";
          const absolutePath = `${pluginDir}/${relativePath.replace("./", "")}`;

          // Add .ts extension if not present
          const fullPath = absolutePath.endsWith(".ts")
            ? absolutePath
            : `${absolutePath}.ts`;

          console.log(`📦 Loading dependency: ${relativePath} -> ${fullPath}`);

          // Check cache first
          if (moduleCache.has(fullPath)) {
            console.log(`📋 Using cached module: ${fullPath}`);
            return moduleCache.get(fullPath);
          }

          // Fetch and transform the dependency
          const response = await fetch(fullPath);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const depCode = await response.text();
          console.log(`📦 Dependency code fetched (${depCode.length} chars)`);

          // Create CommonJS environment for the dependency
          const depModuleExports = {};
          const depModule = { exports: depModuleExports };

          // Synchronous require function for nested dependencies (will be populated later)
          const nestedRequire = (nestedPath) => {
            const resolvedPath = `/plugins/complex-plugin/${nestedPath.replace(
              "./",
              ""
            )}.ts`;
            if (moduleCache.has(resolvedPath)) {
              return moduleCache.get(resolvedPath);
            }
            console.warn(`⚠️ Dependency not pre-loaded: ${nestedPath}`);
            return {};
          };

          // Wrap and execute the dependency code
          const depWrappedCode = `
            (function(exports, require, module, console) {
              ${depCode}
              return module.exports;
            })
          `;

          const depModuleFactory = eval(depWrappedCode);
          const depModule_result = depModuleFactory(
            depModuleExports,
            nestedRequire,
            depModule,
            console
          );

          // Cache the result
          moduleCache.set(fullPath, depModule_result);

          console.log(
            `✅ Dependency loaded: ${fullPath}`,
            Object.keys(depModule_result)
          );
          return depModule_result;
        } catch (error) {
          console.error(`❌ Failed to load dependency ${relativePath}:`, error);
          return {}; // Return empty object as fallback
        }
      };

      // Pre-load known dependencies
      console.log("🔄 Pre-loading dependencies...");
      await loadDependency("./sequence");
      await loadDependency("./handlers/index");
      await loadDependency("./utils");

      // Create synchronous require function using pre-loaded modules
      const require = (relativePath) => {
        const pluginDir = "/plugins/complex-plugin";
        const absolutePath = `${pluginDir}/${relativePath.replace("./", "")}`;
        const fullPath = absolutePath.endsWith(".ts")
          ? absolutePath
          : `${absolutePath}.ts`;

        if (moduleCache.has(fullPath)) {
          console.log(`📋 Using cached module: ${relativePath}`);
          return moduleCache.get(fullPath);
        }

        console.warn(`⚠️ Module not found in cache: ${relativePath}`);
        return {};
      };

      // Wrap the plugin code in a CommonJS-like environment
      const wrappedCode = `
        (function(exports, require, module, console) {
          ${pluginCode}
          return module.exports;
        })
      `;

      const moduleFactory = eval(wrappedCode);
      const plugin = moduleFactory(moduleExports, require, module, console);

      console.log("Complex plugin loaded:", plugin);

      // For CommonJS, the plugin might be in plugin.default or plugin.complexPlugin
      const actualPlugin = plugin.default || plugin.complexPlugin || plugin;

      const initResult = await actualPlugin.init({
        debug: true,
        timeout: 3000,
      });
      const executeResult = await actualPlugin.execute();
      const status = actualPlugin.getStatus();

      // Test event handling
      await actualPlugin.handleEvent("onDataReceived", { test: "data" });

      setComplexPluginResult({
        initResult: initResult,
        executeResult: executeResult,
        status: status,
        pluginName: actualPlugin.info.name,
        pluginId: actualPlugin.info.id,
      });
      setComplexError(null);
    } catch (error) {
      console.error("Failed to load Complex plugin:", error);
      setComplexError(error.message);
      setComplexPluginResult(null);
    }
  };

  const loadReactPlugin = async () => {
    try {
      console.log("Loading React plugin...");
      setReactError(null);

      // Try to load the bundled React plugin (should work now!)
      const response = await fetch("/plugins/react-plugin/dist/plugin.js");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const pluginCode = await response.text();
      console.log(
        "Bundled React plugin code fetched:",
        pluginCode.substring(0, 100) + "..."
      );

      // This should now work because:
      // 1. React is bundled inside (no external dependencies)
      // 2. Proper ESM format (no CommonJS issues)
      // 3. All dependencies resolved (single file)
      const blob = new Blob([pluginCode], { type: "application/javascript" });
      const blobUrl = URL.createObjectURL(blob);

      try {
        const plugin = await import(/* @vite-ignore */ blobUrl);
        console.log("React plugin loaded:", plugin);
        console.log("Available exports:", Object.keys(plugin));
        console.log("Default export:", plugin.default);
        console.log("Sequence export:", plugin.sequence);
        console.log("Handlers export:", plugin.handlers);
        console.log("MainComponent export:", plugin.MainComponent);

        // Try to reproduce the "mount not defined" issue
        if (!plugin.sequence) {
          console.error("❌ REPRODUCED: sequence is not defined!");
        }
        if (!plugin.handlers) {
          console.error("❌ REPRODUCED: handlers is not defined!");
        }
        if (!plugin.MainComponent) {
          console.error("❌ REPRODUCED: MainComponent is not defined!");
        }

        setReactPluginResult({
          pluginName: plugin.default?.name || "Unknown",
          pluginId: plugin.default?.id || "Unknown",
          hasSequence: !!plugin.sequence,
          hasHandlers: !!plugin.handlers,
          hasComponent: !!plugin.MainComponent,
        });
      } finally {
        URL.revokeObjectURL(blobUrl);
      }
    } catch (error) {
      console.error("Failed to load React plugin:", error);
      setReactError(error.message);
      setReactPluginResult(null);
    }
  };

  return (
    <div className="app">
      <h1>Plugin Loading Test App</h1>
      <p>
        This app tests dynamic plugin loading with both JavaScript and
        TypeScript plugins.
      </p>

      <div className="plugin-test">
        <h2>JavaScript Plugin Test</h2>
        <button onClick={loadJavaScriptPlugin}>Load JavaScript Plugin</button>

        {jsPluginResult && (
          <div className="success">
            <h3>✅ JavaScript Plugin Loaded Successfully!</h3>
            <p>
              <strong>Plugin Name:</strong> {jsPluginResult.pluginName}
            </p>
            <p>
              <strong>Init Result:</strong> {jsPluginResult.initResult}
            </p>
            <p>
              <strong>Message:</strong> {jsPluginResult.message}
            </p>
            <p>
              <strong>Random Number:</strong> {jsPluginResult.randomNumber}
            </p>
          </div>
        )}

        {jsError && (
          <div className="error">
            <h3>❌ JavaScript Plugin Failed</h3>
            <p>
              <strong>Error:</strong> {jsError}
            </p>
          </div>
        )}
      </div>

      <div className="plugin-test">
        <h2>TypeScript Plugin Test</h2>
        <button onClick={loadTypeScriptPlugin}>Load TypeScript Plugin</button>

        {tsPluginResult && (
          <div className="success">
            <h3>✅ TypeScript Plugin Loaded Successfully!</h3>
            <p>
              <strong>Plugin Name:</strong> {tsPluginResult.pluginName}
            </p>
            <p>
              <strong>Init Result:</strong> {tsPluginResult.initResult}
            </p>
            <p>
              <strong>Message:</strong> {tsPluginResult.message}
            </p>
            <p>
              <strong>Calculation (5 + 3):</strong> {tsPluginResult.calculation}
            </p>
          </div>
        )}

        {tsError && (
          <div className="error">
            <h3>❌ TypeScript Plugin Failed</h3>
            <p>
              <strong>Error:</strong> {tsError}
            </p>
          </div>
        )}
      </div>

      <div className="plugin-test">
        <h2>Complex Plugin Test (Multiple Files + Imports)</h2>
        <button onClick={loadComplexPlugin}>Load Complex Plugin</button>

        {complexPluginResult && (
          <div className="success">
            <h3>✅ Complex Plugin Loaded Successfully!</h3>
            <p>
              <strong>Plugin Name:</strong> {complexPluginResult.pluginName}
            </p>
            <p>
              <strong>Plugin ID:</strong> {complexPluginResult.pluginId}
            </p>
            <p>
              <strong>Init Result:</strong> {complexPluginResult.initResult}
            </p>
            <p>
              <strong>Execute Result:</strong>{" "}
              {complexPluginResult.executeResult}
            </p>
            <p>
              <strong>Status:</strong> {complexPluginResult.status}
            </p>
          </div>
        )}

        {complexError && (
          <div className="error">
            <h3>❌ Complex Plugin Failed</h3>
            <p>
              <strong>Error:</strong> {complexError}
            </p>
          </div>
        )}
      </div>

      <div className="plugin-test">
        <h2>React Plugin Test (Reproduce RenderX Issues)</h2>
        <button onClick={loadReactPlugin}>Load React Plugin</button>

        {reactPluginResult && (
          <div className="success">
            <h3>✅ React Plugin Loaded Successfully!</h3>
            <p>
              <strong>Plugin Name:</strong> {reactPluginResult.pluginName}
            </p>
            <p>
              <strong>Plugin ID:</strong> {reactPluginResult.pluginId}
            </p>
            <p>
              <strong>Has Sequence:</strong>{" "}
              {reactPluginResult.hasSequence ? "Yes" : "No"}
            </p>
            <p>
              <strong>Has Handlers:</strong>{" "}
              {reactPluginResult.hasHandlers ? "Yes" : "No"}
            </p>
            <p>
              <strong>Has Component:</strong>{" "}
              {reactPluginResult.hasComponent ? "Yes" : "No"}
            </p>
          </div>
        )}

        {reactError && (
          <div className="error">
            <h3>❌ React Plugin Failed (Expected - Same as RenderX)</h3>
            <p>
              <strong>Error:</strong> {reactError}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
