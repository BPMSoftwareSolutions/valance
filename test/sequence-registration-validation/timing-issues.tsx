/**
 * Sequence Registration Timing Issues Test File
 * Contains timing-related registration violations
 */

import React, { useEffect, useState } from 'react';

// Mock conductor for testing
const conductor = {
  defineSequence: (name, sequence) => {
    console.log(`Defining sequence: ${name}`);
  },
  startSequence: (name, params) => {
    console.log(`Starting sequence: ${name}`, params);
  }
};

// Timing Issue 1: App.tsx calling sequence before component registration
const App = () => {
  // This would typically be in App.tsx - called immediately on app load
  const initializeCanvas = () => {
    // Timing issue: canvas-initialization-symphony might not be registered yet
    conductor.startSequence('canvas-initialization-symphony', {
      canvasSize: { width: 800, height: 600 }
    });
  };

  useEffect(() => {
    // Called immediately when app loads
    initializeCanvas();
  }, []);

  return (
    <div className="app">
      <CanvasWithHookRegistration />
    </div>
  );
};

// Component that registers sequences in useEffect (might be too late)
const CanvasWithHookRegistration = () => {
  useEffect(() => {
    // Registration happens in useEffect - might be after App initialization
    const CANVAS_INIT_SEQUENCE = {
      name: 'canvas-initialization-symphony',
      movements: [
        { name: 'setup-canvas', beats: ['create-context', 'set-dimensions'] },
        { name: 'load-assets', beats: ['load-images', 'prepare-tools'] }
      ]
    };

    conductor.defineSequence('canvas-initialization-symphony', CANVAS_INIT_SEQUENCE);
  }, []);

  return <canvas width={800} height={600} />;
};

// Timing Issue 2: Sequence called in constructor/immediate execution
class ImmediateCallComponent extends React.Component {
  constructor(props) {
    super(props);
    
    // Timing issue: Sequence called in constructor before any registration
    conductor.startSequence('constructor-symphony', {
      componentName: 'ImmediateCallComponent'
    });
  }

  componentDidMount() {
    // Registration happens after constructor call
    const CONSTRUCTOR_SEQUENCE = {
      name: 'constructor-symphony',
      movements: [
        { name: 'initialize-component', beats: ['set-state', 'bind-methods'] }
      ]
    };

    conductor.defineSequence('constructor-symphony', CONSTRUCTOR_SEQUENCE);
  }

  render() {
    return <div>Immediate Call Component</div>;
  }
}

// Timing Issue 3: Async registration with synchronous call
const AsyncRegistrationComponent = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Async registration
    const registerSequenceAsync = async () => {
      // Simulate async operation (e.g., loading from server)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const ASYNC_SEQUENCE = {
        name: 'async-loaded-symphony',
        movements: [
          { name: 'async-action', beats: ['process-data', 'update-ui'] }
        ]
      };

      conductor.defineSequence('async-loaded-symphony', ASYNC_SEQUENCE);
      setIsReady(true);
    };

    registerSequenceAsync();
  }, []);

  const handleClick = () => {
    // Timing issue: Sequence might not be registered yet if called before async completes
    conductor.startSequence('async-loaded-symphony', {
      timestamp: Date.now()
    });
  };

  return (
    <button onClick={handleClick} disabled={!isReady}>
      Start Async Sequence
    </button>
  );
};

// Timing Issue 4: Conditional registration with race condition
const ConditionalRaceComponent = ({ shouldRegister }) => {
  const [sequenceRegistered, setSequenceRegistered] = useState(false);

  useEffect(() => {
    if (shouldRegister) {
      // Async registration with delay
      setTimeout(() => {
        const CONDITIONAL_SEQUENCE = {
          name: 'conditional-race-symphony',
          movements: [
            { name: 'conditional-action', beats: ['check-condition', 'execute'] }
          ]
        };

        conductor.defineSequence('conditional-race-symphony', CONDITIONAL_SEQUENCE);
        setSequenceRegistered(true);
      }, 500);
    }
  }, [shouldRegister]);

  const handleClick = () => {
    // Timing issue: User might click before registration completes
    conductor.startSequence('conditional-race-symphony', {
      condition: shouldRegister
    });
  };

  return (
    <button onClick={handleClick}>
      Start Conditional Sequence (Registered: {sequenceRegistered.toString()})
    </button>
  );
};

// Timing Issue 5: Multiple components registering same sequence
const FirstComponent = () => {
  useEffect(() => {
    const SHARED_SEQUENCE = {
      name: 'shared-symphony',
      movements: [
        { name: 'shared-action', beats: ['first-beat', 'second-beat'] }
      ]
    };

    // First component registers the sequence
    conductor.defineSequence('shared-symphony', SHARED_SEQUENCE);
  }, []);

  const handleClick = () => {
    conductor.startSequence('shared-symphony', { source: 'first' });
  };

  return <button onClick={handleClick}>First Component</button>;
};

const SecondComponent = () => {
  // Second component assumes sequence is registered but doesn't register it
  const handleClick = () => {
    // Timing issue: Depends on FirstComponent being mounted first
    conductor.startSequence('shared-symphony', { source: 'second' });
  };

  return <button onClick={handleClick}>Second Component</button>;
};

// Timing Issue 6: Sequence called in event handler before component mount
const EventHandlerTimingComponent = () => {
  // Event handler defined immediately (could be called before useEffect)
  const handleGlobalEvent = () => {
    // Timing issue: Global event might trigger before component mounts
    conductor.startSequence('global-event-symphony', {
      eventType: 'global'
    });
  };

  useEffect(() => {
    // Register global event listener
    window.addEventListener('custom-event', handleGlobalEvent);

    // Register sequence after event listener (potential race condition)
    const GLOBAL_EVENT_SEQUENCE = {
      name: 'global-event-symphony',
      movements: [
        { name: 'handle-global-event', beats: ['process-event', 'update-state'] }
      ]
    };

    conductor.defineSequence('global-event-symphony', GLOBAL_EVENT_SEQUENCE);

    return () => {
      window.removeEventListener('custom-event', handleGlobalEvent);
    };
  }, []);

  return <div>Event Handler Timing Component</div>;
};

// Timing Issue 7: Lazy-loaded component with immediate sequence call
const LazyLoadedComponent = React.lazy(() => {
  // Sequence called during lazy loading
  conductor.startSequence('lazy-load-symphony', {
    loadTime: Date.now()
  });

  return Promise.resolve({
    default: () => <div>Lazy Loaded Component</div>
  });
});

// The sequence registration happens elsewhere, potentially after lazy loading
const LazySequenceRegistration = () => {
  useEffect(() => {
    const LAZY_LOAD_SEQUENCE = {
      name: 'lazy-load-symphony',
      movements: [
        { name: 'lazy-load-action', beats: ['load-component', 'render'] }
      ]
    };

    conductor.defineSequence('lazy-load-symphony', LAZY_LOAD_SEQUENCE);
  }, []);

  return null; // Just for registration
};

export {
  App,
  CanvasWithHookRegistration,
  ImmediateCallComponent,
  AsyncRegistrationComponent,
  ConditionalRaceComponent,
  FirstComponent,
  SecondComponent,
  EventHandlerTimingComponent,
  LazyLoadedComponent,
  LazySequenceRegistration
};
