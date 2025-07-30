/**
 * Canvas Sequences Index
 * 
 * Central export point for all canvas-specific musical sequences.
 * Follows the anti-pattern resolution strategy for pure musical sequence architecture.
 * 
 * This file exports all canvas sequences and their convenience functions
 * following the established pattern from the main sequences index.
 */

// Import all canvas sequence definitions
import {
  CANVAS_LIBRARY_DROP_SEQUENCE,
  startCanvasLibraryDropFlow,
  registerCanvasLibraryDropHandlers
} from './CanvasSequences.library-drop-symphony';

import {
  CANVAS_ELEMENT_SELECTION_SEQUENCE,
  startCanvasElementSelectionFlow,
  registerCanvasElementSelectionHandlers
} from './CanvasSequences.element-selection-symphony';

import {
  CANVAS_COMPONENT_DRAG_SEQUENCE,
  startCanvasComponentDragFlow,
  registerCanvasComponentDragHandlers
} from './CanvasSequences.component-drag-symphony';

/**
 * All Canvas Sequences Registry
 * Complete list of all canvas sequences available in the system
 */
export const ALL_CANVAS_SEQUENCES = [
  CANVAS_LIBRARY_DROP_SEQUENCE,
  CANVAS_ELEMENT_SELECTION_SEQUENCE,
  CANVAS_COMPONENT_DRAG_SEQUENCE
] as const;

/**
 * Canvas Sequence Names Mapping
 * Maps sequence names to their definitions for easy lookup
 */
export const CANVAS_SEQUENCE_NAMES = {
  CANVAS_LIBRARY_DROP: 'Canvas Library Drop Symphony No. 33',
  CANVAS_ELEMENT_SELECTION: 'Canvas Element Selection Symphony No. 37',
  CANVAS_COMPONENT_DRAG: 'Canvas Component Drag Symphony No. 4'
} as const;

/**
 * Canvas Musical Sequences API
 * Convenience functions for starting canvas sequences following the anti-pattern resolution strategy
 * 
 * Usage Pattern (Replaces Direct Emissions):
 * Instead of: conductor.emitEvent('event-name', data);
 * Use: CanvasSequences.startEventFlow(conductor, data);
 */
export const CanvasSequences = {
  // Canvas Library Drop Sequences
  startCanvasLibraryDropFlow,

  // Canvas Element Selection Sequences
  startCanvasElementSelectionFlow,

  // Canvas Component Drag Sequences
  startCanvasComponentDragFlow,

  /**
   * Generic canvas sequence starter for custom sequences
   * @param conductor - The musical conductor instance
   * @param sequenceName - Name of the sequence to start
   * @param data - Data to pass to the sequence
   * @param priority - Sequence priority level
   * @returns Sequence execution ID
   */
  startCustomCanvasSequence: (
    conductor: any,
    sequenceName: string,
    data: Record<string, any> = {},
    priority: 'HIGH' | 'NORMAL' | 'CHAINED' = 'NORMAL'
  ): string => {
    return conductor.startSequence(sequenceName, {
      ...data,
      timestamp: Date.now(),
      sequenceId: `canvas-${sequenceName}-${Date.now()}`,
      context: {
        source: 'canvas-sequence',
        operation: 'generic-canvas-start',
        phase: 'initialization'
      }
    }, priority);
  }
};

/**
 * Register All Canvas Sequences with Conductor
 * Registers all canvas sequences with the main musical conductor
 *
 * @param conductor - The musical conductor instance
 */
export function registerAllCanvasSequences(conductor: any): void {
  console.log('🎼 Registering all canvas musical sequences with conductor...');

  let registeredCount = 0;
  let failedCount = 0;

  for (const sequence of ALL_CANVAS_SEQUENCES) {
    try {
      conductor.registerSequence(sequence);
      registeredCount++;
      console.log(`✅ Registered canvas sequence: ${sequence.name}`);
    } catch (error) {
      failedCount++;
      console.error(`❌ Failed to register canvas sequence: ${sequence.name}`, error);
    }
  }

  console.log(`🎼 Canvas sequence registration complete: ${registeredCount} registered, ${failedCount} failed`);
}

/**
 * Register All Canvas Handlers with Event Bus
 * Registers all canvas sequence handlers with the event bus
 *
 * @param conductor - The musical conductor instance
 * @param eventBus - The event bus instance
 */
export function registerAllCanvasHandlers(conductor: any, eventBus: any): void {
  console.log('🎼 Registering all canvas sequence handlers with event bus...');

  // Register Canvas Library Drop handlers
  registerCanvasLibraryDropHandlers(conductor, eventBus);

  // Register Canvas Element Selection handlers
  registerCanvasElementSelectionHandlers(conductor, eventBus);

  // Register Canvas Component Drag handlers
  registerCanvasComponentDragHandlers();

  console.log('🎼 Canvas handler registration complete');
}

/**
 * Get Canvas Sequence by Name
 * Utility function to get a canvas sequence definition by name
 * 
 * @param sequenceName - Name of the sequence to find
 * @returns Sequence definition or undefined
 */
export function getCanvasSequenceByName(sequenceName: string) {
  return ALL_CANVAS_SEQUENCES.find(seq => seq.name === sequenceName);
}

/**
 * Validate All Canvas Sequences
 * Validates all canvas sequence definitions for completeness and correctness
 * 
 * @returns Validation results
 */
export function validateAllCanvasSequences(): {
  valid: string[];
  invalid: Array<{ name: string; errors: string[] }>;
} {
  const valid: string[] = [];
  const invalid: Array<{ name: string; errors: string[] }> = [];
  
  for (const sequence of ALL_CANVAS_SEQUENCES) {
    const errors: string[] = [];
    
    // Basic validation
    if (!sequence.name) errors.push('Missing sequence name');
    if (!sequence.description) errors.push('Missing sequence description');
    if (!sequence.movements || sequence.movements.length === 0) {
      errors.push('Missing movements');
    }
    
    // Movement validation
    sequence.movements?.forEach((movement, movementIndex) => {
      if (!movement.name) errors.push(`Movement ${movementIndex}: Missing name`);
      if (!movement.beats || movement.beats.length === 0) {
        errors.push(`Movement ${movementIndex}: Missing beats`);
      }
      
      // Beat validation
      movement.beats?.forEach((beat, beatIndex) => {
        if (!beat.event) errors.push(`Movement ${movementIndex}, Beat ${beatIndex}: Missing event`);
        if (!beat.dynamics) errors.push(`Movement ${movementIndex}, Beat ${beatIndex}: Missing dynamics`);
      });
    });
    
    if (errors.length === 0) {
      valid.push(sequence.name);
    } else {
      invalid.push({ name: sequence.name, errors });
    }
  }
  
  return { valid, invalid };
}
