// @agent-context: handler movement "DropValidation" - Validates drag position and checks for valid drop zones
import { coordinateDragState } from '../logic/coordinateDragState';

interface DropValidationData {
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
 * Movement 3: DropValidation - Validates drag position and checks for valid drop zones
 */
export const onDropValidation = (data: DropValidationData): boolean => {
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
