/**
 * JSON Component Loading Musical Sequence
 * 
 * Handles the complete JSON component loading process through proper musical sequence architecture.
 * Replaces direct event emissions with orchestrated sequence beats.
 * 
 * Following the anti-pattern resolution strategy from:
 * tools/docs/01-ARCHITECTURE/01-arch-canvas-anti-pattern-resolution-implementation-strategy.md
 */

import type {
  MusicalSequence
} from '../SequenceTypes';
import {
  SEQUENCE_CATEGORIES,
  MUSICAL_DYNAMICS,
  MUSICAL_TIMING,
  EVENT_TYPES
} from '../SequenceTypes';
import { ELEMENT_LIBRARY_EVENT_TYPES } from '../../event-types';

/**
 * JSON Component Loading Symphony No. 1
 * Complete musical sequence for loading JSON components from public/json-components folder
 */
export const JSON_COMPONENT_LOADING_SEQUENCE: MusicalSequence = {
  name: "JSON Component Loading Symphony No. 1",
  description: "Orchestrates the complete JSON component loading process through musical sequence beats",
  key: "C Major",
  tempo: 120,
  timeSignature: "4/4",
  category: SEQUENCE_CATEGORIES.COMPONENT_UI,
  movements: [
    {
      name: "Component Discovery Movement",
      description: "Discovers and validates JSON component files",
      beats: [
        {
          beat: 1,
          event: ELEMENT_LIBRARY_EVENT_TYPES.COMPONENT_LOADING_STARTED,
          title: "Initiate Component Loading",
          description: "Starts the JSON component loading process",
          dynamics: MUSICAL_DYNAMICS.FORTE,
          timing: MUSICAL_TIMING.IMMEDIATE,
          data: {
            phase: 'discovery',
            operation: 'component-loading-start'
          },
          errorHandling: 'continue'
        },
        {
          beat: 2,
          event: ELEMENT_LIBRARY_EVENT_TYPES.COMPONENT_LOADING_COMPLETED,
          title: "Component Discovery Complete",
          description: "Completes the component file discovery phase",
          dynamics: MUSICAL_DYNAMICS.MEZZO_FORTE,
          timing: MUSICAL_TIMING.AFTER_BEAT,
          data: {
            phase: 'discovery-complete',
            operation: 'file-scan-complete'
          },
          dependencies: [ELEMENT_LIBRARY_EVENT_TYPES.COMPONENT_LOADING_STARTED],
          errorHandling: 'continue'
        }
      ]
    },
    {
      name: "Component Validation Movement",
      description: "Validates and processes discovered JSON components",
      beats: [
        {
          beat: 3,
          event: ELEMENT_LIBRARY_EVENT_TYPES.JSON_COMPONENT_VALIDATED,
          title: "Validate Component Structure",
          description: "Validates JSON component structure and metadata",
          dynamics: MUSICAL_DYNAMICS.MEZZO_FORTE,
          timing: MUSICAL_TIMING.IMMEDIATE,
          data: {
            phase: 'validation',
            operation: 'structure-validation'
          },
          dependencies: [ELEMENT_LIBRARY_EVENT_TYPES.COMPONENT_LOADING_COMPLETED],
          errorHandling: 'continue'
        },
        {
          beat: 4,
          event: ELEMENT_LIBRARY_EVENT_TYPES.JSON_COMPONENT_LOADED,
          title: "Component Load Complete",
          description: "Successfully loads and parses JSON component",
          dynamics: MUSICAL_DYNAMICS.FORTE,
          timing: MUSICAL_TIMING.AFTER_BEAT,
          data: {
            phase: 'loading-complete',
            operation: 'component-parsed'
          },
          dependencies: [ELEMENT_LIBRARY_EVENT_TYPES.JSON_COMPONENT_VALIDATED],
          errorHandling: 'continue'
        }
      ]
    },
    {
      name: "Component Registration Movement",
      description: "Registers loaded components with the element library",
      beats: [
        {
          beat: 5,
          event: ELEMENT_LIBRARY_EVENT_TYPES.JSON_COMPONENT_REGISTERED,
          title: "Register Component",
          description: "Registers the loaded component with the element library system",
          dynamics: MUSICAL_DYNAMICS.FORTE,
          timing: MUSICAL_TIMING.IMMEDIATE,
          data: {
            phase: 'registration',
            operation: 'component-registration'
          },
          dependencies: [ELEMENT_LIBRARY_EVENT_TYPES.JSON_COMPONENT_LOADED],
          errorHandling: 'continue'
        },
        {
          beat: 6,
          event: EVENT_TYPES.COMPONENT_UPDATED,
          title: "Update Element Library UI",
          description: "Updates the element library UI to display the new component",
          dynamics: MUSICAL_DYNAMICS.MEZZO_PIANO,
          timing: MUSICAL_TIMING.AFTER_BEAT,
          data: {
            phase: 'ui-update',
            operation: 'library-refresh'
          },
          dependencies: [ELEMENT_LIBRARY_EVENT_TYPES.JSON_COMPONENT_REGISTERED],
          errorHandling: 'continue'
        }
      ]
    }
  ],
  metadata: {
    version: "1.0.0",
    author: "RenderX Evolution System",
    created: new Date(),
    tags: ["json-components", "element-library", "loading", "validation"]
  }
};

