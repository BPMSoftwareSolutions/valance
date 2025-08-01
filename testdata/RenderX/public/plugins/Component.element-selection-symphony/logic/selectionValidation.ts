/**
 * Canvas Element Selection - Validation Logic
 * Beat 1: Selection Context Validation
 */

// Types for better type safety
interface Element {
  id: string;
  type: string;
  metadata?: {
    selectable?: boolean;
    [key: string]: any;
  };
  state?: string;
  [key: string]: any;
}

interface SelectionContext {
  canvasId?: string;
  multiSelect?: boolean;
  rangeSelect?: boolean;
  [key: string]: any;
}

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
      // Context is optional, so this is valid
      return { isValid: true, errors };
    }
    
    if (context.canvasId && typeof context.canvasId !== 'string') {
      errors.push('Canvas ID must be a string');
    }
    
    if (context.multiSelect !== undefined && typeof context.multiSelect !== 'boolean') {
      errors.push('Multi-select flag must be a boolean');
    }
    
    if (context.rangeSelect !== undefined && typeof context.rangeSelect !== 'boolean') {
      errors.push('Range-select flag must be a boolean');
    }
    
    return { isValid: errors.length === 0, errors };
  }
};

/**
 * Validate Selection Context
 * Main validation function for element selection
 */
export const validateSelectionContext = (
    element: Element, 
    selectionContext?: SelectionContext, 
    selectionType: 'single' | 'multi' | 'range' = 'single'
): boolean => {
    console.log('🎯 ElementSelection Logic: Validate Selection Context');
    
    try {
        // Validate element selectability
        const elementValidation = SelectionValidationRules.validateElementSelectability(element);
        if (!elementValidation.isValid) {
            console.warn('🎯 ElementSelection Logic: Element validation failed:', elementValidation.errors);
            return false;
        }

        // Validate selection context
        const contextValidation = SelectionValidationRules.validateSelectionContext(selectionContext);
        if (!contextValidation.isValid) {
            console.warn('🎯 ElementSelection Logic: Context validation failed:', contextValidation.errors);
            return false;
        }

        // Validate selection type compatibility
        if (selectionType === 'multi' && selectionContext?.multiSelect === false) {
            console.warn('🎯 ElementSelection Logic: Multi-select requested but not allowed in context');
            return false;
        }

        if (selectionType === 'range' && selectionContext?.rangeSelect === false) {
            console.warn('🎯 ElementSelection Logic: Range-select requested but not allowed in context');
            return false;
        }

        console.log('🎯 ElementSelection Logic: Selection context validation successful');
        return true;

    } catch (error) {
        console.error('🎯 ElementSelection Logic: Selection context validation failed:', error);
        return false;
    }
};

/**
 * Check if element can be selected
 */
export const canElementBeSelected = (element: Element): boolean => {
    const validation = SelectionValidationRules.validateElementSelectability(element);
    return validation.isValid;
};

/**
 * Get selection constraints for element
 */
export const getSelectionConstraints = (element: Element): {
    canSelect: boolean;
    canMultiSelect: boolean;
    canRangeSelect: boolean;
    reasons: string[];
} => {
    const validation = SelectionValidationRules.validateElementSelectability(element);
    
    return {
        canSelect: validation.isValid,
        canMultiSelect: validation.isValid && element.metadata?.multiSelectable !== false,
        canRangeSelect: validation.isValid && element.metadata?.rangeSelectable !== false,
        reasons: validation.errors
    };
};
