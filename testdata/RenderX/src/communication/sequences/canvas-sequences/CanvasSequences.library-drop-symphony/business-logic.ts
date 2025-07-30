/**
 * Canvas Library Drop Symphony - Business Logic
 * 
 * Business logic utilities for the Canvas Library Drop Symphony No. 33.
 * Contains helper functions and business rules for library drop operations.
 * 
 * @version 1.0.0
 * @author RenderX Evolution Team
 * @date 2025-07-29
 */

/**
 * Drop Validation Rules
 * Business rules for validating library drop operations
 */
export const DropValidationRules = {
  /**
   * Validate drag data structure
   */
  validateDragData: (dragData: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!dragData) {
      errors.push('Drag data is required');
      return { isValid: false, errors };
    }
    
    if (!dragData.type || typeof dragData.type !== 'string') {
      errors.push('Drag data must have a valid type');
    }
    
    if (!dragData.componentId || typeof dragData.componentId !== 'string') {
      errors.push('Drag data must have a valid componentId');
    }
    
    return { isValid: errors.length === 0, errors };
  },

  /**
   * Validate drop coordinates
   */
  validateDropCoordinates: (coordinates: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!coordinates) {
      errors.push('Drop coordinates are required');
      return { isValid: false, errors };
    }
    
    if (typeof coordinates.x !== 'number' || isNaN(coordinates.x)) {
      errors.push('Drop coordinates must have a valid x position');
    }
    
    if (typeof coordinates.y !== 'number' || isNaN(coordinates.y)) {
      errors.push('Drop coordinates must have a valid y position');
    }
    
    if (coordinates.x < 0 || coordinates.y < 0) {
      errors.push('Drop coordinates must be non-negative');
    }
    
    return { isValid: errors.length === 0, errors };
  },

  /**
   * Validate container context
   */
  validateContainerContext: (context: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!context) {
      // Container context is optional, but if provided must be valid
      return { isValid: true, errors };
    }
    
    if (context.isValidDropZone === false) {
      errors.push('Drop zone is not valid for this operation');
    }
    
    if (context.containerId && typeof context.containerId !== 'string') {
      errors.push('Container ID must be a string if provided');
    }
    
    return { isValid: errors.length === 0, errors };
  }
};

/**
 * Element Creation Utilities
 * Business logic for creating elements from library components
 */
export const ElementCreationUtils = {
  /**
   * Generate unique element ID
   */
  generateElementId: (componentId: string, timestamp?: number): string => {
    const ts = timestamp || Date.now();
    return `element-${componentId}-${ts}`;
  },

  /**
   * Create element from library component
   */
  createElementFromLibrary: (
    dragData: any,
    dropCoordinates: any,
    containerContext?: any
  ): any => {
    const elementId = ElementCreationUtils.generateElementId(dragData.componentId);
    
    return {
      id: elementId,
      type: dragData.type,
      componentId: dragData.componentId,
      position: {
        x: dropCoordinates.x,
        y: dropCoordinates.y,
        canvasX: dropCoordinates.canvasX || dropCoordinates.x,
        canvasY: dropCoordinates.canvasY || dropCoordinates.y
      },
      metadata: {
        ...dragData.metadata,
        createdAt: new Date().toISOString(),
        source: 'library-drop',
        version: '1.0.0'
      },
      container: containerContext?.containerId || null,
      state: 'created',
      properties: dragData.properties || {},
      styles: {}
    };
  },

  /**
   * Apply default properties to element
   */
  applyDefaultProperties: (element: any, componentType: string): any => {
    const defaultProperties = ElementCreationUtils.getDefaultProperties(componentType);
    
    return {
      ...element,
      properties: {
        ...defaultProperties,
        ...element.properties
      }
    };
  },

  /**
   * Get default properties for component type
   */
  getDefaultProperties: (componentType: string): Record<string, any> => {
    const defaults: Record<string, Record<string, any>> = {
      button: {
        text: 'Button',
        variant: 'primary',
        size: 'medium',
        disabled: false
      },
      text: {
        content: 'Text',
        fontSize: '16px',
        fontWeight: 'normal',
        color: '#000000'
      },
      container: {
        width: '200px',
        height: '100px',
        backgroundColor: 'transparent',
        border: '1px solid #ccc'
      },
      image: {
        src: '',
        alt: 'Image',
        width: '100px',
        height: '100px'
      }
    };
    
    return defaults[componentType] || {};
  }
};

