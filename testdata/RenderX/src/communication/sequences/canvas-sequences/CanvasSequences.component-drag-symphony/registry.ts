/**
 * Canvas Component Drag Handler Registry
 *
 * 🎯 Handler Registration Implementation for Canvas Component Drag Symphony No. 4
 * Registers all Canvas component drag handlers with the EventBus.
 */

import { eventBus } from '../../../EventBus';
import { CANVAS_COMPONENT_DRAG_HANDLERS } from './handlers';

// Store unsubscribe functions for proper cleanup
const unsubscribeFunctions = new Map<string, () => void>();

/**
 * Register Canvas Component Drag Handlers
 * Registers all handlers with the EventBus for proper event handling
 */
export const registerCanvasComponentDragHandlers = (): {
    registeredCount: number;
    totalHandlers: number;
    registrationResults: Array<{ eventName: string; status: string; error?: string }>;
} => {
    console.log('🎼 Registering Canvas Component Drag handlers...');

    let registeredCount = 0;
    const registrationResults: Array<{ eventName: string; status: string; error?: string }> = [];

    Object.entries(CANVAS_COMPONENT_DRAG_HANDLERS).forEach(([eventName, handler]) => {
        try {
            // Use RenderX EventBus subscribe pattern
            const unsubscribe = eventBus.subscribe(eventName, handler);
            unsubscribeFunctions.set(eventName, unsubscribe);
            console.log(`✅ Registered handler for: ${eventName}`);
            registrationResults.push({ eventName, status: 'success' });
            registeredCount++;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error(`❌ Failed to register handler for ${eventName}:`, error);
            registrationResults.push({ eventName, status: 'failed', error: errorMessage });
        }
    });

    console.log(`🎼 Canvas Component Drag handlers registered: ${registeredCount}/${Object.keys(CANVAS_COMPONENT_DRAG_HANDLERS).length}`);

    return { 
        registeredCount, 
        totalHandlers: Object.keys(CANVAS_COMPONENT_DRAG_HANDLERS).length, 
        registrationResults 
    };
};

/**
 * Unregister Canvas Component Drag Handlers
 * Cleans up all registered handlers
 */
export const unregisterCanvasComponentDragHandlers = (): void => {
    console.log('🎼 Unregistering Canvas Component Drag handlers...');
    
    unsubscribeFunctions.forEach((unsubscribe, eventName) => {
        try {
            unsubscribe();
            console.log(`✅ Unregistered handler for: ${eventName}`);
        } catch (error) {
            console.error(`❌ Failed to unregister handler for ${eventName}:`, error);
        }
    });
    
    unsubscribeFunctions.clear();
    console.log('🎼 Canvas Component Drag handlers unregistered');
};

/**
 * Canvas Component Drag handler registry metadata
 */
export const CANVAS_COMPONENT_DRAG_REGISTRY_METADATA = {
  version: '1.0.0',
  component: 'Canvas',
  symphony: 'Canvas Component Drag Symphony No. 4',
  totalHandlers: Object.keys(CANVAS_COMPONENT_DRAG_HANDLERS).length,
  handlerEvents: Object.keys(CANVAS_COMPONENT_DRAG_HANDLERS),
  registrationRequired: true,
  description: 'Canvas component drag handler registry for dynamic element movement operations'
};
