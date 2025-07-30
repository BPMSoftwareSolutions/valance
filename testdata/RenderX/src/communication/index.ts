/**
 * Communication System Exports
 * 
 * Central export point for all communication-related components
 * including EventBus, Musical Conductor, and sequence types.
 */

// EventBus exports
export {
  EventBus,
  ConductorEventBus,
  eventBus,
  type EventCallback,
  type UnsubscribeFunction,
  type EventSubscription,
  type EventDebugInfo
} from './EventBus';

// Event Types exports
export {
  EVENT_TYPES,
  EVENT_CATEGORIES,
  CORE_EVENT_TYPES,
  CANVAS_EVENT_TYPES,
  CONTROL_PANEL_EVENT_TYPES,
  LAYOUT_EVENT_TYPES,
  ELEMENT_LIBRARY_EVENT_TYPES,
  getEventCategory,
  getEventsByCategory,
  type EventType,
  type EventCategory,
  type CoreEventType,
  type CanvasEventType,
  type ControlPanelEventType,
  type LayoutEventType,
  type ElementLibraryEventType
} from './event-types';

// Musical Conductor exports
export {
  MusicalConductor
} from './sequences/MusicalConductor';

// Import MusicalConductor and sequences for internal use
import { MusicalConductor } from './sequences/MusicalConductor';
import { initializeMusicalSequences } from './sequences';
import { eventBus as internalEventBus, ConductorEventBus } from './EventBus';

// Musical Sequences exports
export {
  MusicalSequences,
  ALL_SEQUENCES,
  SEQUENCE_NAMES,
  registerAllSequences,
  initializeMusicalSequences,
  getSequenceByName,
  getSequencesByCategory,
  validateAllSequences,
  startJsonComponentLoadingFlow,
  startJsonComponentErrorFlow,
  startPanelToggleFlow,
  startLayoutModeChangeFlow
} from './sequences';

// Sequence Types imports for internal use
import {
  MUSICAL_CONDUCTOR_EVENT_TYPES
} from './sequences/SequenceTypes';

// Sequence Types exports
export {
  MUSICAL_DYNAMICS,
  MUSICAL_TIMING,
  SEQUENCE_CATEGORIES,
  MUSICAL_CONDUCTOR_EVENT_TYPES,
  MUSICAL_SEQUENCE_TEMPLATE,
  SEQUENCE_PRIORITIES,
  type MusicalDynamic,
  type MusicalTiming,
  type SequenceCategory,
  type SequenceBeat,
  type SequenceMovement,
  type MusicalSequence,
  type SequenceExecutionContext,
  type ConductorStatistics,
  type SequenceRequest,
  type SequencePriority,
  type MusicalConductorEventType
} from './sequences/SequenceTypes';

/**
 * Set up beat execution logging
 * Listens to BEAT_STARTED and BEAT_COMPLETED events for detailed logging
 */
function setupBeatExecutionLogging(eventBus: ConductorEventBus): void {
  console.log('🎼 Setting up beat execution logging...');

  // Listen for beat started events
  eventBus.subscribe(MUSICAL_CONDUCTOR_EVENT_TYPES.BEAT_STARTED, (data: any) => {
    console.log(`🎵 Beat ${data.beat} Started: ${data.title || 'No title'} (${data.event}) - ${data.sequenceName}`);
  });

  // Listen for beat completed events
  eventBus.subscribe(MUSICAL_CONDUCTOR_EVENT_TYPES.BEAT_COMPLETED, (data: any) => {
    console.log(`🎵 Beat ${data.beat} Completed: ${data.event} - ${data.sequenceName}`);
  });

  // Listen for sequence started events
  eventBus.subscribe(MUSICAL_CONDUCTOR_EVENT_TYPES.SEQUENCE_STARTED, (data: any) => {
    console.log(`🎼 Sequence Started: ${data.sequenceName} (ID: ${data.requestId})`);
  });

  // Listen for sequence completed events
  eventBus.subscribe(MUSICAL_CONDUCTOR_EVENT_TYPES.SEQUENCE_COMPLETED, (data: any) => {
    console.log(`🎼 Sequence Completed: ${data.sequenceName} (${data.executionTime.toFixed(2)}ms, ${data.beatsExecuted} beats, ${data.errors} errors)`);
  });

  console.log('✅ Beat execution logging set up successfully');
}

/**
 * Initialize Communication System
 * Sets up the EventBus and Musical Conductor integration with all sequences
 */
export function initializeCommunicationSystem(): {
  eventBus: ConductorEventBus;
  conductor: MusicalConductor;
  sequenceResults: ReturnType<typeof initializeMusicalSequences>;
} {
  console.log('🎼 Initializing RenderX Evolution Communication System...');

  // Create musical conductor with the internal eventBus
  const conductor = new MusicalConductor(internalEventBus);

  // Connect eventBus to the conductor for unified sequence system
  (internalEventBus as ConductorEventBus).connectToMainConductor(conductor);

  // Set up beat execution logging
  setupBeatExecutionLogging(internalEventBus);

  // Initialize and register all musical sequences
  const sequenceResults = initializeMusicalSequences(conductor);

  console.log('✅ Communication System initialized successfully');
  console.log(`🎼 Registered ${sequenceResults.registeredSequences} musical sequences`);

  if (sequenceResults.validationResults.invalid.length > 0) {
    console.warn('⚠️ Some sequences have validation issues:', sequenceResults.validationResults.invalid);
  }

  return {
    eventBus: internalEventBus as ConductorEventBus,
    conductor,
    sequenceResults
  };
}

/**
 * Communication System Status
 * Provides status information about the communication system
 */
export function getCommunicationSystemStatus(): {
  eventBus: {
    debugInfo: any;
    metrics: any;
  };
  conductor: {
    statistics: any;
    queueStatus: any;
    sequenceCount: number;
  };
} {
  const conductor = new MusicalConductor(internalEventBus); // Temporary instance for status

  return {
    eventBus: {
      debugInfo: internalEventBus.getDebugInfo(),
      metrics: (internalEventBus as ConductorEventBus).getMetrics()
    },
    conductor: {
      statistics: conductor.getStatistics(),
      queueStatus: conductor.getQueueStatus(),
      sequenceCount: conductor.getSequenceNames().length
    }
  };
}
