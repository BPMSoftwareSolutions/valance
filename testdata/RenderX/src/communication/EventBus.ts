/**
 * EventBus - Component Communication System (TypeScript)
 * 
 * Provides a robust pub/sub system for isolated component communication
 * following the RenderX component-driven architecture principles.
 * 
 * Features:
 * - Event subscription and emission
 * - Automatic unsubscribe functions
 * - Error handling to prevent callback failures from breaking the system
 * - Event debugging and logging capabilities
 * - TypeScript support with proper typing
 */

export type EventCallback<T = any> = (data: T) => void;
export type UnsubscribeFunction = () => void;

export interface EventSubscription {
  id: string;
  eventName: string;
  callback: EventCallback;
  subscribedAt: Date;
}

export interface EventDebugInfo {
  totalEvents: number;
  totalSubscriptions: number;
  eventCounts: Record<string, number>;
  subscriptionCounts: Record<string, number>;
}

/**
 * Base EventBus Class
 */
export class EventBus {
  private events: Record<string, EventCallback[]> = {};
  private debugMode: boolean = process.env.NODE_ENV === 'development';
  private subscriptionCounter: number = 0;
  private eventCounts: Record<string, number> = {};

  /**
   * Subscribe to an event
   * @param eventName - Name of the event to subscribe to
   * @param callback - Function to call when event is emitted
   * @returns Unsubscribe function
   */
  subscribe<T = any>(eventName: string, callback: EventCallback<T>): UnsubscribeFunction {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }

    this.events[eventName].push(callback);
    this.subscriptionCounter++;

    if (this.debugMode) {
      console.log(`📡 EventBus: Subscribed to "${eventName}" (${this.events[eventName].length} total subscribers)`);
    }

    // Return unsubscribe function
    return () => {
      this.unsubscribe(eventName, callback);
    };
  }

  /**
   * Unsubscribe from an event
   * @param eventName - Name of the event
   * @param callback - Callback function to remove
   */
  unsubscribe(eventName: string, callback: EventCallback): void {
    if (!this.events[eventName]) {
      return;
    }

    const index = this.events[eventName].indexOf(callback);
    if (index > -1) {
      this.events[eventName].splice(index, 1);
      
      if (this.debugMode) {
        console.log(`📡 EventBus: Unsubscribed from "${eventName}" (${this.events[eventName].length} remaining subscribers)`);
      }

      // Clean up empty event arrays
      if (this.events[eventName].length === 0) {
        delete this.events[eventName];
      }
    }
  }

  /**
   * Emit an event to all subscribers
   * @param eventName - Name of the event to emit
   * @param data - Data to pass to subscribers
   */
  emit<T = any>(eventName: string, data?: T): void {
    // Track event counts
    this.eventCounts[eventName] = (this.eventCounts[eventName] || 0) + 1;

    if (this.debugMode) {
      console.log(`📡 EventBus: Emitting "${eventName}"`, data);
    }

    if (!this.events[eventName]) {
      if (this.debugMode) {
        console.log(`📡 EventBus: No subscribers for "${eventName}"`);
      }
      return;
    }

    // Create a copy of subscribers to prevent issues if callbacks modify the array
    const subscribers = [...this.events[eventName]];

    subscribers.forEach((callback, index) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`📡 EventBus: Error in subscriber ${index} for "${eventName}":`, error);
        // Continue processing other subscribers even if one fails
      }
    });
  }

  /**
   * Remove all subscribers for an event
   * @param eventName - Name of the event to clear
   */
  clearEvent(eventName: string): void {
    if (this.events[eventName]) {
      delete this.events[eventName];
      if (this.debugMode) {
        console.log(`📡 EventBus: Cleared all subscribers for "${eventName}"`);
      }
    }
  }

  /**
   * Remove all subscribers for all events
   */
  clearAll(): void {
    this.events = {};
    this.eventCounts = {};
    if (this.debugMode) {
      console.log('📡 EventBus: Cleared all subscribers');
    }
  }

  /**
   * Get debug information about the EventBus
   */
  getDebugInfo(): EventDebugInfo {
    const subscriptionCounts: Record<string, number> = {};
    let totalSubscriptions = 0;

    Object.keys(this.events).forEach(eventName => {
      subscriptionCounts[eventName] = this.events[eventName].length;
      totalSubscriptions += this.events[eventName].length;
    });

    return {
      totalEvents: Object.keys(this.eventCounts).length,
      totalSubscriptions,
      eventCounts: { ...this.eventCounts },
      subscriptionCounts
    };
  }

  /**
   * Check if an event has subscribers
   * @param eventName - Name of the event to check
   */
  hasSubscribers(eventName: string): boolean {
    return !!(this.events[eventName] && this.events[eventName].length > 0);
  }

  /**
   * Get subscriber count for an event
   * @param eventName - Name of the event
   */
  getSubscriberCount(eventName: string): number {
    return this.events[eventName]?.length || 0;
  }

  /**
   * Enable or disable debug mode
   * @param enabled - Whether to enable debug mode
   */
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
    console.log(`📡 EventBus: Debug mode ${enabled ? 'enabled' : 'disabled'}`);
  }
}

