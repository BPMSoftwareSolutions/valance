// @agent-context: business logic for drag state coordination - pure function for managing drag state transitions
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
 * Pure business logic for coordinating drag state transitions
 * Beat: 3 - CANVAS_DROP_VALIDATION
 */
export const coordinateDragState = (elementId: string, changes: any, source: string, elements: Element[]): boolean => {
  console.log('🎯 Business Logic: Coordinate Drag State');

  // Validate inputs
  if (!elementId || !changes || !source) {
    console.warn('🎯 Drag state coordination failed: Missing required parameters');
    return false;
  }

  // Validate elements array
  if (!elements || !Array.isArray(elements)) {
    console.warn('🎯 Drag state coordination failed: Invalid elements array');
    return false;
  }

  // Find the element being dragged
  const draggedElement = elements.find(el => el.id === elementId);
  if (!draggedElement) {
    console.warn('🎯 Drag state coordination failed: Element not found', elementId);
    return false;
  }

  // Validate position changes
  const hasValidPosition = validatePositionChanges(changes, draggedElement);
  if (!hasValidPosition) {
    console.warn('🎯 Drag state coordination failed: Invalid position changes');
    return false;
  }

  // Check for collision detection (simplified)
  const hasCollisions = checkForCollisions(draggedElement, changes, elements);
  if (hasCollisions) {
    console.log('🎯 Drag state coordination: Collision detected, but allowing drop');
    // Note: In a real implementation, you might want to prevent the drop
    // For now, we'll allow it and let the UI handle visual feedback
  }

  console.log('🎯 Drag state coordination successful');
  return true;
};

/**
 * Validate position changes are reasonable
 */
function validatePositionChanges(changes: any, element: Element): boolean {
  // Check if position changes are within reasonable bounds
  if (changes.x !== undefined && (changes.x < -10000 || changes.x > 10000)) {
    return false;
  }
  
  if (changes.y !== undefined && (changes.y < -10000 || changes.y > 10000)) {
    return false;
  }

  return true;
}

/**
 * Simple collision detection
 */
function checkForCollisions(draggedElement: Element, changes: any, elements: Element[]): boolean {
  const newX = changes.x !== undefined ? changes.x : draggedElement.x || 0;
  const newY = changes.y !== undefined ? changes.y : draggedElement.y || 0;
  const width = draggedElement.width || 100;
  const height = draggedElement.height || 100;

  // Check against other elements (simplified collision detection)
  for (const element of elements) {
    if (element.id === draggedElement.id) continue;
    
    const elemX = element.x || 0;
    const elemY = element.y || 0;
    const elemWidth = element.width || 100;
    const elemHeight = element.height || 100;

    // Simple bounding box collision
    if (newX < elemX + elemWidth &&
        newX + width > elemX &&
        newY < elemY + elemHeight &&
        newY + height > elemY) {
      return true;
    }
  }

  return false;
}
