/**
 * Canvas Component Drag - Processing Logic
 * Beat 2: Element Movement Processing
 */

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

interface Position {
  x: number;
  y: number;
}

/**
 * Snap to grid utility function
 */
const snapToGrid = (position: Position, gridSize: number = 20): Position => {
  return {
    x: Math.round(position.x / gridSize) * gridSize,
    y: Math.round(position.y / gridSize) * gridSize
  };
};

/**
 * Process Element Drag
 * Beat: 2 - CANVAS_ELEMENT_MOVED
 */
export const processElementDrag = (
    elementId: string, 
    changes: any, 
    source: string, 
    elements: Element[], 
    setElements?: (updater: (prev: any[]) => any[]) => void
): boolean => {
    console.log('🎯 ComponentDrag Logic: Process Element Drag');
    
    try {
        // Find the element being dragged
        const element = elements.find(el => el.id === elementId);
        if (!element) {
            console.warn('🎯 ComponentDrag Logic: Element not found for drag processing:', elementId);
            return false;
        }

        // Calculate new position
        let newX = changes.x !== undefined ? changes.x : element.x || 0;
        let newY = changes.y !== undefined ? changes.y : element.y || 0;

        // Apply grid snapping if enabled
        if (changes.snapToGrid) {
            const snapped = snapToGrid({ x: newX, y: newY }, changes.gridSize || 20);
            newX = snapped.x;
            newY = snapped.y;
        }

        // Handle different element types
        const updatedElement = { ...element };
        
        if (element.type === 'line') {
            // For lines, update both start and end points
            const deltaX = newX - (element.x1 || 0);
            const deltaY = newY - (element.y1 || 0);
            
            updatedElement.x1 = newX;
            updatedElement.y1 = newY;
            updatedElement.x2 = (element.x2 || 0) + deltaX;
            updatedElement.y2 = (element.y2 || 0) + deltaY;
        } else {
            // For other elements, update x and y
            updatedElement.x = newX;
            updatedElement.y = newY;
        }

        // Update elements array if setElements is provided
        if (setElements) {
            setElements(prevElements => 
                prevElements.map(el => 
                    el.id === elementId ? updatedElement : el
                )
            );
        }

        console.log('🎯 ComponentDrag Logic: Element drag processing successful');
        return true;

    } catch (error) {
        console.error('🎯 ComponentDrag Logic: Element drag processing failed:', error);
        return false;
    }
};

/**
 * Calculate element bounds
 */
export const calculateElementBounds = (element: Element) => {
    if (element.type === 'line') {
        return {
            left: Math.min(element.x1 || 0, element.x2 || 0),
            top: Math.min(element.y1 || 0, element.y2 || 0),
            right: Math.max(element.x1 || 0, element.x2 || 0),
            bottom: Math.max(element.y1 || 0, element.y2 || 0)
        };
    }
    
    return {
        left: element.x || 0,
        top: element.y || 0,
        right: (element.x || 0) + (element.width || 0),
        bottom: (element.y || 0) + (element.height || 0)
    };
};

/**
 * Check for element collisions
 */
export const checkElementCollisions = (draggedElement: Element, allElements: Element[]): Element[] => {
    const draggedBounds = calculateElementBounds(draggedElement);
    const collisions: Element[] = [];
    
    for (const element of allElements) {
        if (element.id === draggedElement.id) continue;
        
        const elementBounds = calculateElementBounds(element);
        
        // Check for overlap
        if (draggedBounds.left < elementBounds.right &&
            draggedBounds.right > elementBounds.left &&
            draggedBounds.top < elementBounds.bottom &&
            draggedBounds.bottom > elementBounds.top) {
            collisions.push(element);
        }
    }
    
    return collisions;
};
