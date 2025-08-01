// @agent-context: handler movement "ElementMoved" - Processes element movement with real-time position updates
import { processElementDrag } from '../logic/processElementDrag';

interface ElementMovedData {
  elementId: string;
  changes: any;
  source: string;
  elements: any[];
  setElements?: (updater: (prev: any[]) => any[]) => void;
  capturedElement?: any;
  syncElementCSS?: (element: any, cssData: any) => void;
}

/**
 * Handle Canvas Element Moved
 * Movement 2: ElementMoved - Processes element movement with real-time position updates
 */
export const onElementMoved = async (data: ElementMovedData): Promise<any> => {
  console.log('🎼 Handler: Canvas Element Moved', data);

  try {
    const { elementId, changes, source, elements, setElements } = data;

    // Check if this event is meant for Component Drag Symphony
    if (!elementId || !changes || !source) {
      console.log('🎼 Handler: Canvas Element Moved - Not a component drag event, skipping');
      return null;
    }

    if (!setElements) {
      console.warn('🎼 Handler: Canvas Element Moved - setElements function missing, skipping');
      return null;
    }

    const result = await processElementDrag(elementId, changes, source, elements, setElements);
    console.log('🎼 Handler: Canvas Element Moved completed successfully');
    return result;
  } catch (error) {
    console.error('🎼 Handler: Canvas Element Moved failed:', error);
    return null;
  }
};
