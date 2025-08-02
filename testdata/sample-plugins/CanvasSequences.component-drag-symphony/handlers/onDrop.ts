// @agent-context: handler movement "Drop" - Completes drag operation and finalizes element position
import { syncDragChanges } from '../logic/syncDragChanges';

interface DropData {
  elementId: string;
  changes: any;
  source: string;
  elements: any[];
  setElements?: (updater: (prev: any[]) => any[]) => void;
  capturedElement?: any;
  syncElementCSS?: (element: any, cssData: any) => void;
}

/**
 * Handle Canvas Drop
 * Movement 4: Drop - Completes drag operation and finalizes element position
 */
export const onDrop = (data: DropData): boolean => {
  console.log('🎼 Handler: Canvas Drop', data);

  try {
    const { elementId, changes, source, capturedElement, syncElementCSS } = data;
    const result = syncDragChanges(elementId, changes, source, capturedElement, syncElementCSS);
    console.log('🎼 Handler: Canvas Drop completed successfully');
    return result;
  } catch (error) {
    console.error('🎼 Handler: Canvas Drop failed:', error);
    throw error;
  }
};
