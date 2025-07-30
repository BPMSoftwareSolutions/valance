/**
 * Canvas Element Selection Symphony - Business Logic
 * 
 * Business logic utilities for the Canvas Element Selection Symphony No. 37.
 * Contains helper functions and business rules for element selection operations.
 * 
 * @version 1.0.0
 * @author RenderX Evolution Team
 * @date 2025-07-29
 */

/**
 * Selection Validation Rules
 * Business rules for validating element selection operations
 */
export const SelectionValidationRules = {
  /**
   * Validate element selectability
   */
  validateElementSelectability: (element: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!element) {
      errors.push('Element is required');
      return { isValid: false, errors };
    }
    
    if (!element.id || typeof element.id !== 'string') {
      errors.push('Element must have a valid ID');
    }
    
    if (!element.type || typeof element.type !== 'string') {
      errors.push('Element must have a valid type');
    }
    
    if (element.metadata?.selectable === false) {
      errors.push('Element is marked as non-selectable');
    }
    
    if (element.state === 'locked') {
      errors.push('Element is locked and cannot be selected');
    }
    
    return { isValid: errors.length === 0, errors };
  },

  /**
   * Validate selection context
   */
  validateSelectionContext: (context: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!context) {
      // Context is optional, provide defaults
      return { isValid: true, errors };
    }
    
    const validSelectionTypes = ['single', 'multi', 'range'];
    if (context.selectionType && !validSelectionTypes.includes(context.selectionType)) {
      errors.push('Invalid selection type');
    }
    
    const validSources = ['click', 'keyboard', 'programmatic'];
    if (context.source && !validSources.includes(context.source)) {
      errors.push('Invalid selection source');
    }
    
    return { isValid: errors.length === 0, errors };
  }
};

/**
 * Selection State Management Utilities
 * Business logic for managing selection state
 */
export const SelectionStateUtils = {
  /**
   * Create selection state
   */
  createSelectionState: (element: any, context: any): any => {
    return {
      elementId: element.id,
      elementType: element.type,
      selectionType: context?.selectionType || 'single',
      clearPrevious: context?.clearPrevious !== false,
      source: context?.source || 'click',
      timestamp: Date.now(),
      modifiers: context?.modifiers || {}
    };
  },

  /**
   * Process multi-selection
   */
  processMultiSelection: (
    currentSelection: Set<string>,
    elementId: string,
    selectionType: string
  ): { selectedElements: string[]; deselectedElements: string[] } => {
    const result = {
      selectedElements: [] as string[],
      deselectedElements: [] as string[]
    };
    
    if (selectionType === 'single') {
      result.deselectedElements = Array.from(currentSelection);
      result.selectedElements = [elementId];
    } else if (selectionType === 'multi') {
      if (currentSelection.has(elementId)) {
        result.deselectedElements = [elementId];
        result.selectedElements = Array.from(currentSelection).filter(id => id !== elementId);
      } else {
        result.selectedElements = [...Array.from(currentSelection), elementId];
      }
    }
    
    return result;
  }
};

/**
 * Visual Tools Management Utilities
 * Business logic for managing visual selection tools
 */
export const VisualToolsUtils = {
  /**
   * Generate visual tools configuration
   */
  generateVisualToolsConfig: (element: any): any => {
    const baseConfig = {
      selectionIndicators: {
        enabled: true,
        type: 'border-highlight',
        color: '#007bff',
        width: '2px'
      },
      contextMenu: {
        enabled: true,
        position: 'element-relative'
      }
    };
    
    // Add resize handles for resizable elements
    if (element.type !== 'text') {
      baseConfig.resizeHandles = {
        enabled: true,
        positions: ['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'],
        size: '8px'
      };
    }
    
    // Add rotation handle for rotatable elements
    if (element.metadata?.rotatable !== false) {
      baseConfig.rotationHandle = {
        enabled: true,
        position: 'top-center',
        offset: '20px'
      };
    }
    
    return baseConfig;
  },

  /**
   * Generate selection styling
   */
  generateSelectionStyling: (element: any, visualTools: any): Record<string, string | number> => {
    const styling: Record<string, string | number> = {};
    
    if (visualTools.selectionIndicators?.enabled) {
      styling.outline = `${visualTools.selectionIndicators.width} solid ${visualTools.selectionIndicators.color}`;
      styling.outlineOffset = '2px';
    }
    
    styling.zIndex = 1000;
    
    return styling;
  }
};
