/**
 * Enhanced Musical Conductor Class (TypeScript)
 * Manages the execution and coordination of musical sequences
 * 
 * Features:
 * - Sequential orchestration with queue-based system
 * - Priority-based sequence execution
 * - Comprehensive error handling
 * - Performance metrics and statistics
 * - TypeScript support with proper typing
 */

import { EventBus } from '../EventBus';
import {
  MusicalSequence,
  SequenceExecutionContext,
  ConductorStatistics,
  SequenceRequest,
  SequencePriority,
  SequenceBeat,
  SequenceMovement,
  MUSICAL_TIMING,
  MUSICAL_DYNAMICS,
  MUSICAL_CONDUCTOR_EVENT_TYPES,
  SEQUENCE_PRIORITIES
} from './SequenceTypes';

export class MusicalConductor {
  private eventBus: EventBus;
  private sequences: Map<string, MusicalSequence> = new Map();
  
  // Sequential Orchestration: Replace concurrent execution with queue-based system
  private activeSequence: SequenceExecutionContext | null = null;
  private sequenceQueue: SequenceRequest[] = [];
  private sequenceHistory: SequenceExecutionContext[] = [];
  private priorities: Map<string, string> = new Map();

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
    console.log('🎼 MusicalConductor: Enhanced conductor with Sequential Orchestration initialized');
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
   * Get current statistics
   */
  getStatistics(): ConductorStatistics {
    return { ...this.statistics };
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
