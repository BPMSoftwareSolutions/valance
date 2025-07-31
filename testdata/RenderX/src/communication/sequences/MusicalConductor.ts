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

import { EventBus } from '../EventBus';
import type {
  MusicalSequence,
  SequenceExecutionContext,
  ConductorStatistics,
  SequenceRequest,
  SequencePriority,
  SequenceBeat,
  SequenceMovement
} from './SequenceTypes';
import {
  MUSICAL_TIMING,
  MUSICAL_DYNAMICS,
  MUSICAL_CONDUCTOR_EVENT_TYPES,
  SEQUENCE_PRIORITIES
} from './SequenceTypes';

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
    chainedSequences: 0
  };

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    console.log('🎼 MusicalConductor: CIA-compliant conductor with Sequential Orchestration initialized');
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
      category: sequence.category
    });
  }

  /**
   * Unregister a musical sequence
   * @param sequenceName - Name of the sequence to unregister
   */
  unregisterSequence(sequenceName: string): void {
    if (this.sequences.has(sequenceName)) {
      this.sequences.delete(sequenceName);
      console.log(`🎼 MusicalConductor: Unregistered sequence "${sequenceName}"`);
      
      this.eventBus.emit(MUSICAL_CONDUCTOR_EVENT_TYPES.SEQUENCE_UNREGISTERED, {
        sequenceName
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
  play(pluginId: string, movementName: string, context: any = {}): any {
    try {
      console.log(`🎼 MusicalConductor.play(): ${pluginId} -> ${movementName}`);

      // Validate plugin exists
      const plugin = this.mountedPlugins.get(pluginId);
      if (!plugin) {
        console.warn(`🧠 Plugin not found: ${pluginId}. Available plugins: [${Array.from(this.mountedPlugins.keys()).join(', ')}]`);
        return null;
      }

      // Execute the movement handler
      return this.executeMovementHandler(pluginId, movementName, context);

    } catch (error) {
      console.error(`🧠 MusicalConductor.play() failed for ${pluginId}.${movementName}:`, (error as Error).message);
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
  mount(sequence: any, handlers: any, pluginId?: string): PluginMountResult {
    const id = pluginId || sequence?.name || 'unknown-plugin';

    try {
      console.log(`🧠 MusicalConductor: Attempting to mount plugin: ${id}`);

      // Validate sequence
      if (!sequence) {
        console.error('🧠 Mount failed: sequence is required');
        return {
          success: false,
          pluginId: id,
          message: 'Mount failed: sequence is required'
        };
      }

      if (!sequence.movements || !Array.isArray(sequence.movements)) {
        console.error('🧠 Mount failed: sequence.movements must be an array');
        return {
          success: false,
          pluginId: id,
          message: 'Mount failed: sequence.movements must be an array'
        };
      }

      // Validate handlers
      if (!handlers || typeof handlers !== 'object') {
        console.error('🧠 Mount failed: handlers must be an object');
        return {
          success: false,
          pluginId: id,
          message: 'Mount failed: handlers must be an object'
        };
      }

      // Validate movement-to-handler mapping
      const warnings: string[] = [];
      for (const movement of sequence.movements) {
        if (!movement.name) {
          console.warn('🧠 Movement missing name, skipping validation');
          warnings.push('Movement missing name, skipping validation');
          continue;
        }

        if (!(movement.name in handlers)) {
          console.warn(`🧠 Missing handler for movement: ${movement.name}`);
          warnings.push(`Missing handler for movement: ${movement.name}`);
        }

        if (handlers[movement.name] && typeof handlers[movement.name] !== 'function') {
          console.error(`🧠 Handler for ${movement.name} is not a function`);
          return {
            success: false,
            pluginId: id,
            message: `Handler for ${movement.name} is not a function`
          };
        }
      }

      // Create plugin object
      const plugin: SPAPlugin = {
        sequence,
        handlers,
        metadata: {
          id,
          version: sequence.metadata?.version || '1.0.0',
          author: sequence.metadata?.author
        }
      };

      // Mount the plugin
      this.mountedPlugins.set(id, plugin);
      this.pluginHandlers.set(id, handlers);

      // Register the sequence with the existing conductor system
      this.registerSequence(sequence);

      console.log(`🧠 MusicalConductor: Successfully mounted plugin: ${id}`);

      return {
        success: true,
        pluginId: id,
        message: `Successfully mounted plugin: ${id}`,
        warnings: warnings.length > 0 ? warnings : undefined
      };

    } catch (error) {
      console.error('🧠 MusicalConductor: Mount failed with error:', error);
      return {
        success: false,
        pluginId: id,
        message: `Mount failed with error: ${(error as Error).message}`
      };
    }
  }

  /**
   * Register CIA-compliant plugins
   * Loads and mounts all plugins from the plugins directory
   */
  async registerCIAPlugins(): Promise<void> {
    try {
      console.log("🧠 Registering CIA-compliant plugins...");

      // Register component-drag-symphony
      const componentDragPlugin = await import('../../../public/plugins/component-drag-symphony/index');
      this.mount(componentDragPlugin.sequence, componentDragPlugin.handlers, 'component-drag-symphony');

      // Register library-drop-symphony
      const libraryDropPlugin = await import('../../../public/plugins/library-drop-symphony/index');
      this.mount(libraryDropPlugin.sequence, libraryDropPlugin.handlers, 'library-drop-symphony');

      // Register panel-toggle-symphony
      const panelTogglePlugin = await import('../../../public/plugins/panel-toggle-symphony/index');
      this.mount(panelTogglePlugin.sequence, panelTogglePlugin.handlers, 'panel-toggle-symphony');

      // Register layout-mode-symphony
      const layoutModePlugin = await import('../../../public/plugins/layout-mode-symphony/index');
      this.mount(layoutModePlugin.sequence, layoutModePlugin.handlers, 'layout-mode-symphony');

      console.log("✅ CIA-compliant plugins registered successfully");
    } catch (error) {
      console.error("❌ Failed to register CIA plugins:", error);
    }
  }

  /**
   * Execute movement with handler validation (CIA-compliant)
   * @param sequenceId - Sequence identifier
   * @param movementName - Movement name
   * @param data - Data to pass to handler
   * @returns Handler execution result
   */
  executeMovementHandler(sequenceId: string, movementName: string, data: any): any {
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
      if (typeof handler !== 'function') {
        console.error(`🧠 Handler for ${movementName} is not a function`);
        return null;
      }

      console.log(`🧠 MusicalConductor: Executing handler for movement: ${movementName}`);
      return handler(data);

    } catch (error) {
      console.error(`🧠 MusicalConductor: Handler execution failed for ${movementName}:`, error);
      return null;
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

      const plugin = await import(pluginPath);

      // Validate plugin structure after import
      if (!plugin || typeof plugin !== 'object') {
        console.warn(`🧠 Failed to load plugin: invalid plugin structure at ${pluginPath}`);
        return {
          success: false,
          pluginId: 'unknown',
          message: `Failed to load plugin: invalid plugin structure at ${pluginPath}`
        };
      }

      if (!plugin.sequence || !plugin.handlers) {
        console.warn(`🧠 Plugin missing required exports (sequence, handlers): ${pluginPath}`);
        return {
          success: false,
          pluginId: plugin.sequence?.name || 'unknown',
          message: `Plugin missing required exports (sequence, handlers): ${pluginPath}`
        };
      }

      // Mount the plugin
      return this.mount(plugin.sequence, plugin.handlers);

    } catch (error) {
      console.warn(`🧠 MusicalConductor: Failed to load plugin from ${pluginPath}:`, (error as Error).message);
      return {
        success: false,
        pluginId: 'unknown',
        message: `Failed to load plugin from ${pluginPath}: ${(error as Error).message}`
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

      console.log(`🧠 MusicalConductor: Successfully unmounted plugin: ${pluginId}`);
      return true;

    } catch (error) {
      console.error(`🧠 MusicalConductor: Failed to unmount plugin ${pluginId}:`, error);
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
    console.log(`🎼 MusicalConductor: Set priority for ${eventType}: ${priority}`);
  }

  /**
   * Start a musical sequence with Sequential Orchestration
   * @param sequenceName - Name of the sequence to start
   * @param data - Data to pass to the sequence
   * @param priority - Priority level: 'HIGH', 'NORMAL', 'CHAINED'
   * @returns Request ID for tracking
   */
  startSequence(sequenceName: string, data: Record<string, any> = {}, priority: SequencePriority = SEQUENCE_PRIORITIES.NORMAL): string {
    const requestId = `${sequenceName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

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
        queuedAt: performance.now()
      };

      // Update statistics
      this.statistics.totalSequencesQueued++;
      this.statistics.currentQueueLength++;
      this.statistics.maxQueueLength = Math.max(this.statistics.maxQueueLength, this.statistics.currentQueueLength);

      console.log(`🎼 MusicalConductor: Starting sequence "${sequenceName}" with priority ${priority} (Request ID: ${requestId})`);

      if (priority === SEQUENCE_PRIORITIES.HIGH) {
        // HIGH priority: Execute immediately, bypassing queue
        console.log(`🎼 MusicalConductor: HIGH priority sequence - executing immediately`);
        this.executeSequenceImmediately(sequenceRequest);
      } else if (priority === SEQUENCE_PRIORITIES.CHAINED && this.activeSequence) {
        // CHAINED priority: Add to front of queue to execute after current sequence
        console.log(`🎼 MusicalConductor: CHAINED sequence - adding to front of queue`);
        this.sequenceQueue.unshift(sequenceRequest);
        this.statistics.chainedSequences++;
      } else {
        // NORMAL priority: Add to queue
        console.log(`🎼 MusicalConductor: NORMAL priority sequence - adding to queue`);
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
        queueLength: this.sequenceQueue.length
      });

      return requestId;

    } catch (error) {
      console.error(`🎼 MusicalConductor: Failed to start sequence: ${sequenceName}`, error);
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

    console.log(`🎼 MusicalConductor: Starting sequence immediately - ${sequenceRequest.sequenceName}`);
    this.executeSequence(executionContext);
  }

  /**
   * Create execution context for a sequence
   * @param sequenceRequest - Sequence request
   */
  private createExecutionContext(sequenceRequest: SequenceRequest): SequenceExecutionContext {
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
      queuedAt: sequenceRequest.queuedAt
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

      console.log(`🎼 MusicalConductor: Processing queued sequence - ${nextSequence.sequenceName} (waited ${waitTime.toFixed(2)}ms)`);
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
      mountedPlugins: this.mountedPlugins.size
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
      chainedSequences: 0
    };
    
    console.log('🎼 MusicalConductor: Statistics reset');
  }

  /**
   * Get queue status
   */
  getQueueStatus(): { length: number; activeSequence: string | null } {
    return {
      length: this.sequenceQueue.length,
      activeSequence: this.activeSequence?.sequenceName || null
    };
  }

  /**
   * Execute a musical sequence
   * @param executionContext - Execution context
   */
  private async executeSequence(executionContext: SequenceExecutionContext): Promise<void> {
    try {
      const { sequence, data } = executionContext;

      this.eventBus.emit(MUSICAL_CONDUCTOR_EVENT_TYPES.SEQUENCE_STARTED, {
        sequenceName: executionContext.sequenceName,
        requestId: executionContext.id,
        startTime: executionContext.startTime
      });

      // Execute all movements
      for (let movementIndex = 0; movementIndex < sequence.movements.length; movementIndex++) {
        const movement = sequence.movements[movementIndex];
        executionContext.currentMovement = movementIndex;

        console.log(`🎼 MusicalConductor: Executing movement ${movementIndex}: ${movement.name}`);

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
  private async executeMovement(executionContext: SequenceExecutionContext, movement: SequenceMovement): Promise<void> {
    // Sort beats by beat number to ensure proper order
    const sortedBeats = [...movement.beats].sort((a, b) => a.beat - b.beat);

    for (const beat of sortedBeats) {
      executionContext.currentBeat = beat.beat;

      try {
        await this.executeBeat(executionContext, beat);
        executionContext.completedBeats.push(beat.beat);
        this.statistics.totalBeatsExecuted++;

      } catch (error) {
        console.error(`🎼 MusicalConductor: Error executing beat ${beat.beat}:`, error);
        executionContext.errors.push({
          beat: beat.beat,
          error: (error as Error).message,
          timestamp: Date.now()
        });

        // Decide whether to continue or abort based on error handling strategy
        if (beat.errorHandling === 'abort-sequence') {
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
  private async executeBeat(executionContext: SequenceExecutionContext, beat: SequenceBeat): Promise<void> {
    const { event, data = {}, timing = MUSICAL_TIMING.IMMEDIATE } = beat;

    // Merge beat data with execution context data
    const eventData = {
      ...executionContext.data,
      ...data,
      beat: beat.beat,
      movement: executionContext.currentMovement,
      sequence: {
        id: executionContext.id,
        name: executionContext.sequenceName
      }
    };

    this.eventBus.emit(MUSICAL_CONDUCTOR_EVENT_TYPES.BEAT_STARTED, {
      sequenceName: executionContext.sequenceName,
      beat: beat.beat,
      event,
      title: beat.title
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

    console.log(`🎼 MusicalConductor: Executed beat ${beat.beat}: ${event} (${beat.title || 'No title'})`);

    this.eventBus.emit(MUSICAL_CONDUCTOR_EVENT_TYPES.BEAT_COMPLETED, {
      sequenceName: executionContext.sequenceName,
      beat: beat.beat,
      event
    });
  }

  /**
   * Emit an event through the event bus
   * @param eventType - Event type
   * @param eventData - Event data
   * @param executionContext - Execution context
   */
  private emitEvent(eventType: string, eventData: Record<string, any>, executionContext: SequenceExecutionContext): void {
    try {
      // Add sequence context to event
      const contextualEventData = {
        ...eventData,
        sequence: {
          id: executionContext.id,
          name: executionContext.sequenceName,
          beat: executionContext.currentBeat,
          movement: executionContext.currentMovement
        }
      };

      // Emit the event
      this.eventBus.emit(eventType, contextualEventData);

      console.log(`🎼 MusicalConductor: Emitted event: ${eventType} (Sequence: ${executionContext.sequenceName}, Beat: ${executionContext.currentBeat})`);

    } catch (error) {
      console.error(`🎼 MusicalConductor: Failed to emit event ${eventType}:`, error);
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
    this.statistics.currentQueueLength = Math.max(0, this.statistics.currentQueueLength - 1);

    // Update average execution time
    const alpha = 0.1; // Smoothing factor
    this.statistics.averageExecutionTime =
      this.statistics.averageExecutionTime * (1 - alpha) + executionTime * alpha;

    // Calculate completion rate
    this.statistics.sequenceCompletionRate =
      this.statistics.totalSequencesExecuted / this.statistics.totalSequencesQueued;

    // Add to history
    this.sequenceHistory.push(executionContext);

    // Keep history manageable (last 100 sequences)
    if (this.sequenceHistory.length > 100) {
      this.sequenceHistory.shift();
    }

    console.log(`🎼 MusicalConductor: Sequence completed - ${executionContext.sequenceName} (${executionTime.toFixed(2)}ms)`);

    this.eventBus.emit(MUSICAL_CONDUCTOR_EVENT_TYPES.SEQUENCE_COMPLETED, {
      sequenceName: executionContext.sequenceName,
      requestId: executionContext.id,
      executionTime,
      beatsExecuted: executionContext.completedBeats.length,
      errors: executionContext.errors.length
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
  private failSequence(executionContext: SequenceExecutionContext, error: Error): void {
    const executionTime = performance.now() - executionContext.startTime;

    // Update statistics
    this.statistics.errorCount++;
    this.statistics.currentQueueLength = Math.max(0, this.statistics.currentQueueLength - 1);

    console.error(`🎼 MusicalConductor: Sequence failed - ${executionContext.sequenceName} (${executionTime.toFixed(2)}ms):`, error);

    this.eventBus.emit(MUSICAL_CONDUCTOR_EVENT_TYPES.SEQUENCE_FAILED, {
      sequenceName: executionContext.sequenceName,
      requestId: executionContext.id,
      executionTime,
      error: error.message,
      beatsExecuted: executionContext.completedBeats.length,
      totalErrors: executionContext.errors.length
    });

    // Clear active sequence and process queue
    this.activeSequence = null;
    this.processSequenceQueue();
  }
}
