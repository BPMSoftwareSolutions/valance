/**
 * Canvas Component
 * Main workspace for drag-and-drop component placement
 */

import React, { useState } from 'react';
import CanvasElement from './CanvasElement';
import { generateAndInjectComponentCSS, injectSelectionStyles } from '../utils/cssUtils';
import type { CanvasProps } from '../types/AppTypes';

const Canvas: React.FC<CanvasProps> = ({ mode, onCanvasElementDragStart }) => {
  const [canvasElements, setCanvasElements] = useState<any[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  // Drop handlers for Canvas Library Drop Symphony
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setIsDragOver(true);

    // Note: No symphony needed for simple canvas hover state changes
    // This is just visual feedback, not an actual drag operation
    console.log("🎨 Canvas drag over - visual state updated");
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    // Note: No symphony needed for simple canvas hover state changes
    // This is just visual feedback, not an actual drag operation
    console.log("🎨 Canvas drag leave - visual state updated");
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    try {
      // Get drag data
      const dragDataString = e.dataTransfer.getData("application/json");
      if (!dragDataString) {
        console.warn("No drag data found");
        return;
      }

      const dragData = JSON.parse(dragDataString);
      console.log("🎼 Canvas drop detected:", dragData);

      // Get drop coordinates relative to canvas
      const canvasRect = e.currentTarget.getBoundingClientRect();
      const dropCoordinates = {
        x: e.clientX - canvasRect.left,
        y: e.clientY - canvasRect.top,
        canvasX: e.clientX - canvasRect.left,
        canvasY: e.clientY - canvasRect.top,
      };

      // Handle canvas element movement vs library drop
      if (dragData.isCanvasElement) {
        console.log(
          "🎼 Canvas element move detected:",
          dragData.elementData.id
        );

        // Update existing element position
        setCanvasElements((prev) =>
          prev.map((el) =>
            el.id === dragData.elementData.id
              ? { ...el, position: dropCoordinates }
              : el
          )
        );

        return;
      }

      // Get communication system and start Canvas Library Drop Symphony
      const communicationSystem = (window as any).renderxCommunicationSystem;
      if (communicationSystem && communicationSystem.conductor) {
        console.log("🎼 Starting Canvas Library Drop Symphony...");

        // Import the sequence function
        const { MusicalSequences } = await import("../communication/sequences");

        // Start the Canvas Library Drop Symphony using CIA conductor.play()
        console.log(
          "🎼 Starting Canvas Library Drop Symphony via conductor.play()..."
        );

        // CIA-compliant trigger using conductor.play()
        const result = communicationSystem.conductor.play(
          "library-drop-symphony",
          "onDropValidation",
          {
            dragData,
            dropCoordinates,
            dropZone: { isValidDropZone: true },
            timestamp: Date.now(),
            source: "canvas-drop",
          }
        );

        console.log(
          `🎼 Canvas Library Drop Symphony triggered via conductor.play(): ${
            result ? "SUCCESS" : "FAILED"
          }`
        );

        // Create element with proper ID and CSS class generation
        const timestamp = Date.now();
        const randomHash = Math.random().toString(36).substr(2, 9);
        const cssHash = Math.random().toString(36).substr(2, 6);

        const newElement = {
          id: `element-${timestamp}`,
          elementId: `${dragData.type}-${timestamp}-${randomHash}`,
          cssClass: `rx-comp-${dragData.type}-${cssHash}`,
          type: dragData.type,
          componentId: dragData.componentId,
          position: dropCoordinates,
          metadata: dragData.metadata,
          componentData: dragData.componentData, // Store full component data for data-driven rendering
        };

        // Generate and inject CSS for the component (data-driven approach)
        if (dragData.componentData) {
          generateAndInjectComponentCSS(
            newElement.cssClass,
            dragData.componentData,
            dropCoordinates,
            {}, // element properties
            {} // custom styles
          );
        } else {
          console.warn(
            "No component data available for styling, element may not render correctly"
          );
        }

        // Ensure selection styles are available
        injectSelectionStyles();

        setCanvasElements((prev) => [...prev, newElement]);
      } else {
        console.warn(
          "No communication system available for Canvas Library Drop Symphony"
        );
      }
    } catch (error) {
      console.error("Failed to handle canvas drop:", error);
    }
  };

  return (
    <div className={`canvas-container canvas-container--${mode}`}>
      <div className="canvas-toolbar">
        <div className="canvas-toolbar-left">
          <button className="toolbar-button" disabled>
            💾 Save
          </button>
          <button className="toolbar-button" disabled>
            📁 Load
          </button>
          <button className="toolbar-button" disabled>
            ↩️ Undo
          </button>
          <button className="toolbar-button" disabled>
            ↪️ Redo
          </button>
        </div>
        <div className="canvas-toolbar-center">
          <span className="canvas-title">Untitled Canvas</span>
        </div>
        <div className="canvas-toolbar-right">
          <button className="toolbar-button" disabled>
            🔍 Zoom
          </button>
          <button className="toolbar-button" disabled>
            ⚙️ Settings
          </button>
        </div>
      </div>
      <div className="canvas-workspace">
        <div className="canvas-grid"></div>
        <div
          className={`canvas-content ${isDragOver ? "drag-over" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {canvasElements.length === 0 ? (
            <div className="canvas-placeholder">
              <h3>Canvas Workspace</h3>
              <p>Drag components from Element Library to add them</p>
              <p>Mode: {mode}</p>
            </div>
          ) : (
            <>
              {canvasElements.map((element) => {
                // Generate stable element ID and CSS class (should be done once when element is created)
                const elementId =
                  element.elementId ||
                  `${element.type}-${element.id}-${Math.random()
                    .toString(36)
                    .substr(2, 9)}`;
                const cssClass =
                  element.cssClass ||
                  `component-${element.type.toLowerCase()} rx-comp-${
                    element.type
                  }-${Math.random().toString(36).substr(2, 6)}`;

                // Render component using data-driven approach
                return (
                  <CanvasElement
                    key={element.id}
                    element={element}
                    elementId={elementId}
                    cssClass={cssClass}
                    onDragStart={onCanvasElementDragStart}
                  />
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Canvas;
