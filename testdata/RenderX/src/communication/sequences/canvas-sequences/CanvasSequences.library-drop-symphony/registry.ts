/**
 * Canvas Library Drop Symphony - Handler Registry
 * 
 * Registry for Canvas Library Drop Symphony No. 33 event handlers.
 * Registers handlers with the musical conductor and manages handler lifecycle.
 * 
 * @version 1.0.0
 * @author RenderX Evolution Team
 * @date 2025-07-29
 */

import { CANVAS_LIBRARY_DROP_HANDLERS } from './handlers';
import { EVENT_TYPES } from '../../SequenceTypes';

/**
 * Canvas Library Drop Symphony Registry Metadata
 * 
 * Metadata about the handler registry for the Canvas Library Drop Symphony.
 */
export const CANVAS_LIBRARY_DROP_REGISTRY_METADATA = {
  symphonyName: "Canvas Library Drop Symphony No. 33",
  description: "Handler registry for library drop operations",
  version: "1.0.0",
  handlerCount: Object.keys(CANVAS_LIBRARY_DROP_HANDLERS).length,
  eventTypes: [
    EVENT_TYPES.CANVAS_DROP_VALIDATION,
    EVENT_TYPES.LIBRARY_DRAG_ENDED,
    EVENT_TYPES.CANVAS_ELEMENT_CREATED,
    EVENT_TYPES.DROP_ZONE_CLEANUP
  ],
  registrationStatus: 'pending'
};

/**
 * Register Canvas Library Drop Symphony Handlers
 * 
 * Registers all event handlers for the Canvas Library Drop Symphony with the conductor.
 * This function should be called during application initialization.
 * 
 * @param conductor - The musical conductor instance
 * @param eventBus - The event bus instance
 * @returns Registration results
 */
export function registerCanvasLibraryDropHandlers(
  conductor: any,
  eventBus: any
): {
  success: boolean;
  registeredHandlers: string[];
  failedHandlers: Array<{ eventType: string; error: string }>;
} {
  console.log('🎼 Registering Canvas Library Drop Symphony handlers...');
  
  const registeredHandlers: string[] = [];
  const failedHandlers: Array<{ eventType: string; error: string }> = [];
  
  // Register each handler with the event bus
  for (const [eventType, handler] of Object.entries(CANVAS_LIBRARY_DROP_HANDLERS)) {
    try {
      // Register handler with event bus
      eventBus.subscribe(eventType, handler);
      registeredHandlers.push(eventType);
      console.log(`✅ Registered handler for: ${eventType}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      failedHandlers.push({ eventType, error: errorMessage });
      console.error(`❌ Failed to register handler for ${eventType}:`, error);
    }
  }
  
  // Update registry metadata
  CANVAS_LIBRARY_DROP_REGISTRY_METADATA.registrationStatus = 
    failedHandlers.length === 0 ? 'complete' : 'partial';
  
  const success = failedHandlers.length === 0;
  console.log(`🎼 Canvas Library Drop Symphony handler registration ${success ? 'completed' : 'completed with errors'}`);
  console.log(`📊 Registered: ${registeredHandlers.length}, Failed: ${failedHandlers.length}`);
  
  return {
    success,
    registeredHandlers,
    failedHandlers
  };
}

/**
 * Unregister Canvas Library Drop Symphony Handlers
 * 
 * Unregisters all event handlers for the Canvas Library Drop Symphony.
 * This function should be called during application cleanup.
 * 
 * @param eventBus - The event bus instance
 * @returns Unregistration results
 */
export function unregisterCanvasLibraryDropHandlers(
  eventBus: any
): {
  success: boolean;
  unregisteredHandlers: string[];
  failedHandlers: Array<{ eventType: string; error: string }>;
} {
  console.log('🎼 Unregistering Canvas Library Drop Symphony handlers...');
  
  const unregisteredHandlers: string[] = [];
  const failedHandlers: Array<{ eventType: string; error: string }> = [];
  
  // Unregister each handler from the event bus
  for (const [eventType, handler] of Object.entries(CANVAS_LIBRARY_DROP_HANDLERS)) {
    try {
      // Unregister handler from event bus
      eventBus.unsubscribe(eventType, handler);
      unregisteredHandlers.push(eventType);
      console.log(`✅ Unregistered handler for: ${eventType}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      failedHandlers.push({ eventType, error: errorMessage });
      console.error(`❌ Failed to unregister handler for ${eventType}:`, error);
    }
  }
  
  // Update registry metadata
  CANVAS_LIBRARY_DROP_REGISTRY_METADATA.registrationStatus = 'unregistered';
  
  const success = failedHandlers.length === 0;
  console.log(`🎼 Canvas Library Drop Symphony handler unregistration ${success ? 'completed' : 'completed with errors'}`);
  console.log(`📊 Unregistered: ${unregisteredHandlers.length}, Failed: ${failedHandlers.length}`);
  
  return {
    success,
    unregisteredHandlers,
    failedHandlers
  };
}

/**
 * Get Handler Registration Status
 * 
 * Returns the current registration status of Canvas Library Drop Symphony handlers.
 * 
 * @returns Registration status information
 */
export function getCanvasLibraryDropHandlerStatus(): {
  symphonyName: string;
  registrationStatus: string;
  handlerCount: number;
  eventTypes: string[];
} {
  return {
    symphonyName: CANVAS_LIBRARY_DROP_REGISTRY_METADATA.symphonyName,
    registrationStatus: CANVAS_LIBRARY_DROP_REGISTRY_METADATA.registrationStatus,
    handlerCount: CANVAS_LIBRARY_DROP_REGISTRY_METADATA.handlerCount,
    eventTypes: [...CANVAS_LIBRARY_DROP_REGISTRY_METADATA.eventTypes]
  };
}

/**
 * Validate Handler Registration
 * 
 * Validates that all required handlers are properly registered.
 * 
 * @param eventBus - The event bus instance
 * @returns Validation results
 */
export function validateCanvasLibraryDropHandlerRegistration(
  eventBus: any
): {
  isValid: boolean;
  missingHandlers: string[];
  registeredHandlers: string[];
} {
  const missingHandlers: string[] = [];
  const registeredHandlers: string[] = [];
  
  for (const eventType of CANVAS_LIBRARY_DROP_REGISTRY_METADATA.eventTypes) {
    // Check if handler is registered (this would depend on the event bus implementation)
    const hasHandler = eventBus.listenerCount && eventBus.listenerCount(eventType) > 0;
    
    if (hasHandler) {
      registeredHandlers.push(eventType);
    } else {
      missingHandlers.push(eventType);
    }
  }
  
  return {
    isValid: missingHandlers.length === 0,
    missingHandlers,
    registeredHandlers
  };
}