// Import EVENT_TYPES from the dedicated event-types module
import { EVENT_TYPES, type EventType } from './event-types';
export { EVENT_TYPES };

/**
 * ConductorEventBus - Enhanced EventBus with Musical Sequencing
 * Extends the base EventBus with priority-based processing, dependency management,
 * and timing control to eliminate race conditions and provide proper event orchestration.
 */
export class ConductorEventBus extends EventBus {
  private externalConductor: any = null;
  private sequences: Map<string, any> = new Map();
  private priorities: Map<string, string> = new Map();
  private dependencies: Map<string, string[]> = new Map();
  private currentSequences: Map<string, any> = new Map();
  private completedEvents: Set<string> = new Set();

  // Performance monitoring
  private metrics = {
    eventsProcessed: 0,
    sequencesExecuted: 0,
    averageLatency: 0,
    raceConditionsDetected: 0
  };

  // Conductor state
  private tempo: number = 120; // Default BPM for timing calculations

  constructor(externalConductor: any = null) {
    super();

    // Use external conductor if provided
    if (externalConductor) {
      console.log('🎼 EventBus: Using external conductor for unified sequence system');
      this.externalConductor = externalConductor;
      // Use external conductor's sequence registry for unified system
      this.sequences = externalConductor.sequences || new Map();
    } else {
      console.log('🎼 EventBus: Using internal conductor (legacy mode)');
      // Legacy mode: separate sequence system
      this.sequences = new Map();
    }
  }

  /**
   * Enhanced emit with conductor control
   * @param eventName - Event to emit
   * @param data - Event data
   * @param options - Conductor options
   */
  override emit<T = any>(eventName: string, data?: T, options: any = {}): void {
    const startTime = performance.now();

    // Check if this event is part of a sequence
    if (options.sequence) {
      return this.emitInSequence(eventName, data, options);
    }

    // Apply priority-based processing
    const priority = this.priorities.get(eventName) || 'mp'; // mezzo-piano default
    const dependencies = this.dependencies.get(eventName) || [];

    // Check dependencies
    if (dependencies.length > 0 && !this.dependenciesMet(dependencies, options.context)) {
      return this.queueForDependencies(eventName, data, options, dependencies);
    }

    // Execute with timing control
    this.executeWithTiming(eventName, data, options, priority);

    // Update metrics
    this.updateMetrics(eventName, startTime);
  }

  /**
   * Execute event with musical timing
   * @param eventName - Event name
   * @param data - Event data
   * @param options - Timing options
   * @param priority - Event priority
   */
  private executeWithTiming(eventName: string, data: any, options: any, priority: string): void {
    const timing = options.timing || 'immediate';

    switch (timing) {
      case 'immediate':
        this.executeEvent(eventName, data, priority);
        break;

      case 'after-beat':
        // Wait for previous beat to complete
        setTimeout(() => this.executeEvent(eventName, data, priority), 0);
        break;

      case 'next-measure':
        // Wait for next event loop tick
        setImmediate(() => this.executeEvent(eventName, data, priority));
        break;

      case 'delayed':
        // Intentional delay based on tempo
        const delay = this.calculateDelay(options.beats || 1);
        setTimeout(() => this.executeEvent(eventName, data, priority), delay);
        break;

      case 'wait-for-signal':
        // Queue until specific condition is met
        this.queueForSignal(eventName, data, options.signal, priority);
        break;

      default:
        this.executeEvent(eventName, data, priority);
    }
  }

