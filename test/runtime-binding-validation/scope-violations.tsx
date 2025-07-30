/**
 * Scope Violations Test File
 * Contains cross-component scope violations
 */

import React from 'react';

// Component A with private functions
const CanvasEditor = () => {
  // Private function - should not be accessible from other components
  const handleCanvasResize = (width, height) => {
    console.log(`Resizing canvas to ${width}x${height}`);
  };

  // Private function - should not be accessible from other components
  const validateCanvasSize = (size) => {
    return size.width > 0 && size.height > 0;
  };

  return (
    <div className="canvas-editor">
      <canvas width={800} height={600} />
    </div>
  );
};

// Component B trying to access Component A's functions
const CanvasToolbar = () => {
  const handleResizeClick = () => {
    // Scope violation: handleCanvasResize is private to CanvasEditor
    handleCanvasResize(1024, 768);
  };

  const handleValidateClick = () => {
    // Scope violation: validateCanvasSize is private to CanvasEditor
    const isValid = validateCanvasSize({ width: 800, height: 600 });
    console.log('Canvas size valid:', isValid);
  };

  return (
    <div className="toolbar">
      <button onClick={handleResizeClick}>Resize Canvas</button>
      <button onClick={handleValidateClick}>Validate Size</button>
    </div>
  );
};

// Component C with nested components and scope issues
const SymphonyController = () => {
  const startSymphony = (name) => {
    console.log(`Starting symphony: ${name}`);
  };

  const stopSymphony = () => {
    console.log('Stopping symphony');
  };

  // Nested component trying to access parent functions without props
  const SymphonyButton = () => {
    const handleStart = () => {
      // Scope violation: startSymphony is in parent scope but not passed as prop
      startSymphony('canvas-drag-symphony');
    };

    const handleStop = () => {
      // Scope violation: stopSymphony is in parent scope but not passed as prop
      stopSymphony();
    };

    return (
      <div>
        <button onClick={handleStart}>Start</button>
        <button onClick={handleStop}>Stop</button>
      </div>
    );
  };

  return (
    <div className="symphony-controller">
      <SymphonyButton />
    </div>
  );
};

// Component D with class-based scope issues
class ClassBasedComponent extends React.Component {
  // Private method
  validateInput(input) {
    return input && input.length > 0;
  }

  // Private method
  processData(data) {
    return data.map(item => item.toUpperCase());
  }

  render() {
    return <div>Class Component</div>;
  }
}

// Functional component trying to access class methods
const FunctionalComponent = () => {
  const handleProcess = () => {
    const data = ['test', 'data'];
    
    // Scope violation: processData is a method of ClassBasedComponent
    const processed = processData(data);
    console.log('Processed:', processed);
  };

  const handleValidate = () => {
    // Scope violation: validateInput is a method of ClassBasedComponent
    const isValid = validateInput('test input');
    console.log('Valid:', isValid);
  };

  return (
    <div>
      <button onClick={handleProcess}>Process</button>
      <button onClick={handleValidate}>Validate</button>
    </div>
  );
};

// Component E with hook scope issues
const useCustomHook = () => {
  const hookFunction = () => {
    console.log('Hook function called');
  };

  return { hookFunction };
};

const ComponentUsingHook = () => {
  const { hookFunction } = useCustomHook();

  const handleClick = () => {
    // Valid: hookFunction is properly returned from hook
    hookFunction();
  };

  return <button onClick={handleClick}>Use Hook</button>;
};

const ComponentNotUsingHook = () => {
  const handleClick = () => {
    // Scope violation: hookFunction is only available through useCustomHook
    hookFunction();
  };

  return <button onClick={handleClick}>Invalid Hook Usage</button>;
};

export { CanvasEditor, CanvasToolbar, SymphonyController, ClassBasedComponent, FunctionalComponent };
