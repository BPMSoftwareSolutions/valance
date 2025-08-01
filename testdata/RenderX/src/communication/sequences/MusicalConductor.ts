/**
 * CIA-Compliant Musical Conductor Class (TypeScript)
 * Manages the execution and coordination of musical sequences with CIA compliance
 *
 * Features:
 * - Sequential orchestration with queue-based system
 * - Priority-based sequence execution
 * - Comprehensive error handling
 * - Performance metrics and statistics
 * - TypeScript support with proper typing
 * - CIA (Conductor Integration Architecture) compliance for safe SPA plugin mounting
 * - Runtime plugin shape validation
 * - Graceful failure handling for malformed plugins
 * - Movement-to-handler contract verification
 */

import { EventBus } from "../EventBus";
import type {
  MusicalSequence,
  SequenceExecutionContext,
  ConductorStatistics,
  SequenceRequest,
  SequencePriority,
  SequenceBeat,
  SequenceMovement,
} from "./SequenceTypes";
import {
  MUSICAL_TIMING,
  MUSICAL_DYNAMICS,
  MUSICAL_CONDUCTOR_EVENT_TYPES,
  SEQUENCE_PRIORITIES,
} from "./SequenceTypes";

// CIA (Conductor Integration Architecture) interfaces for SPA plugin mounting
export interface SPAPlugin {
  sequence: MusicalSequence;
  handlers: Record<string, Function>;
  metadata?: {
    id: string;
    version: string;
    author?: string;
  };
}

export interface PluginMountResult {
  success: boolean;
  pluginId: string;
  message: string;
  warnings?: string[];
}

export class MusicalConductor {
  private eventBus: EventBus;
  private sequences: Map<string, MusicalSequence> = new Map();

  // Sequential Orchestration: Replace concurrent execution with queue-based system
  private activeSequence: SequenceExecutionContext | null = null;
  private sequenceQueue: SequenceRequest[] = [];
  private sequenceHistory: SequenceExecutionContext[] = [];
  private priorities: Map<string, string> = new Map();

  // CIA (Conductor Integration Architecture) properties for SPA plugin mounting
  private mountedPlugins: Map<string, SPAPlugin> = new Map();
  private pluginHandlers: Map<string, Record<string, Function>> = new Map();
  private pluginsRegistered: boolean = false; // Prevent React StrictMode double execution

