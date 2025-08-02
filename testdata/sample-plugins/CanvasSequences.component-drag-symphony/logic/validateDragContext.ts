// @agent-context: business logic for drag context validation - pure function for validating drag operations
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
 * Pure business logic for validating drag context before processing
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

  // Handle different element types
  if (source === 'element-library-drag' || source === 'element-library-drag-end') {
    // Library drag operations don't need existing canvas elements
    console.log('🎯 Library drag operation - skipping canvas element validation');
    return true;
  }

  if (elementId.startsWith('canvas-drag-') || elementId.startsWith('drag-end-')) {
    // Synthetic drag operations (drag-over, drag-leave, etc.)
    console.log('🎯 Synthetic drag operation - skipping canvas element validation');
    return true;
  }

  // Find the element in the current elements array (for canvas element operations)
  const element = elements.find(el => el.id === elementId);
  if (!element) {
    console.warn('🎯 Drag validation failed: Canvas element not found', elementId);
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
