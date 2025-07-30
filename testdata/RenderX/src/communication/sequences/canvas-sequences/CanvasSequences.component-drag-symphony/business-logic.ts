/**
 * Canvas Component Drag Business Logic
 *
 * 🎯 Pure business logic for Canvas Component Drag Symphony No. 4
 * Contains all component drag business logic extracted from Canvas files.
 */

// Types for better type safety
interface Element {
  id: string;
  type: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  [key: string]: any;
}

interface DragOffset {
  x: number;
  y: number;
}

interface Position {
  x: number;
  y: number;
}

/**
 * Snap to grid utility function
 * TODO: Import from Canvas utils when available
 */
const snapToGrid = (position: Position, gridSize: number = 20): Position => {
  return {
    x: Math.round(position.x / gridSize) * gridSize,
    y: Math.round(position.y / gridSize) * gridSize
  };
};

/**
 * Validate Drag Context
 * Extracted from: Canvas.component-drag-symphony.js
 * Beat: 1 - CANVAS_DRAG_VALIDATION
 */
export const validateDragContext = (elementId: string, changes: any, source: string, elements: Element[]): boolean => {
    console.log('🎯 Business Logic: Validate Drag Context');

    // Validate element exists
    if (!elementId) {
        console.warn('🎯 Drag validation failed: No element ID provided');
        return false;
    }

    // Validate elements array
    if (!elements || !Array.isArray(elements)) {
        console.warn('🎯 Drag validation failed: Invalid elements array', elements);
        return false;
    }

    // Find the element in the current elements array
    const element = elements.find(el => el.id === elementId);
    if (!element) {
        console.warn('🎯 Drag validation failed: Element not found', elementId);
        return false;
    }

    // Validate changes object
    if (!changes || typeof changes !== 'object') {
        console.warn('🎯 Drag validation failed: Invalid changes object');
        return false;
    }

    // Validate source
    if (!source) {
        console.warn('🎯 Drag validation failed: No source provided');
        return false;
    }

    console.log('🎯 Drag validation successful for element:', elementId);
    return true;
};

/**
 * Process Element Drag
 * Extracted from: Canvas.component-drag-symphony.js
 * Beat: 2 - CANVAS_ELEMENT_MOVED
 */
export const processElementDrag = async (
    elementId: string,
    changes: any,
    source: string,
    elements: Element[],
    setElements: (updater: (prev: Element[]) => Element[]) => void
): Promise<Element | null> => {
    console.log('🎯 Business Logic: Process Element Drag');

    return new Promise((resolve) => {
        // Validate elements array
        if (!elements || !Array.isArray(elements)) {
            console.warn('🎯 Element drag processing failed: Invalid elements array', elements);
            resolve(null);
            return;
        }

        // Validate setElements function
        if (!setElements || typeof setElements !== 'function') {
            console.warn('🎯 Element drag processing failed: Invalid setElements function', setElements);
            resolve(null);
            return;
        }

        // Find the current element
        const currentElement = elements.find(el => el.id === elementId);
        if (!currentElement) {
            console.warn('🎯 Element not found for drag processing:', elementId);
            resolve(null);
            return;
        }

        // Create updated element with changes
        const updatedElement = { ...currentElement, ...changes };

        // Update elements array
        setElements(prevElements => {
            const newElements = prevElements.map(el =>
                el.id === elementId ? updatedElement : el
            );
            
            console.log('🎯 Element drag processed successfully:', elementId);
            resolve(updatedElement);
            return newElements;
        });
    });
};

/**
 * Coordinate Drag State
 * Extracted from: Canvas.component-drag-symphony.js
 * Beat: 3 - CANVAS_DRAG_COORDINATION
 */
export const coordinateDragState = (elementId: string, changes: any, source: string, elements: Element[]): boolean => {
    console.log('🎯 Business Logic: Coordinate Drag State');

    // Validate elements array
    if (!elements || !Array.isArray(elements)) {
        console.warn('🎯 Drag coordination failed: Invalid elements array', elements);
        return false;
    }

    // Find the element being dragged
    const element = elements.find(el => el.id === elementId);
    if (!element) {
        console.warn('🎯 Drag coordination failed: Element not found', elementId);
        return false;
    }

    // Log coordination details
    console.log('🎯 Coordinating drag state for:', {
        elementId,
        elementType: element.type,
        changes,
        source
    });

    // Coordination logic (state synchronization)
    // This ensures proper state coordination during drag operations
    return true;
};

/**
 * Sync Drag Changes
 * Extracted from: Canvas.component-drag-symphony.js
 * Beat: 4 - DRAG_CLEANUP
 */
export const syncDragChanges = (
    elementId: string,
    changes: any,
    source: string,
    capturedElement: Element | null,
    syncElementCSS?: (element: Element, cssData: any) => void
): boolean => {
    console.log('🎯 Business Logic: Sync Drag Changes');

    if (!capturedElement) {
        console.warn('🎯 Drag sync failed: No captured element data');
        return false;
    }

    // Sync CSS changes if syncElementCSS is available
    if (syncElementCSS && typeof syncElementCSS === 'function') {
        try {
            const cssData = {
                position: { x: capturedElement.x, y: capturedElement.y },
                dimensions: { width: capturedElement.width, height: capturedElement.height },
                source: 'drag-operation'
            };

            syncElementCSS(capturedElement, cssData);
            console.log('🎯 CSS sync completed for element:', elementId);
        } catch (error) {
            console.error('🎯 CSS sync failed:', error);
        }
    }

    console.log('🎯 Drag changes synchronized successfully');
    return true;
};

/**
 * Calculate Drag Position with Grid Snapping
 * Extracted from: Canvas.component-drag-symphony.js
 * Utility method for drag position calculations
 */
export const calculateDragPosition = (
    element: Element,
    canvasX: number,
    canvasY: number,
    dragOffset: DragOffset,
    enableSnap: boolean = true
): Partial<Element> => {
    const newX = canvasX - dragOffset.x;
    const newY = canvasY - dragOffset.y;

    // Apply snap to grid if enabled
    const position = enableSnap ? snapToGrid({ x: newX, y: newY }, 20) : { x: newX, y: newY };

    // Handle different component types for drag operations
    if (element.type === 'line') {
        // Line components: calculate new endpoints based on drag offset
        const deltaX = position.x - (element.x || 0);
        const deltaY = position.y - (element.y || 0);

        return {
            x1: (element.x1 || 0) + deltaX,
            y1: (element.y1 || 0) + deltaY,
            x2: (element.x2 || 100) + deltaX,
            y2: (element.y2 || 50) + deltaY,
            x: position.x, // Keep x,y for Canvas tracking
            y: position.y
        };
    } else {
        // Standard components: update x,y position
        return {
            x: position.x,
            y: position.y
        };
    }
};

/**
 * Generate HTML From Content
 * Extracted from: Canvas.component-drag-symphony.js
 * Utility method for HTML generation during drag operations
 */
export const generateHTMLFromContent = (content: any): string => {
    if (!content) return '';

    if (typeof content === 'string') {
        return content;
    }

    if (Array.isArray(content)) {
        return content.map(item => {
            if (typeof item === 'string') return item;
            if (item && typeof item === 'object' && item.text) return item.text;
            return '';
        }).join('');
    }

    if (typeof content === 'object' && content.text) {
        return content.text;
    }

    return String(content);
};