  /**
   * Execute event with base EventBus emit
   * @param eventName - Event name
   * @param data - Event data
   * @param priority - Event priority
   */
  private executeEvent(eventName: string, data: any, priority: string): void {
    // Call parent emit method
    super.emit(eventName, data);
    this.completedEvents.add(eventName);
  }

  /**
   * Emit event in sequence context
   * @param eventName - Event name
   * @param data - Event data
   * @param options - Sequence options
   */
  private emitInSequence(eventName: string, data: any, options: any): void {
    // Delegate to external conductor if available
    if (this.externalConductor && this.externalConductor.startSequence) {
      console.log(`🎼 EventBus: Delegating to external conductor for sequence event "${eventName}"`);
      return this.externalConductor.startSequence(options.sequence, data, options.context);
    }

    // Fallback to regular emit
    super.emit(eventName, data);
  }

  /**
   * Check if dependencies are met
   * @param dependencies - Array of dependency event names
   * @param context - Execution context
   */
  private dependenciesMet(dependencies: string[], context: any): boolean {
    return dependencies.every(dep => this.completedEvents.has(dep));
  }

  /**
   * Queue event for dependencies
   * @param eventName - Event name
   * @param data - Event data
   * @param options - Options
   * @param dependencies - Dependencies
   */
  private queueForDependencies(eventName: string, data: any, options: any, dependencies: string[]): void {
    console.log(`🎼 EventBus: Queueing ${eventName} for dependencies:`, dependencies);
    // Simple implementation - could be enhanced with proper dependency resolution
    setTimeout(() => {
      if (this.dependenciesMet(dependencies, options.context)) {
        this.emit(eventName, data, { ...options, timing: 'immediate' });
      }
    }, 50);
  }

  /**
   * Queue event for signal
   * @param eventName - Event name
   * @param data - Event data
   * @param signal - Signal to wait for
   * @param priority - Event priority
   */
  private queueForSignal(eventName: string, data: any, signal: string, priority: string): void {
    console.log(`🎼 EventBus: Queueing ${eventName} for signal: ${signal}`);
    // Simple implementation - could be enhanced with proper signal handling
    const checkSignal = () => {
      if (this.completedEvents.has(signal)) {
        this.executeEvent(eventName, data, priority);
      } else {
        setTimeout(checkSignal, 10);
      }
    };
    checkSignal();
  }

  /**
   * Calculate delay based on tempo
   * @param beats - Number of beats to delay
   */
  private calculateDelay(beats: number): number {
    // Convert BPM to milliseconds per beat
    const msPerBeat = (60 / this.tempo) * 1000;
    return beats * msPerBeat;
  }

  /**
   * Update performance metrics
   * @param eventName - Event name
   * @param startTime - Start time
   */
  private updateMetrics(eventName: string, startTime: number): void {
    const latency = performance.now() - startTime;
    this.metrics.eventsProcessed++;

    // Simple moving average for latency
    const alpha = 0.1;
    this.metrics.averageLatency =
      this.metrics.averageLatency * (1 - alpha) + latency * alpha;
  }

  /**
   * Connect to external conductor
   * @param conductor - The main conductor instance
   */
  connectToMainConductor(conductor: any): void {
    console.log('🎼 EventBus: Connecting to main conductor for unified sequence system');
    this.externalConductor = conductor;

    // Use the main conductor's sequence registry for unified access
    if (conductor.sequences) {
      this.sequences = conductor.sequences;
      console.log(`🎼 EventBus: Connected to main conductor with ${this.sequences.size} sequences`);
    } else {
      console.warn('🚨 EventBus: Main conductor does not have sequences property');
    }
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    return { ...this.metrics };
  }

  /**
   * Reset performance metrics
   */
  resetMetrics(): void {
    this.metrics = {
      eventsProcessed: 0,
      sequencesExecuted: 0,
      averageLatency: 0,
      raceConditionsDetected: 0
    };
  }
}

// Create and export singleton instance using ConductorEventBus
export const eventBus = new ConductorEventBus();