  // Enhanced statistics for queue management
  private statistics: ConductorStatistics = {
    totalSequencesExecuted: 0,
    totalBeatsExecuted: 0,
    averageExecutionTime: 0,
    errorCount: 0,
    lastExecutionTime: null,
    totalSequencesQueued: 0,
    maxQueueLength: 0,
    currentQueueLength: 0,
    averageQueueWaitTime: 0,
    sequenceCompletionRate: 0,
    chainedSequences: 0,
  };

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    console.log(
      "🎼 MusicalConductor: CIA-compliant conductor with Sequential Orchestration initialized"
    );
  }

  /**
   * Register a musical sequence
   * @param sequence - The sequence to register
   */
  registerSequence(sequence: MusicalSequence): void {
    this.sequences.set(sequence.name, sequence);
    console.log(`🎼 MusicalConductor: Registered sequence "${sequence.name}"`);

    this.eventBus.emit(MUSICAL_CONDUCTOR_EVENT_TYPES.SEQUENCE_REGISTERED, {
      sequenceName: sequence.name,
      category: sequence.category,
    });
  }

  /**
   * Unregister a musical sequence
   * @param sequenceName - Name of the sequence to unregister
   */
  unregisterSequence(sequenceName: string): void {
    if (this.sequences.has(sequenceName)) {
      this.sequences.delete(sequenceName);
      console.log(
        `🎼 MusicalConductor: Unregistered sequence "${sequenceName}"`
      );

      this.eventBus.emit(MUSICAL_CONDUCTOR_EVENT_TYPES.SEQUENCE_UNREGISTERED, {
        sequenceName,
      });
    }
  }

  /**
   * Get a registered sequence
   * @param sequenceName - Name of the sequence
   */
  getSequence(sequenceName: string): MusicalSequence | undefined {
    return this.sequences.get(sequenceName);
  }

  /**
   * Get all registered sequence names
   */
  getSequenceNames(): string[] {
    return Array.from(this.sequences.keys());
  }

  // ===== CIA (Conductor Integration Architecture) Methods =====

  /**
   * Play a specific movement of a mounted SPA plugin (CIA-compliant)
   * @param pluginId - The plugin identifier
   * @param movementName - The movement name to execute
   * @param context - Context data to pass to the movement handler
   * @returns Execution result
   */
  play(pluginId: string, sequenceId: string, context: any = {}): any {
    try {
      console.log(`🎼 MusicalConductor.play(): ${pluginId} -> ${sequenceId}`);

      // Validate plugin exists
      const plugin = this.mountedPlugins.get(pluginId);
      if (!plugin) {
        console.warn(
          `🧠 Plugin not found: ${pluginId}. Available plugins: [${Array.from(
            this.mountedPlugins.keys()
          ).join(", ")}]`
        );
        return null;
      }

      // Start the sequence instead of calling handlers directly
      return this.startSequence(sequenceId, context);
    } catch (error) {
      console.error(
        `🧠 MusicalConductor.play() failed for ${pluginId}.${sequenceId}:`,
        (error as Error).message
      );
      return null;
    }
  }

  /**
   * Mount an SPA plugin with comprehensive validation (CIA-compliant)
   * @param sequence - The sequence definition from the plugin
   * @param handlers - The handlers object from the plugin
   * @param pluginId - Optional plugin ID (defaults to sequence.name)
   * @returns Plugin mount result
   */
  mount(
    sequence: any,
    handlers: any,
    pluginId?: string,
    metadata?: any
  ): PluginMountResult {
    const id = pluginId || sequence?.name || "unknown-plugin";

    try {
      console.log(`🧠 MusicalConductor: Attempting to mount plugin: ${id}`);

      // Validate sequence
      if (!sequence) {
        console.error("🧠 Mount failed: sequence is required");
        return {
          success: false,
          pluginId: id,
          message: "Mount failed: sequence is required",
        };
      }

      if (!sequence.movements || !Array.isArray(sequence.movements)) {
        console.error("🧠 Mount failed: sequence.movements must be an array");
        return {
          success: false,
          pluginId: id,
          message: "Mount failed: sequence.movements must be an array",
        };
      }

      // Note: handlers are optional - plugins use event bus for beat execution
      // Handlers are only needed for legacy direct movement calls

      // Validate movement-to-handler mapping
      const warnings: string[] = [];
      for (const movement of sequence.movements) {
        if (!movement.name) {
          console.warn("🧠 Movement missing name, skipping validation");
          warnings.push("Movement missing name, skipping validation");
          continue;
        }

        // Only validate handlers if they are provided (optional for event-driven plugins)
        if (handlers && typeof handlers === "object") {
          if (!(movement.name in handlers)) {
            console.warn(`🧠 Missing handler for movement: ${movement.name}`);
            warnings.push(`Missing handler for movement: ${movement.name}`);
          }

          if (
            handlers[movement.name] &&
            typeof handlers[movement.name] !== "function"
          ) {
            console.error(`🧠 Handler for ${movement.name} is not a function`);
            return {
              success: false,
              pluginId: id,
              message: `Handler for ${movement.name} is not a function`,
            };
          }
        }
      }

      // Create plugin object
      const plugin: SPAPlugin = {
        sequence,
        handlers,
        metadata: {
          id,
          version: sequence.metadata?.version || "1.0.0",
          author: sequence.metadata?.author,
        },
      };

      // Mount the plugin
      this.mountedPlugins.set(id, plugin);

      // Store handlers only if provided (optional for event-bus driven plugins)
      if (handlers && typeof handlers === "object") {
        this.pluginHandlers.set(id, handlers);
      }

      // Register the sequence with the existing conductor system
      this.registerSequence(sequence);

      console.log(`🧠 MusicalConductor: Successfully mounted plugin: ${id}`);

      return {
        success: true,
        pluginId: id,
        message: `Successfully mounted plugin: ${id}`,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    } catch (error) {
      console.error("🧠 MusicalConductor: Mount failed with error:", error);
      return {
        success: false,
        pluginId: id,
        message: `Mount failed with error: ${(error as Error).message}`,
      };
    }
  }

  /**
   * Register CIA-compliant plugins
   * Loads and mounts all plugins from the plugins directory
   */
  async registerCIAPlugins(): Promise<void> {
    try {
      // Prevent React StrictMode double execution
      if (this.pluginsRegistered) {
        console.log(
          "⚠️ Plugins already registered, skipping duplicate registration"
        );
        return;
      }

      console.log("🧠 Registering CIA-compliant plugins...");

      // Load plugin manifest - this is the ONLY source of truth
      const pluginManifest = await this.loadPluginManifest();
      console.log(
        "📋 Plugin manifest loaded with",
        pluginManifest.statistics.totalPlugins,
        "plugins across",
        pluginManifest.statistics.totalDomains,
        "domains"
      );

      // Register plugins dynamically based on manifest data (data-driven approach)
      await this.registerPluginsFromManifest(pluginManifest);

      // Mark plugins as registered to prevent duplicate execution
      this.pluginsRegistered = true;

      console.log("✅ CIA-compliant plugins registered successfully");
    } catch (error) {
      console.error("❌ Failed to register CIA plugins:", error);
      // Fallback to basic event handling if plugin loading fails
      this.registerFallbackSequences();
    }
  }

  private async loadPluginManifest() {
    try {
      console.log("🎼 MusicalConductor: Loading plugin manifest...");
      const response = await fetch("/plugins/plugin-manifest.json");

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error(
          "🎼 MusicalConductor: Expected JSON but got:",
          contentType,
          text.substring(0, 100)
        );
        throw new Error(`Expected JSON but got ${contentType}`);
      }

      const manifest = await response.json();

      // Validate manifest structure
      if (!manifest.domains || !manifest.plugins) {
        throw new Error("Invalid plugin manifest structure");
      }

      console.log("✅ Plugin manifest loaded successfully");
      return manifest;
    } catch (error) {
      console.error("❌ Failed to load plugin manifest:", error);
      // Return default manifest structure
      return {
        domains: {},
        plugins: [],
        statistics: { totalPlugins: 0, totalDomains: 0 },
      };
    }
  }

  private async registerPluginsFromManifest(manifest: any) {
    console.log(
      "🎼 MusicalConductor: Registering plugins from manifest (data-driven)..."
    );

    // Iterate through plugins defined in manifest
    for (const plugin of manifest.plugins) {
      try {
        if (plugin.autoMount) {
          // Check if plugin is already mounted (prevents React StrictMode double execution)
          if (this.mountedPlugins.has(plugin.name)) {
            console.log(`⚠️ Plugin already mounted, skipping: ${plugin.name}`);
            continue;
          }

          console.log(
            `🔌 Loading plugin: ${plugin.name} (${plugin.domain} domain)`
          );

          // Dynamic plugin loading using pre-compiled JavaScript files
          const pluginModule = await this.loadPluginModule(
            `/plugins/${plugin.path}index.js`
          );

          // Register the plugin using manifest metadata
          this.mount(
            pluginModule.sequence,
            pluginModule.handlers,
            plugin.name,
            {
              domain: plugin.domain,
              functionality: plugin.functionality,
              priority: plugin.priority,
              isCore: plugin.isCore,
            }
          );

          console.log(`✅ Plugin registered: ${plugin.name}`);
        } else {
          console.log(`⏭️  Skipping plugin: ${plugin.name} (autoMount: false)`);
        }
      } catch (error) {
        console.error(`❌ Failed to load plugin ${plugin.name}:`, error);
        // Continue with other plugins - don't fail entire registration
      }
    }

    console.log("✅ Data-driven plugin registration completed");
  }

  private registerFallbackSequences() {
    // Register basic event handlers for core functionality
    console.log("🎼 MusicalConductor: Registering fallback sequences...");

    // Basic drag and drop functionality
    this.eventBus.subscribe("canvas:element:drag:start", (data: any) => {
      console.log("🎼 Fallback: Canvas drag start", data);
    });

    this.eventBus.subscribe("canvas:element:drag:end", (data: any) => {
      console.log("🎼 Fallback: Canvas drag end", data);
    });

    // Basic component loading
    this.eventBus.subscribe("component:loading:start", (data: any) => {
      console.log("🎼 Fallback: Component loading start", data);
    });

    console.log("✅ MusicalConductor: Fallback sequences registered");
  }

  /**
   * Execute movement with handler validation (CIA-compliant)
   * @param sequenceId - Sequence identifier
   * @param movementName - Movement name
   * @param data - Data to pass to handler
   * @returns Handler execution result
   */
  executeMovementHandler(
    sequenceId: string,
    movementName: string,
    data: any
  ): any {
    try {
      const handlers = this.pluginHandlers.get(sequenceId);

      if (!handlers) {
        console.warn(`🧠 No handlers found for sequence: ${sequenceId}`);
        return null;
      }

      if (!(movementName in handlers)) {
        console.warn(`🧠 Missing handler for movement: ${movementName}`);
        return null;
      }

      const handler = handlers[movementName];
      if (typeof handler !== "function") {
        console.error(`🧠 Handler for ${movementName} is not a function`);
        return null;
      }

      console.log(
        `🧠 MusicalConductor: Executing handler for movement: ${movementName}`
      );
      return handler(data);
    } catch (error) {
      console.error(
        `🧠 MusicalConductor: Handler execution failed for ${movementName}:`,
        error
      );
      return null;
    }
  }

  /**
   * Load plugin module - tries bundled ESM first, falls back to complex dependency resolution
   * @param pluginPath - Path to the plugin module (e.g., "/plugins/App.app-shell-symphony/index.js")
   * @returns Plugin module with exports
   */
  private async loadPluginModule(pluginPath: string): Promise<any> {
    // Extract plugin directory from path
    const pluginDir = pluginPath.substring(0, pluginPath.lastIndexOf("/"));
    const bundledPath = `${pluginDir}/dist/plugin.js`;

    // Try to load bundled ESM version first
    try {
      console.log(`🔗 Attempting to load bundled plugin: ${bundledPath}`);

      // Fetch the bundled ESM code
      const response = await fetch(bundledPath);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const bundledCode = await response.text();
      console.log(
        `📦 Bundled plugin code fetched (${bundledCode.length} chars)`
      );

      // Create a blob URL for the self-contained ESM code
      const blob = new Blob([bundledCode], {
        type: "application/javascript",
      });
      const blobUrl = URL.createObjectURL(blob);

      try {
        // Use dynamic import with the blob URL
        const plugin = await import(/* @vite-ignore */ blobUrl);
        console.log(`✅ Loaded bundled plugin:`, Object.keys(plugin));
        return plugin;
      } finally {
        // Clean up the blob URL
        URL.revokeObjectURL(blobUrl);
      }
    } catch (bundleError) {
      console.log(
        `⚠️ Bundled plugin not found, falling back to complex loading: ${bundleError.message}`
      );
      // Fall back to complex dependency resolution
      return this.loadPluginModuleComplex(pluginPath);
    }
  }

  /**
   * Complex plugin loading with full dependency resolution (fallback method)
   * @param pluginPath - Path to the plugin module
   * @returns Plugin module with exports
   */
  private async loadPluginModuleComplex(pluginPath: string): Promise<any> {
    try {
      console.log(
        `🔄 Loading plugin module with complex resolution: ${pluginPath}`
      );

      // Extract plugin directory from path
      const pluginDir = pluginPath.substring(0, pluginPath.lastIndexOf("/"));
      const moduleCache = new Map<string, any>();

      // Helper function to load dependencies recursively
      const loadDependency = async (relativePath: string): Promise<any> => {
        const absolutePath = `${pluginDir}/${relativePath.replace("./", "")}`;
        // Handle different file extensions:
        // - .js files: use as-is
        // - .ts/.tsx files: convert to .js
        // - no extension: add .js
        let fullPath: string;
        if (absolutePath.endsWith(".js")) {
          fullPath = absolutePath;
        } else if (
          absolutePath.endsWith(".ts") ||
          absolutePath.endsWith(".tsx")
        ) {
          fullPath = absolutePath.replace(/\.tsx?$/, ".js");
        } else {
          fullPath = `${absolutePath}.js`;
        }

        if (moduleCache.has(fullPath)) {
          return moduleCache.get(fullPath);
        }

        console.log(`📦 Loading dependency: ${relativePath} -> ${fullPath}`);

        // Fetch dependency code
        const depResponse = await fetch(fullPath);
        if (!depResponse.ok) {
          throw new Error(
            `HTTP ${depResponse.status}: ${depResponse.statusText}`
          );
        }

        const depCode = await depResponse.text();
        console.log(`📦 Dependency code fetched (${depCode.length} chars)`);

        // Create CommonJS environment for dependency
        const depModuleExports: any = {};
        const depModule = { exports: depModuleExports };

        // Nested require function for dependencies
        const nestedRequire = (nestedPath: string) => {
          const resolvedPath = `${pluginDir}/${nestedPath.replace("./", "")}`;
          // Handle different file extensions:
          // - .js files: use as-is
          // - .ts/.tsx files: convert to .js
          // - no extension: add .js
          let fullResolvedPath: string;
          if (resolvedPath.endsWith(".js")) {
            fullResolvedPath = resolvedPath;
          } else if (
            resolvedPath.endsWith(".ts") ||
            resolvedPath.endsWith(".tsx")
          ) {
            fullResolvedPath = resolvedPath.replace(/\.tsx?$/, ".js");
          } else {
            fullResolvedPath = `${resolvedPath}.js`;
          }

          if (moduleCache.has(fullResolvedPath)) {
            return moduleCache.get(fullResolvedPath);
          }
          console.warn(
            `⚠️ Nested dependency not found in cache: ${nestedPath}`
          );
          return {};
        };

        // Execute dependency
        const depWrappedCode = `
          (function(exports, require, module, console) {
            ${depCode}
            return module.exports;
          })
        `;

        const depModuleFactory = eval(depWrappedCode);
        const depResult = depModuleFactory(
          depModuleExports,
          nestedRequire,
          depModule,
          console
        );

        // Cache result
        moduleCache.set(fullPath, depResult);
        console.log(
          `✅ Dependency loaded: ${fullPath}`,
          Object.keys(depResult)
        );
        return depResult;
      };

      // Load main plugin first to discover dependencies
      const response = await fetch(pluginPath);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const pluginCode = await response.text();
      console.log(`📦 Plugin code fetched (${pluginCode.length} chars)`);

      // Extract dependencies from the plugin code
      const extractDependencies = (code: string): string[] => {
        const requireRegex = /require\s*\(\s*["']([^"']+)["']\s*\)/g;
        const dependencies: string[] = [];
        let match;

        while ((match = requireRegex.exec(code)) !== null) {
          const dep = match[1];
          if (dep.startsWith("./") || dep.startsWith("../")) {
            dependencies.push(dep);
          }
        }

        return [...new Set(dependencies)]; // Remove duplicates
      };

      const dependencies = extractDependencies(pluginCode);
      console.log("🔍 Discovered dependencies:", dependencies);

      // Pre-load all discovered dependencies
      console.log("🔄 Pre-loading discovered dependencies...");
      for (const dep of dependencies) {
        try {
          await loadDependency(dep);
        } catch (e) {
          console.log(`⚠️ Failed to load dependency ${dep}:`, e);
        }
      }

      // Create synchronous require function using pre-loaded modules
      const require = (relativePath: string) => {
        const absolutePath = `${pluginDir}/${relativePath.replace("./", "")}`;
        // Handle different file extensions:
        // - .js files: use as-is
        // - .ts/.tsx files: convert to .js
        // - no extension: add .js
        let fullPath: string;
        if (absolutePath.endsWith(".js")) {
          fullPath = absolutePath;
        } else if (
          absolutePath.endsWith(".ts") ||
          absolutePath.endsWith(".tsx")
        ) {
          fullPath = absolutePath.replace(/\.tsx?$/, ".js");
        } else {
          fullPath = `${absolutePath}.js`;
        }

        if (moduleCache.has(fullPath)) {
          console.log(`📋 Using cached module: ${relativePath}`);
          return moduleCache.get(fullPath);
        }

        console.warn(`⚠️ Module not found in cache: ${relativePath}`);
        return {};
      };

      // Plugin code already fetched above for dependency discovery

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
      const pluginModule = moduleFactory(
        moduleExports,
        require,
        module,
        console
      );

      console.log(`✅ Plugin module loaded:`, Object.keys(pluginModule));
      return pluginModule;
    } catch (error) {
      console.error(`❌ Failed to load plugin module ${pluginPath}:`, error);

      // Enhanced error handling with specific diagnostics
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      if (errorMessage.includes("Cannot use import statement")) {
        throw new Error(
          `Plugin ${pluginPath} uses ES modules. Please recompile with CommonJS format.`
        );
      }

      if (errorMessage.includes("is not a function")) {
        throw new Error(
          `Plugin ${pluginPath} has missing dependencies. Check require() calls.`
        );
      }

      if (errorMessage.includes("HTTP 404")) {
        throw new Error(`Plugin file not found: ${pluginPath}`);
      }

      throw error;
    }
  }

  /**
   * Load plugin from dynamic import with error handling (CIA-compliant)
   * @param pluginPath - Path to the plugin module
   * @returns Plugin load result
   */
  async loadPlugin(pluginPath: string): Promise<PluginMountResult> {
    try {
      console.log(`🧠 MusicalConductor: Loading plugin from: ${pluginPath}`);

      const plugin = await this.loadPluginModule(pluginPath);

      // Validate plugin structure after import
      if (!plugin || typeof plugin !== "object") {
        console.warn(
          `🧠 Failed to load plugin: invalid plugin structure at ${pluginPath}`
        );
        return {
          success: false,
          pluginId: "unknown",
          message: `Failed to load plugin: invalid plugin structure at ${pluginPath}`,
        };
      }

      if (!plugin.sequence || !plugin.handlers) {
        console.warn(
          `🧠 Plugin missing required exports (sequence, handlers): ${pluginPath}`
        );
        return {
          success: false,
          pluginId: plugin.sequence?.name || "unknown",
          message: `Plugin missing required exports (sequence, handlers): ${pluginPath}`,
        };
      }

      // Mount the plugin
      return this.mount(plugin.sequence, plugin.handlers);
    } catch (error) {
      console.warn(
        `🧠 MusicalConductor: Failed to load plugin from ${pluginPath}:`,
        (error as Error).message
      );
      return {
        success: false,
        pluginId: "unknown",
        message: `Failed to load plugin from ${pluginPath}: ${
          (error as Error).message
        }`,
      };
    }
  }

  /**
   * Unmount a plugin (CIA-compliant)
   * @param pluginId - Plugin identifier
   * @returns Success status
   */
  unmountPlugin(pluginId: string): boolean {
    try {
      if (!this.mountedPlugins.has(pluginId)) {
        console.warn(`🧠 Plugin not found for unmounting: ${pluginId}`);
        return false;
      }

      const plugin = this.mountedPlugins.get(pluginId)!;

      // Unregister the sequence
      this.unregisterSequence(plugin.sequence.name);

      // Remove from mounted plugins
      this.mountedPlugins.delete(pluginId);
      this.pluginHandlers.delete(pluginId);

      console.log(
        `🧠 MusicalConductor: Successfully unmounted plugin: ${pluginId}`
      );
      return true;
    } catch (error) {
      console.error(
        `🧠 MusicalConductor: Failed to unmount plugin ${pluginId}:`,
        error
      );
      return false;
    }
  }

  /**
   * Get mounted plugin information
   * @param pluginId - Plugin identifier
   * @returns Plugin information or undefined
   */
  getPluginInfo(pluginId: string): SPAPlugin | undefined {
    return this.mountedPlugins.get(pluginId);
  }

  /**
   * Get all mounted plugin IDs
   * @returns Array of plugin IDs
   */
  getMountedPluginIds(): string[] {
    return Array.from(this.mountedPlugins.keys());
  }

  /**
   * Set priority for an event type
   * @param eventType - Event type
   * @param priority - Priority level (MUSICAL_DYNAMICS value)
   */
  setPriority(eventType: string, priority: string): void {
    this.priorities.set(eventType, priority);
    console.log(
      `🎼 MusicalConductor: Set priority for ${eventType}: ${priority}`
    );
  }

  /**
   * Start a musical sequence with Sequential Orchestration
   * @param sequenceName - Name of the sequence to start
   * @param data - Data to pass to the sequence
   * @param priority - Priority level: 'HIGH', 'NORMAL', 'CHAINED'
   * @returns Request ID for tracking
   */
  startSequence(
    sequenceName: string,
    data: Record<string, any> = {},
    priority: SequencePriority = SEQUENCE_PRIORITIES.NORMAL
  ): string {
    const requestId = `${sequenceName}-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    try {
      const sequence = this.sequences.get(sequenceName);
      if (!sequence) {
        throw new Error(`Sequence "${sequenceName}" not found`);
      }

      const sequenceRequest: SequenceRequest = {
        sequenceName,
        data,
        priority,
        requestId,
        queuedAt: performance.now(),
      };

      // Update statistics
      this.statistics.totalSequencesQueued++;
      this.statistics.currentQueueLength++;
      this.statistics.maxQueueLength = Math.max(
        this.statistics.maxQueueLength,
        this.statistics.currentQueueLength
      );

      console.log(
        `🎼 MusicalConductor: Starting sequence "${sequenceName}" with priority ${priority} (Request ID: ${requestId})`
      );

      if (priority === SEQUENCE_PRIORITIES.HIGH) {
        // HIGH priority: Execute immediately, bypassing queue
        console.log(
          `🎼 MusicalConductor: HIGH priority sequence - executing immediately`
        );
        this.executeSequenceImmediately(sequenceRequest);
      } else if (
        priority === SEQUENCE_PRIORITIES.CHAINED &&
        this.activeSequence
      ) {
        // CHAINED priority: Add to front of queue to execute after current sequence
        console.log(
          `🎼 MusicalConductor: CHAINED sequence - adding to front of queue`
        );
        this.sequenceQueue.unshift(sequenceRequest);
        this.statistics.chainedSequences++;
      } else {
        // NORMAL priority: Add to queue
        console.log(
          `🎼 MusicalConductor: NORMAL priority sequence - adding to queue`
        );
        this.sequenceQueue.push(sequenceRequest);

        // If no active sequence, process queue immediately
        if (!this.activeSequence) {
          this.processSequenceQueue();
        }
      }

      this.eventBus.emit(MUSICAL_CONDUCTOR_EVENT_TYPES.SEQUENCE_QUEUED, {
        sequenceName,
        requestId,
        priority,
        queueLength: this.sequenceQueue.length,
      });

      return requestId;
    } catch (error) {
      console.error(
        `🎼 MusicalConductor: Failed to start sequence: ${sequenceName}`,
        error
      );
      this.statistics.errorCount++;
      throw error;
    }
  }

  /**
   * Execute sequence immediately (no queue)
   * @param sequenceRequest - Sequence request object
   */
  private executeSequenceImmediately(sequenceRequest: SequenceRequest): void {
    const executionContext = this.createExecutionContext(sequenceRequest);
    this.activeSequence = executionContext;

    console.log(
      `🎼 MusicalConductor: Starting sequence immediately - ${sequenceRequest.sequenceName}`
    );
    this.executeSequence(executionContext);
  }

  /**
   * Create execution context for a sequence
   * @param sequenceRequest - Sequence request
   */
  private createExecutionContext(
    sequenceRequest: SequenceRequest
  ): SequenceExecutionContext {
    const sequence = this.sequences.get(sequenceRequest.sequenceName)!;

    return {
      id: sequenceRequest.requestId,
      sequenceName: sequenceRequest.sequenceName,
      sequence,
      data: sequenceRequest.data,
      startTime: performance.now(),
      currentMovement: 0,
      currentBeat: 0,
      completedBeats: [],
      errors: [],
      priority: sequenceRequest.priority,
      queuedAt: sequenceRequest.queuedAt,
    };
  }

  /**
   * Process next sequence in queue
   */
  private processSequenceQueue(): void {
    if (this.sequenceQueue.length > 0 && this.activeSequence === null) {
      const nextSequence = this.sequenceQueue.shift()!;
      const waitTime = performance.now() - nextSequence.queuedAt;

      // Update queue wait time statistics
      this.updateQueueWaitTimeStatistics(waitTime);

      console.log(
        `🎼 MusicalConductor: Processing queued sequence - ${
          nextSequence.sequenceName
        } (waited ${waitTime.toFixed(2)}ms)`
      );
      this.executeSequenceImmediately(nextSequence);
    } else if (this.sequenceQueue.length === 0) {
      console.log(`🎼 MusicalConductor: Queue is empty - conductor is idle`);
    }
  }

  /**
   * Update queue wait time statistics
   * @param waitTime - Wait time in milliseconds
   */
  private updateQueueWaitTimeStatistics(waitTime: number): void {
    // Simple moving average calculation
    const alpha = 0.1; // Smoothing factor
    this.statistics.averageQueueWaitTime =
      this.statistics.averageQueueWaitTime * (1 - alpha) + waitTime * alpha;
  }

  /**
   * Get current statistics (enhanced with CIA plugin information)
   */
  getStatistics(): ConductorStatistics & { mountedPlugins: number } {
    return {
      ...this.statistics,
      mountedPlugins: this.mountedPlugins.size,
    };
  }

  /**
   * Reset statistics
   */
  resetStatistics(): void {
    this.statistics = {
      totalSequencesExecuted: 0,
      totalBeatsExecuted: 0,
      averageExecutionTime: 0,
      errorCount: 0,
      lastExecutionTime: null,
      totalSequencesQueued: 0,
      maxQueueLength: 0,
      currentQueueLength: this.sequenceQueue.length,
      averageQueueWaitTime: 0,
      sequenceCompletionRate: 0,
      chainedSequences: 0,
    };

    console.log("🎼 MusicalConductor: Statistics reset");
  }

  /**
   * Get queue status
   */
  getQueueStatus(): { length: number; activeSequence: string | null } {
    return {
      length: this.sequenceQueue.length,
      activeSequence: this.activeSequence?.sequenceName || null,
    };
  }

  /**
   * Execute a musical sequence
   * @param executionContext - Execution context
   */
  private async executeSequence(
    executionContext: SequenceExecutionContext
  ): Promise<void> {
    try {
      const { sequence, data } = executionContext;

      this.eventBus.emit(MUSICAL_CONDUCTOR_EVENT_TYPES.SEQUENCE_STARTED, {
        sequenceName: executionContext.sequenceName,
        requestId: executionContext.id,
        startTime: executionContext.startTime,
      });

      // Execute all movements
      for (
        let movementIndex = 0;
        movementIndex < sequence.movements.length;
        movementIndex++
      ) {
        const movement = sequence.movements[movementIndex];
        executionContext.currentMovement = movementIndex;

        console.log(
          `🎼 MusicalConductor: Executing movement ${movementIndex}: ${movement.name}`
        );

        // Execute all beats in the movement
        await this.executeMovement(executionContext, movement);
      }

      // Mark sequence as completed
      this.completeSequence(executionContext);
    } catch (error) {
      console.error(`🎼 MusicalConductor: Sequence execution failed:`, error);
      this.failSequence(executionContext, error as Error);
    }
  }

  /**
   * Execute a movement within a sequence
   * @param executionContext - Execution context
   * @param movement - Movement to execute
   */
  private async executeMovement(
    executionContext: SequenceExecutionContext,
    movement: SequenceMovement
  ): Promise<void> {
    // Sort beats by beat number to ensure proper order
    const sortedBeats = [...movement.beats].sort((a, b) => a.beat - b.beat);

    for (const beat of sortedBeats) {
      executionContext.currentBeat = beat.beat;

      try {
        await this.executeBeat(executionContext, beat);
        executionContext.completedBeats.push(beat.beat);
        this.statistics.totalBeatsExecuted++;
      } catch (error) {
        console.error(
          `🎼 MusicalConductor: Error executing beat ${beat.beat}:`,
          error
        );
        executionContext.errors.push({
          beat: beat.beat,
          error: (error as Error).message,
          timestamp: Date.now(),
        });

        // Decide whether to continue or abort based on error handling strategy
        if (beat.errorHandling === "abort-sequence") {
          throw error;
        }
        // For other strategies, log and continue
      }
    }
  }

  /**
   * Execute a single beat
   * @param executionContext - Execution context
   * @param beat - Beat to execute
   */
  private async executeBeat(
    executionContext: SequenceExecutionContext,
    beat: SequenceBeat
  ): Promise<void> {
    const { event, data = {}, timing = MUSICAL_TIMING.IMMEDIATE } = beat;

    // Merge beat data with execution context data
    const eventData = {
      ...executionContext.data,
      ...data,
      beat: beat.beat,
      movement: executionContext.currentMovement,
      sequence: {
        id: executionContext.id,
        name: executionContext.sequenceName,
      },
    };

    this.eventBus.emit(MUSICAL_CONDUCTOR_EVENT_TYPES.BEAT_STARTED, {
      sequenceName: executionContext.sequenceName,
      beat: beat.beat,
      event,
      title: beat.title,
    });

    // Handle timing for event emission
    if (timing === MUSICAL_TIMING.IMMEDIATE) {
      this.emitEvent(event, eventData, executionContext);
    } else if (timing === MUSICAL_TIMING.AFTER_BEAT) {
      // Small delay to ensure proper sequencing
      setTimeout(() => {
        this.emitEvent(event, eventData, executionContext);
      }, 10);
    } else if (timing === MUSICAL_TIMING.DELAYED) {
      // Longer delay for intentional timing
      setTimeout(() => {
        this.emitEvent(event, eventData, executionContext);
      }, 100);
    }

    console.log(
      `🎼 MusicalConductor: Executed beat ${beat.beat}: ${event} (${
        beat.title || "No title"
      })`
    );

    this.eventBus.emit(MUSICAL_CONDUCTOR_EVENT_TYPES.BEAT_COMPLETED, {
      sequenceName: executionContext.sequenceName,
      beat: beat.beat,
      event,
    });
  }

  /**
   * Emit an event through the event bus
   * @param eventType - Event type
   * @param eventData - Event data
   * @param executionContext - Execution context
   */
  private emitEvent(
    eventType: string,
    eventData: Record<string, any>,
    executionContext: SequenceExecutionContext
  ): void {
    try {
      // Add sequence context to event
      const contextualEventData = {
        ...eventData,
        sequence: {
          id: executionContext.id,
          name: executionContext.sequenceName,
          beat: executionContext.currentBeat,
          movement: executionContext.currentMovement,
        },
      };

      // Emit the event
      this.eventBus.emit(eventType, contextualEventData);

      console.log(
        `🎼 MusicalConductor: Emitted event: ${eventType} (Sequence: ${executionContext.sequenceName}, Beat: ${executionContext.currentBeat})`
      );
    } catch (error) {
      console.error(
        `🎼 MusicalConductor: Failed to emit event ${eventType}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Complete a sequence execution
   * @param executionContext - Execution context
   */
  private completeSequence(executionContext: SequenceExecutionContext): void {
    const executionTime = performance.now() - executionContext.startTime;

    // Update statistics
    this.statistics.totalSequencesExecuted++;
    this.statistics.lastExecutionTime = executionTime;
    this.statistics.currentQueueLength = Math.max(
      0,
      this.statistics.currentQueueLength - 1
    );

    // Update average execution time
    const alpha = 0.1; // Smoothing factor
    this.statistics.averageExecutionTime =
      this.statistics.averageExecutionTime * (1 - alpha) +
      executionTime * alpha;

    // Calculate completion rate
    this.statistics.sequenceCompletionRate =
      this.statistics.totalSequencesExecuted /
      this.statistics.totalSequencesQueued;

    // Add to history
    this.sequenceHistory.push(executionContext);

    // Keep history manageable (last 100 sequences)
    if (this.sequenceHistory.length > 100) {
      this.sequenceHistory.shift();
    }

    console.log(
      `🎼 MusicalConductor: Sequence completed - ${
        executionContext.sequenceName
      } (${executionTime.toFixed(2)}ms)`
    );

    this.eventBus.emit(MUSICAL_CONDUCTOR_EVENT_TYPES.SEQUENCE_COMPLETED, {
      sequenceName: executionContext.sequenceName,
      requestId: executionContext.id,
      executionTime,
      beatsExecuted: executionContext.completedBeats.length,
      errors: executionContext.errors.length,
    });

    // Clear active sequence and process queue
    this.activeSequence = null;
    this.processSequenceQueue();
  }

  /**
   * Fail a sequence execution
   * @param executionContext - Execution context
   * @param error - Error that caused the failure
   */
  private failSequence(
    executionContext: SequenceExecutionContext,
    error: Error
  ): void {
    const executionTime = performance.now() - executionContext.startTime;

    // Update statistics
    this.statistics.errorCount++;
    this.statistics.currentQueueLength = Math.max(
      0,
      this.statistics.currentQueueLength - 1
    );

    console.error(
      `🎼 MusicalConductor: Sequence failed - ${
        executionContext.sequenceName
      } (${executionTime.toFixed(2)}ms):`,
      error
    );

    this.eventBus.emit(MUSICAL_CONDUCTOR_EVENT_TYPES.SEQUENCE_FAILED, {
      sequenceName: executionContext.sequenceName,
      requestId: executionContext.id,
      executionTime,
      error: error.message,
      beatsExecuted: executionContext.completedBeats.length,
      totalErrors: executionContext.errors.length,
    });

    // Clear active sequence and process queue
    this.activeSequence = null;
    this.processSequenceQueue();
  }
}
