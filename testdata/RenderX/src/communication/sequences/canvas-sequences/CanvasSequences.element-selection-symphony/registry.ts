/**
 * Canvas Element Selection Symphony - Handler Registry
 * 
 * Registry for Canvas Element Selection Symphony No. 37 event handlers.
 * Registers handlers with the musical conductor and manages handler lifecycle.
 * 
 * @version 1.0.0
 * @author RenderX Evolution Team
 * @date 2025-07-29
 */

import { CANVAS_ELEMENT_SELECTION_HANDLERS } from './handlers';
import { EVENT_TYPES } from '../../SequenceTypes';

/**
 * Canvas Element Selection Symphony Registry Metadata
 */
export const CANVAS_ELEMENT_SELECTION_REGISTRY_METADATA = {
  symphonyName: "Canvas Element Selection Symphony No. 37",
  description: "Handler registry for element selection operations",
  version: "1.0.0",
  handlerCount: Object.keys(CANVAS_ELEMENT_SELECTION_HANDLERS).length,
  eventTypes: [
    EVENT_TYPES.CANVAS_ELEMENT_SELECTED,
    EVENT_TYPES.CANVAS_SELECTION_CHANGED,
    EVENT_TYPES.ACTIVATE_VISUAL_TOOLS,
    EVENT_TYPES.CANVAS_STATE_CHANGED
  ],
  registrationStatus: 'pending'
};

/**
 * Register Canvas Element Selection Symphony Handlers
 */
export function registerCanvasElementSelectionHandlers(
  conductor: any,
  eventBus: any
): {
  success: boolean;
  registeredHandlers: string[];
  failedHandlers: Array<{ eventType: string; error: string }>;
} {
  console.log('🎼 Registering Canvas Element Selection Symphony handlers...');
  
  const registeredHandlers: string[] = [];
  const failedHandlers: Array<{ eventType: string; error: string }> = [];
  
  for (const [eventType, handler] of Object.entries(CANVAS_ELEMENT_SELECTION_HANDLERS)) {
    try {
      eventBus.subscribe(eventType, handler);
      registeredHandlers.push(eventType);
      console.log(`✅ Registered handler for: ${eventType}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      failedHandlers.push({ eventType, error: errorMessage });
      console.error(`❌ Failed to register handler for ${eventType}:`, error);
    }
  }
  
  CANVAS_ELEMENT_SELECTION_REGISTRY_METADATA.registrationStatus = 
    failedHandlers.length === 0 ? 'complete' : 'partial';
  
  const success = failedHandlers.length === 0;
  console.log(`🎼 Canvas Element Selection Symphony handler registration ${success ? 'completed' : 'completed with errors'}`);
  
  return { success, registeredHandlers, failedHandlers };
}
