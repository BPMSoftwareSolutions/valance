// Invalid trigger patterns for CIA Sequence Trigger Mapping Validator
import React, { useState, useEffect } from "react";
import { MusicalConductor } from "./communication/sequences/MusicalConductor";

const App: React.FC = () => {
  const [conductor, setConductor] = useState<MusicalConductor | null>(null);

  useEffect(() => {
    // Initialize conductor
    const musicalConductor = new MusicalConductor();
    setConductor(musicalConductor);
  }, []);

  // ❌ INVALID: No sequence triggers at all
  const handleDragStart = (element: any, dragData: any) => {
    if (conductor) {
      console.log("🎼 Should start sequence but doesn't...");
      
      // Missing conductor.startSequence() call
      // This should be flagged by the validator as a missing trigger
      console.log("Drag started but no sequence triggered");
    }
  };

  // ❌ INVALID: Direct event emission instead of sequence
  const handleDirectEvent = (data: any) => {
    // This bypasses the conductor system entirely
    window.dispatchEvent(new CustomEvent('drag-start', { detail: data }));
    
    // Should use conductor.startSequence() instead
  };

  // ❌ INVALID: Commented out sequence trigger
  const handleCommentedTrigger = (element: any) => {
    if (conductor) {
      // conductor.startSequence('Canvas Component Drag Symphony No. 4', {
      //   element,
      //   timestamp: Date.now()
      // });
      
      console.log("Sequence trigger is commented out");
    }
  };

  // ❌ INVALID: Incorrect method name
  const handleWrongMethod = (sequenceName: string, data: any) => {
    if (conductor) {
      // Wrong method - should be startSequence, not playSequence
      // conductor.playSequence(sequenceName, data);
      
      // Wrong method - should be executeMovementHandler, not runMovement
      // conductor.runMovement('test-sequence', 'onDragStart', data);
      
      console.log("Using wrong method names");
    }
  };

  // ❌ INVALID: Sequence defined but never triggered
  const defineSequenceButNeverUse = () => {
    const mySequence = {
      name: 'Unused Symphony No. 1',
      description: 'This sequence is defined but never triggered',
      key: 'C Major',
      tempo: 120,
      movements: [
        { name: 'UnusedMovement', beats: [] }
      ]
    };

    // Sequence is defined but conductor.startSequence() is never called
    console.log("Sequence defined but not triggered:", mySequence.name);
  };

  // ❌ INVALID: Plugin registered but no triggers
  const registerPluginWithoutTriggers = () => {
    if (conductor) {
      const pluginSequence = {
        name: 'Orphaned Plugin Symphony',
        description: 'Plugin that gets registered but never triggered',
        key: 'D Minor',
        tempo: 100,
        movements: []
      };

      const pluginHandlers = {
        onStart: () => console.log('This handler will never be called')
      };

      // Plugin is mounted but no triggers exist in App.tsx
      conductor.mount(pluginSequence, pluginHandlers);
      
      // Missing: conductor.startSequence('Orphaned Plugin Symphony', ...)
    }
  };

  return (
    <div className="app">
      <h1>Invalid Trigger Patterns</h1>
      <p>This App.tsx has no valid sequence triggers</p>
      
      <button onClick={() => handleDragStart({ id: 'test' }, { x: 0, y: 0 })}>
        Drag Start (No Trigger)
      </button>
      <button onClick={() => handleDirectEvent({ type: 'direct' })}>
        Direct Event (Bypasses Conductor)
      </button>
      <button onClick={() => handleCommentedTrigger({ id: 'commented' })}>
        Commented Trigger
      </button>
      <button onClick={() => handleWrongMethod('test', {})}>
        Wrong Method Names
      </button>
      <button onClick={() => defineSequenceButNeverUse()}>
        Define But Never Use
      </button>
      <button onClick={() => registerPluginWithoutTriggers()}>
        Register Without Triggers
      </button>
    </div>
  );
};

export default App;
