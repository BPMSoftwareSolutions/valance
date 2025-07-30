/**
 * Valid Runtime Bindings Test File
 * All functions should be properly accessible in their scopes
 */

import React, { useState, useEffect } from 'react';
import { validateInput } from '../utils/validation';

// Valid: Function defined and used in same scope
const CanvasComponent = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Valid: Function defined in component scope
  const handleDragStart = (event) => {
    const rect = event.target.getBoundingClientRect();
    setPosition({ x: rect.left, y: rect.top });
  };

  // Valid: Function defined in component scope
  const handleDragEnd = () => {
    console.log('Drag ended at position:', position);
  };

  // Valid: Using imported function
  const validatePosition = (pos) => {
    return validateInput(pos.x) && validateInput(pos.y);
  };

  // Valid: Using React hooks (imported)
  useEffect(() => {
    if (validatePosition(position)) {
      console.log('Position is valid');
    }
  }, [position]);

  return (
    <div
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      style={{ position: 'absolute', left: position.x, top: position.y }}
    >
      Canvas Element
    </div>
  );
};

// Valid: Function passed as prop
const ParentComponent = () => {
  const handleChildAction = (data) => {
    console.log('Child action:', data);
  };

  return <ChildComponent onAction={handleChildAction} />;
};

// Valid: Using prop function
const ChildComponent = ({ onAction }) => {
  const handleClick = () => {
    // Valid: onAction is passed as prop
    onAction('clicked');
  };

  return <button onClick={handleClick}>Click me</button>;
};

// Valid: Global function
function globalUtility() {
  return 'utility result';
}

// Valid: Using global function
const ComponentUsingGlobal = () => {
  const result = globalUtility();
  return <div>{result}</div>;
};

export default CanvasComponent;
