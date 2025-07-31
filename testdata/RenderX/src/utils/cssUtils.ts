/**
 * CSS Utilities for RX.Evolution
 * 
 * Handles dynamic CSS generation and injection for components
 * following the rx-comp-[type]-{hash} naming convention.
 * 
 * @version 1.0.0
 * @author RenderX Evolution Team
 * @date 2025-07-29
 */

/**
 * Convert camelCase to kebab-case for CSS properties
 */
const camelToKebab = (str: string): string => {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
};

/**
 * Inject or update CSS rule in document
 * Creates a single style element for all dynamic RenderX styles
 */
export const injectCSSRule = (selector: string, styles: Record<string, string | number>): void => {
  // Find or create style element
  let styleElement = document.getElementById('renderx-evolution-dynamic-styles') as HTMLStyleElement;
  if (!styleElement) {
    styleElement = document.createElement('style') as HTMLStyleElement;
    styleElement.id = 'renderx-evolution-dynamic-styles';
    styleElement.type = 'text/css';
    document.head.appendChild(styleElement);
  }

  // Generate CSS rule
  const cssRule = `${selector} { ${Object.entries(styles)
    .map(([prop, value]) => `${camelToKebab(prop)}: ${value}`)
    .join('; ')}; }`;

  // Check if rule already exists and update it, or append new rule
  const sheet = styleElement.sheet as CSSStyleSheet;
  if (sheet) {
    // Find existing rule index
    let existingRuleIndex = -1;
    for (let i = 0; i < sheet.cssRules.length; i++) {
      const rule = sheet.cssRules[i] as CSSStyleRule;
      if (rule.selectorText === selector) {
        existingRuleIndex = i;
        break;
      }
    }

    // Update existing rule or add new one
    if (existingRuleIndex >= 0) {
      sheet.deleteRule(existingRuleIndex);
      sheet.insertRule(cssRule, existingRuleIndex);
    } else {
      sheet.insertRule(cssRule, sheet.cssRules.length);
    }
  } else {
    // Fallback: append to textContent
    styleElement.textContent += '\n' + cssRule;
  }

  console.log(`🎨 CSS Rule injected: ${selector}`, styles);
};

/**
 * Generate styles from JSON component definition (data-driven approach)
 * ARCHITECTURAL PRINCIPLE: App knows nothing about component types - purely data-driven
 */
export const getComponentStyles = (
  componentData: any,
  position: { x: number; y: number },
  elementProperties: Record<string, any> = {}
): Record<string, string | number> => {
  const baseStyles = {
    position: 'absolute',
    left: `${position.x}px`,
    top: `${position.y}px`,
    zIndex: 1,
  };

  // If no component data, return minimal base styles
  if (!componentData?.ui?.styles) {
    console.warn('No styles found in component data, using base styles');
    return baseStyles;
  }

  const { variables = {} } = componentData.ui.styles;

  // Convert component variables to CSS styles
  const componentStyles: Record<string, string | number> = {};

  // Map common variable names to CSS properties
  const variableMapping: Record<string, string> = {
    'bg-color': 'backgroundColor',
    'text-color': 'color',
    'border': 'border',
    'padding': 'padding',
    'border-radius': 'borderRadius',
    'font-size': 'fontSize',
    'font-weight': 'fontWeight',
    'font-family': 'fontFamily',
    'width': 'width',
    'height': 'height',
    'min-width': 'minWidth',
    'min-height': 'minHeight',
    'max-width': 'maxWidth',
    'max-height': 'maxHeight',
    'cursor': 'cursor',
    'display': 'display',
    'align-items': 'alignItems',
    'justify-content': 'justifyContent',
    'text-decoration': 'textDecoration',
    'user-select': 'userSelect'
  };

  // Apply component variables as CSS properties
  Object.entries(variables).forEach(([varName, varValue]) => {
    const cssProperty = variableMapping[varName] || varName;
    componentStyles[cssProperty] = varValue as string | number;
  });

  // Add cursor pointer for interactive components (if not already specified)
  if (componentData.integration?.events?.click && !componentStyles.cursor) {
    componentStyles.cursor = 'pointer';
  }

  // Apply default dimensions from canvas integration
  const canvasIntegration = componentData.integration?.canvasIntegration;
  if (canvasIntegration) {
    if (canvasIntegration.defaultWidth && !componentStyles.width) {
      componentStyles.width = `${canvasIntegration.defaultWidth}px`;
    }
    if (canvasIntegration.defaultHeight && !componentStyles.height) {
      componentStyles.height = `${canvasIntegration.defaultHeight}px`;
    }
  }

  // Override with element-specific properties
  Object.entries(elementProperties).forEach(([key, value]) => {
    if (key === 'width' || key === 'height') {
      componentStyles[key] = typeof value === 'number' ? `${value}px` : value;
    } else {
      componentStyles[key] = value;
    }
  });

  return {
    ...baseStyles,
    ...componentStyles
  };
};

/**
 * Generate and inject CSS for a component (data-driven approach)
 * ARCHITECTURAL PRINCIPLE: Uses component's own style definitions
 */
export const generateAndInjectComponentCSS = (
  cssClass: string,
  componentData: any,
  position: { x: number; y: number },
  elementProperties: Record<string, any> = {},
  customStyles: Record<string, string | number> = {}
): void => {
  const componentStyles = getComponentStyles(componentData, position, elementProperties);
  const finalStyles = { ...componentStyles, ...customStyles };

  // Also inject the component's raw CSS if it exists
  if (componentData?.ui?.styles?.css) {
    injectRawCSS(componentData.ui.styles.css);
  }

  injectCSSRule(`.${cssClass}`, finalStyles);
};

/**
 * Inject raw CSS string into the document
 * Used for component-defined CSS from JSON definitions
 */
export const injectRawCSS = (cssString: string): void => {
  // Check if this CSS has already been injected
  const cssId = `component-css-${btoa(cssString).substring(0, 10)}`;
  if (document.getElementById(cssId)) {
    return; // Already injected
  }

  const style = document.createElement('style');
  style.id = cssId;
  style.textContent = cssString;
  document.head.appendChild(style);
};

/**
 * Generate selection styles for components
 */
export const generateSelectionStyles = (): Record<string, string | number> => {
  return {
    outline: '2px solid #007acc',
    outlineOffset: '1px',
  };
};

/**
 * Inject selection styles
 */
export const injectSelectionStyles = (): void => {
  injectCSSRule('.rx-selected', generateSelectionStyles());
};
