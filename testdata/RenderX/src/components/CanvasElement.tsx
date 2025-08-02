/**
 * Canvas Element Component
 * Renders individual elements on the canvas with drag support
 */

import React from 'react';

interface CanvasElementProps {
  element: any;
  elementId: string;
  cssClass: string;
  onDragStart?: (e: React.DragEvent, element: any) => void;
}

const CanvasElement: React.FC<CanvasElementProps> = ({ 
  element, 
  elementId, 
  cssClass, 
  onDragStart 
}) => {
  // Get component data from the element
  const componentData = element.componentData;

  if (!componentData?.ui?.template) {
    // Fallback for elements without component data
    return (
      <div
        id={elementId}
        data-component-id={elementId}
        className={`${cssClass} rx-selected`}
        draggable="true"
        onDragStart={onDragStart ? (e) => onDragStart(e, element) : undefined}
      >
        {element.metadata?.name || element.type} (No template)
      </div>
    );
  }

  // Generic component rendering - app doesn't know component specifics
  // Component rendering should be handled by JsonComponentLoader at runtime
  return (
    <div
      id={elementId}
      data-component-id={elementId}
      className={`${cssClass} rx-generic-component rx-selected`}
      draggable="true"
      onDragStart={onDragStart ? (e) => onDragStart(e, element) : undefined}
    >
      {/* Generic component placeholder - actual rendering handled by JsonComponentLoader */}
      <span className="rx-component-placeholder">Component {element.id}</span>
    </div>
  );
};

export default CanvasElement;
