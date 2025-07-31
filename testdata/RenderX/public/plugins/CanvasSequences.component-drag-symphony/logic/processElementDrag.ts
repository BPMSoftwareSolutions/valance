// @agent-context: business logic for element drag processing - pure function for updating element positions
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
 * Process Element Drag
 * Pure business logic for processing element drag operations
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
