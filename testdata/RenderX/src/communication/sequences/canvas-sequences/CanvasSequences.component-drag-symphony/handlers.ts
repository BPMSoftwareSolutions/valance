/**
 * Canvas Component Drag Handlers
 *
 * 🎯 Handler Implementation for Canvas Component Drag Symphony No. 4
 * Provides event handlers for dynamic element dragging operations.
 */

import { 
    validateDragContext,
    processElementDrag,
    coordinateDragState,
    syncDragChanges
} from './business-logic';

// Types for handler data
interface HandlerData {
    elementId: string;
    changes: any;
    source: string;
    elements: any[];
    dragData?: any;
    setElements?: (updater: (prev: any[]) => any[]) => void;
    capturedElement?: any;
    syncElementCSS?: (element: any, cssData: any) => void;
}

/**
 * Handle Canvas Drag Over
 * Beat 1 handler for CANVAS_DRAG_OVER
 */
export const handleCanvasDragOver = (data: HandlerData): boolean => {
    console.log('🎼 Handler: Canvas Drag Over', data);

    try {
        const { elementId, changes, source, elements } = data;

        // Check if this event is meant for Component Drag Symphony
        if (!elementId || !changes || !source) {
            console.log('🎼 Handler: Canvas Drag Over - Not a component drag event, skipping');
            return true;
        }

        const result = validateDragContext(elementId, changes, source, elements);
        console.log('🎼 Handler: Canvas Drag Over completed successfully');
        return result;
    } catch (error) {
        console.error('🎼 Handler: Canvas Drag Over failed:', error);
        return false;
    }
};

/**
 * Handle Canvas Element Moved
 * Beat 2 handler for CANVAS_ELEMENT_MOVED
 */
export const handleCanvasElementMoved = async (data: HandlerData): Promise<any> => {
    console.log('🎼 Handler: Canvas Element Moved', data);

    try {
        const { elementId, changes, source, elements, setElements } = data;

        // Check if this event is meant for Component Drag Symphony
        if (!elementId || !changes || !source) {
            console.log('🎼 Handler: Canvas Element Moved - Not a component drag event, skipping');
            return null;
        }

        if (!setElements) {
            console.warn('🎼 Handler: Canvas Element Moved - setElements function missing, skipping');
            return null;
        }

        const result = await processElementDrag(elementId, changes, source, elements, setElements);
        console.log('🎼 Handler: Canvas Element Moved completed successfully');
        return result;
    } catch (error) {
        console.error('🎼 Handler: Canvas Element Moved failed:', error);
        return null;
    }
};

/**
 * Handle Canvas Drop Validation
 * Beat 3 handler for CANVAS_DROP_VALIDATION
 */
export const handleCanvasDropValidation = (data: HandlerData): boolean => {
    console.log('🎼 Component Drag Handler: Canvas Drop Validation', data);

    try {
        const { elementId, changes, source, elements, dragData } = data;

        // Check if this event is meant for Component Drag Symphony
        // If elementId is missing, this is likely from Library Drop Symphony
        if (!elementId || !changes || !source) {
            console.log('🎼 Component Drag Handler: Not a component drag event, skipping');
            return true; // Return true to not block other handlers
        }

        // If this has dragData but no elementId, it's likely a library drop event
        if (dragData && !elementId) {
            console.log('🎼 Component Drag Handler: Library drop event detected, skipping');
            return true; // Return true to not block other handlers
        }

        const result = coordinateDragState(elementId, changes, source, elements);
        console.log('🎼 Handler: Canvas Drop Validation completed successfully');
        return result;
    } catch (error) {
        console.error('🎼 Handler: Canvas Drop Validation failed:', error);
        // Don't throw error to avoid blocking other handlers
        return false;
    }
};

/**
 * Handle Canvas Drop
 * Beat 4 handler for CANVAS_DROP
 */
export const handleCanvasDrop = (data: HandlerData): boolean => {
    console.log('🎼 Handler: Canvas Drop', data);

    try {
        const { elementId, changes, source, capturedElement, syncElementCSS } = data;
        const result = syncDragChanges(elementId, changes, source, capturedElement, syncElementCSS);
        console.log('🎼 Handler: Canvas Drop completed successfully');
        return result;
    } catch (error) {
        console.error('🎼 Handler: Canvas Drop failed:', error);
        throw error;
    }
};

/**
 * Canvas Component Drag Handlers Export
 * Maps event names to their corresponding handler functions
 */
export const CANVAS_COMPONENT_DRAG_HANDLERS = {
    'canvas-drag-over': handleCanvasDragOver,
    'canvas-element-moved': handleCanvasElementMoved,
    'canvas-drop-validation': handleCanvasDropValidation,
    'canvas-drop': handleCanvasDrop
};
