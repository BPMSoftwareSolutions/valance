/**
 * Canvas Component Drag - onDragging Handler
 * Beat 2: Element Movement Processing
 */

import { processElementDrag } from '../logic/dragProcessing';

interface DraggingData {
    elementId: string;
    changes: any;
    source: string;
    elements: any[];
    setElements?: (updater: (prev: any[]) => any[]) => void;
    capturedElement?: any;
    syncElementCSS?: (element: any, cssData: any) => void;
}

/**
 * Handle Canvas Element Moved (During Drag)
 * Beat 2 handler for CANVAS_ELEMENT_MOVED
 */
export const handleCanvasElementMoved = (data: DraggingData): boolean => {
    console.log('🎼 ComponentDrag Handler: Canvas Element Moved', data);

    try {
        const { elementId, changes, source, elements, setElements } = data;

        // Check if this event is meant for Component Drag Symphony
        if (!elementId || !changes || !source) {
            console.log('🎼 ComponentDrag Handler: Canvas Element Moved - Not a component drag event, skipping');
            return true;
        }

        const result = processElementDrag(elementId, changes, source, elements, setElements);
        console.log('🎼 ComponentDrag Handler: Canvas Element Moved completed successfully');
        return result;
    } catch (error) {
        console.error('🎼 ComponentDrag Handler: Canvas Element Moved failed:', error);
        return false;
    }
};

export default handleCanvasElementMoved;
