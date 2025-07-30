/**
 * Valid Integration Flow Test File
 * This file contains proper integration between UI handlers and musical sequences
 */

import React, { useState } from 'react';

// Mock communication system
const communicationSystem = {
  conductor: {
    startSequence: (name: string, data: any) => {
      console.log(`Starting sequence: ${name}`, data);
    }
  }
};

export const ValidIntegrationCanvas: React.FC = () => {
  const [draggedElement, setDraggedElement] = useState<any>(null);

  // VALID: Handler properly calls corresponding symphony
  const handleCanvasElementDragStart = (e: React.DragEvent, element: any) => {
    console.log('🎼 Starting canvas element drag operation for:', element.id);

    setDraggedElement(element);
    
    // VALID: Proper symphony call with correct naming
    communicationSystem.conductor.startSequence('canvas-component-drag-symphony', {
      elementId: element.id,
      changes: { dragStart: true },
      source: 'canvas-element-drag-start',
      eventData: {
        eventType: 'canvas-element-drag-start',
        element,
        timestamp: Date.now()
      }
    });
  };

  // VALID: Drop handler with proper symphony integration
  const handleCanvasLibraryDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    
    try {
      const dragData = JSON.parse(e.dataTransfer.getData('application/json'));
      console.log('🎼 Canvas drop detected:', dragData);

      // VALID: Proper symphony call for library drop
      communicationSystem.conductor.startSequence('canvas-library-drop-symphony', {
        dragData,
        dropCoordinates: { x: e.clientX, y: e.clientY },
        source: 'canvas-library-drop',
        eventData: {
          eventType: 'library-drop',
          dragData,
          timestamp: Date.now()
        }
      });

    } catch (error) {
      console.error('Failed to handle canvas drop:', error);
    }
  };

  // VALID: Selection handler with symphony integration
  const handleCanvasElementSelection = (e: React.MouseEvent, element: any) => {
    console.log('🎼 Element selection detected:', element.id);

    // VALID: Proper symphony call for element selection
    communicationSystem.conductor.startSequence('canvas-element-selection-symphony', {
      elementId: element.id,
      selectionData: { selected: true },
      source: 'canvas-element-selection',
      eventData: {
        eventType: 'element-selection',
        element,
        timestamp: Date.now()
      }
    });
  };

  return (
    <div className="canvas-container">
      <div 
        className="canvas-workspace"
        onDrop={handleCanvasLibraryDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <div 
          className="canvas-element"
          draggable
          onDragStart={(e) => handleCanvasElementDragStart(e, { id: 'element-1' })}
          onClick={(e) => handleCanvasElementSelection(e, { id: 'element-1' })}
        >
          Draggable Element
        </div>
      </div>
    </div>
  );
};

export default ValidIntegrationCanvas;