/**
 * JSON Component Loading Error Handling Symphony No. 2
 * Handles errors during JSON component loading process
 */
export const JSON_COMPONENT_ERROR_SEQUENCE: MusicalSequence = {
  name: "JSON Component Error Handling Symphony No. 2",
  description: "Handles errors and failures during JSON component loading",
  key: "D Minor",
  tempo: 100,
  timeSignature: "4/4",
  category: SEQUENCE_CATEGORIES.SYSTEM_EVENTS,
  movements: [
    {
      name: "Error Processing Movement",
      description: "Processes and handles component loading errors",
      beats: [
        {
          beat: 1,
          event: ELEMENT_LIBRARY_EVENT_TYPES.COMPONENT_LOADING_FAILED,
          title: "Component Loading Failed",
          description: "Handles component loading failure with proper error reporting",
          dynamics: MUSICAL_DYNAMICS.FORTE,
          timing: MUSICAL_TIMING.IMMEDIATE,
          data: {
            phase: 'error-handling',
            operation: 'loading-failure'
          },
          errorHandling: 'continue'
        },
        {
          beat: 2,
          event: EVENT_TYPES.SYSTEM_ERROR,
          title: "System Error Notification",
          description: "Notifies the system of the component loading error",
          dynamics: MUSICAL_DYNAMICS.MEZZO_FORTE,
          timing: MUSICAL_TIMING.AFTER_BEAT,
          data: {
            phase: 'error-notification',
            operation: 'system-notification'
          },
          dependencies: [ELEMENT_LIBRARY_EVENT_TYPES.COMPONENT_LOADING_FAILED],
          errorHandling: 'continue'
        }
      ]
    }
  ],
  metadata: {
    version: "1.0.0",
    author: "RenderX Evolution System",
    created: new Date(),
    tags: ["error-handling", "json-components", "failure-recovery"]
  }
};

/**
 * Convenience Functions for JSON Component Loading Sequences
 * Following the anti-pattern resolution strategy pattern
 */

/**
 * Start JSON Component Loading Flow
 * Replaces direct event emissions with proper musical sequence orchestration
 *
 * @param conductor - The musical conductor instance
 * @param componentFiles - Array of component files to load
 * @param options - Loading options and configuration
 * @returns Promise with sequence execution ID
 */
export const startJsonComponentLoadingFlow = (
  conductor: any,
  componentFiles: string[],
  options: {
    validateStructure?: boolean;
    autoRegister?: boolean;
    errorHandling?: 'continue' | 'abort';
  } = {}
): string => {
  return conductor.startSequence('JSON Component Loading Symphony No. 1', {
    componentFiles,
    options,
    timestamp: Date.now(),
    sequenceId: `json-loading-${Date.now()}`,
    context: {
      source: 'element-library',
      operation: 'json-component-loading',
      phase: 'initialization'
    }
  });
};

/**
 * Start JSON Component Error Handling Flow
 * Handles errors during component loading through musical sequence
 * 
 * @param conductorEventBus - The conductor event bus instance
 * @param error - The error that occurred
 * @param context - Error context information
 * @returns Promise with sequence execution ID
 */
export const startJsonComponentErrorFlow = (
  conductor: any,
  error: Error,
  errorContext: {
    filename?: string;
    phase?: string;
    operation?: string;
  } = {}
): string => {
  return conductor.startSequence('JSON Component Error Handling Symphony No. 2', {
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name
    },
    errorContext,
    timestamp: Date.now(),
    sequenceId: `json-error-${Date.now()}`,
    context: {
      source: 'element-library',
      operation: 'error-handling',
      phase: 'error-processing'
    }
  });
};

/**
 * Register JSON Component Loading Sequences with Conductor
 * Ensures sequences are properly registered before being called
 *
 * @param conductor - The musical conductor instance
 */
export const registerJsonComponentLoadingSequences = (conductor: any): void => {
  if (!conductor) {
    console.warn('🚨 JSON Component Loading: No conductor provided for registration');
    return;
  }

  console.log('🎼 Registering JSON Component Loading Musical Sequences');

  // Register both sequences with proper sequence names matching the startSequence calls
  conductor.registerSequence(JSON_COMPONENT_LOADING_SEQUENCE);
  conductor.registerSequence(JSON_COMPONENT_ERROR_SEQUENCE);

  console.log('✅ JSON Component Loading sequences registered successfully');
};

// Auto-register sequences when this module is imported (for validation purposes)
// Note: This will be overridden by the main registration system
if (typeof window !== 'undefined' && (window as any).renderxConductor) {
  registerJsonComponentLoadingSequences((window as any).renderxConductor);
}
