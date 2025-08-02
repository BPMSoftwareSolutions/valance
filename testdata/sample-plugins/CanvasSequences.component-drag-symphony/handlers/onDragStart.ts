// @agent-context: handler movement "DragStart" - Initiates canvas drag operation and validates context
import { validateDragContext } from '../logic/validateDragContext';

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
 * Handle Canvas Drag Start
 * Movement 1: DragStart - Validates drag context and prepares element for movement
 */
export const onDragStart = (data: DragStartData): boolean => {
  console.log('🎼 Handler: Canvas Drag Start', data);

  try {
    const { elementId, changes, source, elements } = data;

    // Check if this event is meant for Component Drag Symphony
    if (!elementId || !changes || !source) {
      console.log('🎼 Handler: Canvas Drag Start - Not a component drag event, skipping');
      return true;
    }

    const result = validateDragContext(elementId, changes, source, elements);
    console.log('🎼 Handler: Canvas Drag Start completed successfully');
    return result;
  } catch (error) {
    console.error('🎼 Handler: Canvas Drag Start failed:', error);
    return false;
  }
};