/**
 * CSS Synchronization Utilities
 * Business logic for CSS class generation and styling
 */
export const CssSynchronizationUtils = {
  /**
   * Generate CSS classes for element
   */
  generateCssClasses: (element: any): {
    component: string;
    position: string;
    container?: string;
  } => {
    const classes = {
      component: `rx-comp-${element.type}-${element.id}`,
      position: `rx-pos-${element.id}`
    };
    
    if (element.container) {
      return {
        ...classes,
        container: `rx-container-child-${element.container}`
      };
    }
    
    return classes;
  },

  /**
   * Generate position styles for element
   */
  generatePositionStyles: (element: any): Record<string, string | number> => {
    return {
      position: 'absolute',
      left: `${element.position.x}px`,
      top: `${element.position.y}px`,
      zIndex: 1
    };
  },

  /**
   * Generate component-specific styles
   */
  generateComponentStyles: (element: any): Record<string, string | number> => {
    const baseStyles: Record<string, string | number> = {};
    
    // Apply component-specific default styles
    switch (element.type) {
      case 'button':
        return {
          ...baseStyles,
          padding: '8px 16px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          backgroundColor: '#f0f0f0',
          cursor: 'pointer'
        };
      
      case 'text':
        return {
          ...baseStyles,
          fontSize: element.properties?.fontSize || '16px',
          fontWeight: element.properties?.fontWeight || 'normal',
          color: element.properties?.color || '#000000'
        };
      
      case 'container':
        return {
          ...baseStyles,
          width: element.properties?.width || '200px',
          height: element.properties?.height || '100px',
          backgroundColor: element.properties?.backgroundColor || 'transparent',
          border: element.properties?.border || '1px solid #ccc'
        };
      
      default:
        return baseStyles;
    }
  }
};

/**
 * Drop State Management Utilities
 * Business logic for managing drop state and cleanup
 */
export const DropStateUtils = {
  /**
   * Clean up drag indicators
   */
  cleanupDragIndicators: (): { success: boolean; operations: string[] } => {
    const operations: string[] = [];
    
    try {
      // Remove drag over classes
      const dragOverElements = document.querySelectorAll('.drag-over');
      dragOverElements.forEach(el => {
        el.classList.remove('drag-over');
        operations.push(`Removed drag-over class from ${el.tagName}`);
      });
      
      // Remove drop zone highlights
      const dropZoneElements = document.querySelectorAll('.drop-zone-active');
      dropZoneElements.forEach(el => {
        el.classList.remove('drop-zone-active');
        operations.push(`Removed drop-zone-active class from ${el.tagName}`);
      });
      
      return { success: true, operations };
    } catch (error) {
      console.error('Failed to cleanup drag indicators:', error);
      return { success: false, operations };
    }
  },

  /**
   * Finalize element state
   */
  finalizeElementState: (element: any): any => {
    return {
      ...element,
      state: 'active',
      finalizedAt: new Date().toISOString(),
      isTemporary: false
    };
  },

  /**
   * Reset temporary states
   */
  resetTemporaryStates: (): { success: boolean; operations: string[] } => {
    const operations: string[] = [];
    
    try {
      // Clear any temporary data from sessionStorage
      const tempKeys = Object.keys(sessionStorage).filter(key => 
        key.startsWith('temp-drag-') || key.startsWith('temp-drop-')
      );
      
      tempKeys.forEach(key => {
        sessionStorage.removeItem(key);
        operations.push(`Removed temporary data: ${key}`);
      });
      
      return { success: true, operations };
    } catch (error) {
      console.error('Failed to reset temporary states:', error);
      return { success: false, operations };
    }
  }
};
