/**
 * Canvas Component Drag - Validation Logic
 * Beat 1: Drag Context Validation
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

/**
 * Validate Drag Context
 * Extracted from: Canvas.component-drag-symphony.js
 * Beat: 1 - CANVAS_DRAG_VALIDATION
 */
export const validateDragContext = (elementId: string, changes: any, source: string, elements: Element[]): boolean => {
    console.log('🎯 ComponentDrag Logic: Validate Drag Context');
    
    try {
        // Find the element being dragged
        const element = elements.find(el => el.id === elementId);
        if (!element) {
            console.warn('🎯 ComponentDrag Logic: Element not found for drag validation:', elementId);
            return false;
        }

        // Validate drag source
        if (source !== 'canvas-drag' && source !== 'component-drag') {
            console.log('🎯 ComponentDrag Logic: Invalid drag source:', source);
            return false;
        }

        // Validate changes object
        if (!changes || typeof changes !== 'object') {
            console.warn('🎯 ComponentDrag Logic: Invalid changes object:', changes);
            return false;
        }

        // Check if element is draggable
        if (element.locked || element.readonly) {
            console.warn('🎯 ComponentDrag Logic: Element is locked or readonly:', elementId);
            return false;
        }

        // Validate position changes
        if (changes.x !== undefined && (typeof changes.x !== 'number' || isNaN(changes.x))) {
            console.warn('🎯 ComponentDrag Logic: Invalid x position:', changes.x);
            return false;
        }

        if (changes.y !== undefined && (typeof changes.y !== 'number' || isNaN(changes.y))) {
            console.warn('🎯 ComponentDrag Logic: Invalid y position:', changes.y);
            return false;
        }

        console.log('🎯 ComponentDrag Logic: Drag context validation successful');
        return true;

    } catch (error) {
        console.error('🎯 ComponentDrag Logic: Drag context validation failed:', error);
        return false;
    }
};

/**
 * Check if element can be dragged
 */
export const canElementBeDragged = (element: Element): boolean => {
    return !element.locked && !element.readonly && element.type !== 'background';
};

/**
 * Validate drag boundaries
 */
export const validateDragBoundaries = (element: Element, newX: number, newY: number, canvasBounds?: any): boolean => {
    if (!canvasBounds) return true;
    
    const elementRight = newX + (element.width || 0);
    const elementBottom = newY + (element.height || 0);
    
    return newX >= 0 && 
           newY >= 0 && 
           elementRight <= canvasBounds.width && 
           elementBottom <= canvasBounds.height;
};
