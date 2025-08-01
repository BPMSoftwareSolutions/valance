/**
 * Canvas Component Drag - onDragStart Handler
 * Beat 1: Canvas Drag Initiation
 */

import { validateDragContext } from '../logic/dragValidation';

interface DragStartData {
    elementId: string;
    changes: any;
    source: string;
    elements: any[];
    setElements?: (updater: (prev: any[]) => any[]) => void;
    capturedElement?: any;
    syncElementCSS?: (element: any, cssData: any) => void;
}

/**
 * Handle Canvas Drag Over (Drag Start)
 * Beat 1 handler for CANVAS_DRAG_OVER
 */
export const handleCanvasDragOver = (data: DragStartData): boolean => {
    console.log('🎼 ComponentDrag Handler: Canvas Drag Over', data);

    try {
        const { elementId, changes, source, elements } = data;

        // Check if this event is meant for Component Drag Symphony
        if (!elementId || !changes || !source) {
            console.log('🎼 ComponentDrag Handler: Canvas Drag Over - Not a component drag event, skipping');
            return true;
        }

        const result = validateDragContext(elementId, changes, source, elements);
        console.log('🎼 ComponentDrag Handler: Canvas Drag Over completed successfully');
        return result;
    } catch (error) {
        console.error('🎼 ComponentDrag Handler: Canvas Drag Over failed:', error);
        return false;
    }
};

export default handleCanvasDragOver;
