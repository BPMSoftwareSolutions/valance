/**
 * Canvas Component Drag - Coordination Logic
 * Beat 3 & 4: Drop Validation & CSS Synchronization
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

/**
 * Coordinate Drag State
 * Beat: 3 - CANVAS_DROP_VALIDATION
 */
export const coordinateDragState = (
    elementId: string, 
    changes: any, 
    source: string, 
    elements: Element[], 
    dragData?: any
): boolean => {
    console.log('🎯 ComponentDrag Logic: Coordinate Drag State');
    
    try {
        // Find the element being dropped
        const element = elements.find(el => el.id === elementId);
        if (!element) {
            console.warn('🎯 ComponentDrag Logic: Element not found for drop coordination:', elementId);
            return false;
        }

        // Validate drop position
        const newX = changes.x !== undefined ? changes.x : element.x || 0;
        const newY = changes.y !== undefined ? changes.y : element.y || 0;

        // Check boundaries
        if (newX < 0 || newY < 0) {
            console.warn('🎯 ComponentDrag Logic: Invalid drop position (negative coordinates)');
            return false;
        }

        // Check for conflicts with other elements
        const conflicts = elements.filter(el => 
            el.id !== elementId && 
            el.x === newX && 
            el.y === newY
        );

        if (conflicts.length > 0) {
            console.warn('🎯 ComponentDrag Logic: Drop position conflicts with existing elements');
            // Allow drop but log warning
        }

        // Update drag state
        if (dragData) {
            dragData.finalPosition = { x: newX, y: newY };
            dragData.dropValidated = true;
            dragData.timestamp = new Date();
        }

        console.log('🎯 ComponentDrag Logic: Drag state coordination successful');
        return true;

    } catch (error) {
        console.error('🎯 ComponentDrag Logic: Drag state coordination failed:', error);
        return false;
    }
};

/**
 * Sync Drag Changes
 * Beat: 4 - CANVAS_ELEMENT_CSS_SYNC
 */
export const syncDragChanges = (
    elementId: string, 
    changes: any, 
    source: string, 
    elements: Element[], 
    capturedElement?: any, 
    syncElementCSS?: (element: any, cssData: any) => void
): boolean => {
    console.log('🎯 ComponentDrag Logic: Sync Drag Changes');
    
    try {
        // Find the element to sync
        const element = elements.find(el => el.id === elementId);
        if (!element) {
            console.warn('🎯 ComponentDrag Logic: Element not found for CSS sync:', elementId);
            return false;
        }

        // Prepare CSS data for synchronization
        const cssData: any = {};

        // Handle position changes
        if (changes.x !== undefined) {
            cssData.left = `${changes.x}px`;
            cssData.transform = cssData.transform || '';
            cssData.transform += ` translateX(${changes.x}px)`;
        }

        if (changes.y !== undefined) {
            cssData.top = `${changes.y}px`;
            cssData.transform = cssData.transform || '';
            cssData.transform += ` translateY(${changes.y}px)`;
        }

        // Handle size changes
        if (changes.width !== undefined) {
            cssData.width = `${changes.width}px`;
        }

        if (changes.height !== undefined) {
            cssData.height = `${changes.height}px`;
        }

        // Handle rotation
        if (changes.rotation !== undefined) {
            cssData.transform = cssData.transform || '';
            cssData.transform += ` rotate(${changes.rotation}deg)`;
        }

        // Clean up transform string
        if (cssData.transform) {
            cssData.transform = cssData.transform.trim();
        }

        // Apply CSS synchronization if function is provided
        if (syncElementCSS && Object.keys(cssData).length > 0) {
            syncElementCSS(element, cssData);
            console.log('🎯 ComponentDrag Logic: CSS synchronization applied');
        }

        // Update captured element if provided
        if (capturedElement) {
            Object.assign(capturedElement, changes);
        }

        console.log('🎯 ComponentDrag Logic: Drag changes sync successful');
        return true;

    } catch (error) {
        console.error('🎯 ComponentDrag Logic: Drag changes sync failed:', error);
        return false;
    }
};

/**
 * Generate CSS transform string
 */
export const generateTransform = (element: Element): string => {
    const transforms: string[] = [];
    
    if (element.x !== undefined && element.y !== undefined) {
        transforms.push(`translate(${element.x}px, ${element.y}px)`);
    }
    
    if (element.rotation !== undefined) {
        transforms.push(`rotate(${element.rotation}deg)`);
    }
    
    if (element.scaleX !== undefined || element.scaleY !== undefined) {
        const scaleX = element.scaleX || 1;
        const scaleY = element.scaleY || 1;
        transforms.push(`scale(${scaleX}, ${scaleY})`);
    }
    
    return transforms.join(' ');
};

/**
 * Apply visual feedback during drag
 */
export const applyDragFeedback = (element: Element, isDragging: boolean): any => {
    return {
        opacity: isDragging ? 0.7 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: isDragging ? 1000 : element.zIndex || 1,
        boxShadow: isDragging ? '0 4px 8px rgba(0,0,0,0.2)' : 'none'
    };
};
