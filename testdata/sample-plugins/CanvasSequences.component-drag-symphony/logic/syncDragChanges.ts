// @agent-context: business logic for drag changes synchronization - pure function for finalizing drag operations
/**
 * Sync Drag Changes
 * Pure business logic for synchronizing drag changes to CSS
 * Beat: 4 - CANVAS_DROP
 */
export const syncDragChanges = (
  elementId: string,
  changes: any,
  source: string,
  capturedElement?: any,
  syncElementCSS?: (element: any, cssData: any) => void
): boolean => {
  console.log('🎯 Business Logic: Sync Drag Changes');

  // Validate inputs
  if (!elementId || !changes || !source) {
    console.warn('🎯 Drag sync failed: Missing required parameters');
    return false;
  }

  // If we have a captured element and sync function, use them
  if (capturedElement && syncElementCSS && typeof syncElementCSS === 'function') {
    try {
      // Prepare CSS data from changes
      const cssData = prepareCSSData(changes);
      
      // Sync the changes to CSS
      syncElementCSS(capturedElement, cssData);
      
      console.log('🎯 Drag changes synced to CSS successfully');
      return true;
    } catch (error) {
      console.error('🎯 Failed to sync drag changes to CSS:', error);
      return false;
    }
  }

  // If no sync function available, just validate the changes
  const isValid = validateChanges(changes);
  if (isValid) {
    console.log('🎯 Drag changes validated successfully (no CSS sync available)');
    return true;
  }

  console.warn('🎯 Drag changes validation failed');
  return false;
};

/**
 * Prepare CSS data from changes object
 */
function prepareCSSData(changes: any): any {
  const cssData: any = {};

  // Map position changes to CSS properties
  if (changes.x !== undefined) {
    cssData.left = `${changes.x}px`;
  }

  if (changes.y !== undefined) {
    cssData.top = `${changes.y}px`;
  }

  if (changes.width !== undefined) {
    cssData.width = `${changes.width}px`;
  }

  if (changes.height !== undefined) {
    cssData.height = `${changes.height}px`;
  }

  // Handle line-specific properties
  if (changes.x1 !== undefined || changes.y1 !== undefined || 
      changes.x2 !== undefined || changes.y2 !== undefined) {
    // For line elements, we might need special handling
    cssData.transform = buildLineTransform(changes);
  }

  return cssData;
}

/**
 * Build transform for line elements
 */
function buildLineTransform(changes: any): string {
  // This is a simplified transform builder
  // In a real implementation, you'd calculate the proper transform
  // based on the line's start and end points
  const transforms = [];

  if (changes.x !== undefined || changes.y !== undefined) {
    const x = changes.x || 0;
    const y = changes.y || 0;
    transforms.push(`translate(${x}px, ${y}px)`);
  }

  return transforms.join(' ');
}

/**
 * Validate changes object
 */
function validateChanges(changes: any): boolean {
  // Check if changes object has valid properties
  const validProperties = ['x', 'y', 'width', 'height', 'x1', 'y1', 'x2', 'y2'];
  const hasValidProperty = Object.keys(changes).some(key => validProperties.includes(key));

  if (!hasValidProperty) {
    console.warn('🎯 No valid properties found in changes object');
    return false;
  }

  // Validate numeric values
  for (const [key, value] of Object.entries(changes)) {
    if (validProperties.includes(key) && typeof value !== 'number') {
      console.warn(`🎯 Invalid value for property ${key}:`, value);
      return false;
    }
  }

  return true;
}
