/**
 * Invalid Integration Flow Test File
 * This file contains handlers that are NOT properly connected to musical sequences
 */

import React, { useState } from 'react';

export const InvalidIntegrationCanvas: React.FC = () => {
  const [draggedElement, setDraggedElement] = useState<any>(null);

  // VIOLATION: Handler does not call corresponding symphony
  const handleCanvasElementDragStart = (e: React.DragEvent, element: any) => {
    console.log('Starting drag operation for:', element.id);

    setDraggedElement(element);
    
    // VIOLATION: No symphony call - breaks musical architecture
    // Should call: communicationSystem.conductor.startSequence('canvas-component-drag-symphony', ...)
    
    // Just doing direct manipulation without symphony coordination
    e.dataTransfer.setData('application/json', JSON.stringify(element));
    e.dataTransfer.effectAllowed = 'move';
  };

  // VIOLATION: Handler calls wrong symphony name
  const handleCanvasLibraryDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    
    try {
      const dragData = JSON.parse(e.dataTransfer.getData('application/json'));
      console.log('Canvas drop detected:', dragData);

      // Mock communication system
      const communicationSystem = {
        conductor: {
          startSequence: (name: string, data: any) => {
            console.log(`Starting sequence: ${name}`, data);
          }
        }
      };

      // VIOLATION: Wrong symphony name - should be 'canvas-library-drop-symphony'
      communicationSystem.conductor.startSequence('wrong-symphony-name', {
        dragData,
        dropCoordinates: { x: e.clientX, y: e.clientY }
      });

    } catch (error) {
      console.error('Failed to handle canvas drop:', error);
    }
  };

  // VIOLATION: Handler exists but no symphony call at all
  const handleCanvasElementSelection = (e: React.MouseEvent, element: any) => {
    console.log('Element selection detected:', element.id);

    // VIOLATION: No symphony integration - just direct state manipulation
    // Should call: communicationSystem.conductor.startSequence('canvas-element-selection-symphony', ...)
    
    // Direct DOM manipulation without musical coordination
    const elementNode = e.currentTarget as HTMLElement;
    elementNode.classList.add('selected');
    
    // Update some local state
    setDraggedElement(element);
  };

  // VIOLATION: Handler with no musical sequence integration
  const handleElementClick = (e: React.MouseEvent) => {
    console.log('Element clicked');
    
    // VIOLATION: Handler relevant to element-selection symphony but no call
    // This should trigger canvas-element-selection-symphony
    
    // Just doing basic click handling
    e.preventDefault();
    e.stopPropagation();
  };

  // VIOLATION: Drag handler with incomplete symphony integration
  const handleDragEnd = (e: React.DragEvent) => {
    console.log('Drag ended');
    
    // VIOLATION: Relevant to component-drag symphony but no proper call
    // Should coordinate with canvas-component-drag-symphony
    
    setDraggedElement(null);
    e.currentTarget.classList.remove('dragging');
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
          onDragEnd={handleDragEnd}
          onClick={handleElementClick}
          onDoubleClick={(e) => handleCanvasElementSelection(e, { id: 'element-1' })}
        >
          Disconnected Element (No Symphony Integration)
        </div>
        
        <div 
          className="canvas-element"
          draggable
          onDragStart={(e) => handleCanvasElementDragStart(e, { id: 'element-2' })}
        >
          Another Disconnected Element
        </div>
      </div>
    </div>
  );
};

export default InvalidIntegrationCanvas;
