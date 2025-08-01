/**
 * Canvas Component Drag - onDrop Handler
 * Beat 3 & 4: Drop Validation & CSS Synchronization
 */

import { coordinateDragState, syncDragChanges } from '../logic/dragCoordination';

interface DropData {
    elementId: string;
    changes: any;
    source: string;
    elements: any[];
    setElements?: (updater: (prev: any[]) => any[]) => void;
    capturedElement?: any;
    syncElementCSS?: (element: any, cssData: any) => void;
    dragData?: any;
}

/**
 * Handle Canvas Drop Validation
 * Beat 3 handler for CANVAS_DROP_VALIDATION
 */
export const handleCanvasDropValidation = (data: DropData): boolean => {
    console.log('🎼 ComponentDrag Handler: Canvas Drop Validation', data);

    try {
        const { elementId, changes, source, elements, dragData } = data as any;

        // Check if this event is meant for Component Drag Symphony
        // If elementId is missing, this is likely from Library Drop Symphony
        if (!elementId || !changes || !source) {
            console.log('🎼 ComponentDrag Handler: Not a component drag event, skipping');
            return true; // Return true to not block other handlers
        }

        const result = coordinateDragState(elementId, changes, source, elements, dragData);
        console.log('🎼 ComponentDrag Handler: Canvas Drop Validation completed successfully');
        return result;
    } catch (error) {
        console.error('🎼 ComponentDrag Handler: Canvas Drop Validation failed:', error);
        return false;
    }
};

/**
 * Handle Canvas Element CSS Sync
 * Beat 4 handler for CANVAS_ELEMENT_CSS_SYNC
 */
export const handleCanvasElementCSSSync = (data: DropData): boolean => {
    console.log('🎼 ComponentDrag Handler: Canvas Element CSS Sync', data);

    try {
        const { elementId, changes, source, elements, capturedElement, syncElementCSS } = data;

        // Check if this event is meant for Component Drag Symphony
        if (!elementId || !changes || !source) {
            console.log('🎼 ComponentDrag Handler: Canvas Element CSS Sync - Not a component drag event, skipping');
            return true;
        }

        const result = syncDragChanges(elementId, changes, source, elements, capturedElement, syncElementCSS);
        console.log('🎼 ComponentDrag Handler: Canvas Element CSS Sync completed successfully');
        return result;
    } catch (error) {
        console.error('🎼 ComponentDrag Handler: Canvas Element CSS Sync failed:', error);
        return false;
    }
};

export { handleCanvasDropValidation as default };
