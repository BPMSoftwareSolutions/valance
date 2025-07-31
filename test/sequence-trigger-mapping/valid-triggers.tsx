// Valid trigger patterns for CIA Sequence Trigger Mapping Validator
import React, { useState, useEffect } from "react";
import { MusicalConductor } from "./communication/sequences/MusicalConductor";
import { startCanvasComponentDragFlow } from "./communication/sequences/canvas-sequences";

const App: React.FC = () => {
  const [conductor, setConductor] = useState<MusicalConductor | null>(null);

  useEffect(() => {
    // Initialize conductor
    const musicalConductor = new MusicalConductor();
    setConductor(musicalConductor);
  }, []);

  // ✅ VALID: conductor.startSequence() call
  const handleDragStart = (element: any, dragData: any) => {
    if (conductor) {
      console.log("🎼 Starting Component Drag Symphony...");
      
      // This should be detected by the validator
      conductor.startSequence('Canvas Component Drag Symphony No. 4', {
        element,
        dragData,
        timestamp: Date.now(),
        source: 'app-drag-start'
      });
    }
  };

  // ✅ VALID: conductor.executeMovementHandler() call
  const handleMovementExecution = (sequenceId: string, movement: string, data: any) => {
    if (conductor) {
      console.log(`🎼 Executing movement: ${movement}`);
      
      // This should be detected by the validator
      conductor.executeMovementHandler(sequenceId, movement, data);
    }
  };

  // ✅ VALID: Convenience function call
  const handleCanvasDrag = (element: any, eventData: any) => {
    if (conductor) {
      console.log("🎼 Starting Canvas Component Drag Flow...");
      
      // This should be detected by the validator
      startCanvasComponentDragFlow(
        conductor,
        element,
        eventData,
        [], // elements
        undefined, // setElements
        undefined  // syncElementCSS
      );
    }
  };

  // ✅ VALID: Multiple sequence triggers
  const handleLayoutChange = (mode: string) => {
    if (conductor) {
      // Multiple valid triggers
      conductor.startSequence('Layout Mode Change Symphony No. 2', {
        previousMode: 'editor',
        currentMode: mode,
        timestamp: Date.now()
      });

      conductor.startSequence('Panel Toggle Symphony No. 1', {
        panelType: 'elementLibrary',
        newState: true,
        timestamp: Date.now()
      });
    }
  };

  // ✅ VALID: Sequence trigger with string interpolation
  const handleDynamicSequence = (sequenceName: string, data: any) => {
    if (conductor) {
      // This should still be detected even with template literals
      conductor.startSequence(`${sequenceName} Symphony No. 1`, data);
    }
  };

  return (
    <div className="app">
      <h1>Valid Trigger Patterns</h1>
      <button onClick={() => handleDragStart({ id: 'test' }, { x: 0, y: 0 })}>
        Start Drag Sequence
      </button>
      <button onClick={() => handleMovementExecution('test-sequence', 'onDragStart', {})}>
        Execute Movement
      </button>
      <button onClick={() => handleCanvasDrag({ id: 'canvas-element' }, { type: 'drag' })}>
        Canvas Drag Flow
      </button>
      <button onClick={() => handleLayoutChange('preview')}>
        Change Layout
      </button>
      <button onClick={() => handleDynamicSequence('Custom', { data: 'test' })}>
        Dynamic Sequence
      </button>
    </div>
  );
};

export default App;
