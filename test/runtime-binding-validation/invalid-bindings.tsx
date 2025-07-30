/**
 * Invalid Runtime Bindings Test File
 * Contains function binding violations that should be detected
 */

import React, { useState } from 'react';

// Invalid: Function called but not defined
const ComponentWithUndefinedFunction = () => {
  const handleClick = () => {
    // Invalid: undefinedFunction is not defined anywhere
    undefinedFunction();
  };

  return <button onClick={handleClick}>Click me</button>;
};

// Invalid: Cross-component scope violation
const ComponentA = () => {
  const componentAFunction = () => {
    console.log('Function in Component A');
  };

  return <div>Component A</div>;
};

const ComponentB = () => {
  const handleAction = () => {
    // Invalid: componentAFunction is defined in ComponentA, not accessible here
    componentAFunction();
  };

  return <button onClick={handleAction}>Action</button>;
};

// Invalid: Function called before definition (hoisting issue)
const ComponentWithHoistingIssue = () => {
  const handleClick = () => {
    // Invalid: laterDefinedFunction is called before it's defined
    laterDefinedFunction();
  };

  // Function defined after it's called (arrow functions don't hoist)
  const laterDefinedFunction = () => {
    console.log('This function is defined later');
  };

  return <button onClick={handleClick}>Click me</button>;
};

// Invalid: Missing import
const ComponentWithMissingImport = () => {
  const handleSubmit = () => {
    // Invalid: validateForm is not imported or defined
    const isValid = validateForm();
    if (isValid) {
      console.log('Form is valid');
    }
  };

  return <button onClick={handleSubmit}>Submit</button>;
};

// Invalid: Typo in function name
const ComponentWithTypo = () => {
  const handleFormSubmit = (data) => {
    console.log('Submitting:', data);
  };

  const handleClick = () => {
    // Invalid: handleFormSubit (missing 'm') - typo in function name
    handleFormSubit({ name: 'test' });
  };

  return <button onClick={handleClick}>Submit Form</button>;
};

// Invalid: Function from different scope
const OuterComponent = () => {
  const outerFunction = () => {
    console.log('Outer function');
  };

  const InnerComponent = () => {
    const handleInnerClick = () => {
      // Invalid: outerFunction is in parent scope but not passed as prop
      outerFunction();
    };

    return <button onClick={handleInnerClick}>Inner Button</button>;
  };

  return (
    <div>
      <InnerComponent />
    </div>
  );
};

// Invalid: Undefined method call
const ComponentWithUndefinedMethod = () => {
  const data = { name: 'test' };

  const handleProcess = () => {
    // Invalid: processData method doesn't exist on data object
    data.processData();
  };

  return <button onClick={handleProcess}>Process</button>;
};

export default ComponentWithUndefinedFunction;
