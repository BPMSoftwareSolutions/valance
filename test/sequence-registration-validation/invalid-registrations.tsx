/**
 * Invalid Sequence Registrations Test File
 * Contains sequence registration violations that should be detected
 */

import React, { useEffect } from 'react';

// Mock conductor for testing
const conductor = {
  startSequence: (name, params) => {
    console.log(`Starting sequence: ${name}`, params);
  }
};

// Invalid: Sequence called but never registered
const UnregisteredSequenceComponent = () => {
  const handleClick = () => {
    // Invalid: canvas-unregistered-symphony is never registered
    conductor.startSequence('canvas-unregistered-symphony', {
      action: 'test'
    });
  };

  return <button onClick={handleClick}>Start Unregistered Sequence</button>;
};

// Invalid: Sequence called before registration
const EarlyCallComponent = () => {
  const handleEarlyClick = () => {
    // Invalid: canvas-late-registration-symphony is called before registration
    conductor.startSequence('canvas-late-registration-symphony', {});
  };

  // Registration happens after the component definition (too late)
  useEffect(() => {
    const LATE_SEQUENCE = {
      name: 'canvas-late-registration-symphony',
      movements: [{ name: 'late-action', beats: ['delayed-beat'] }]
    };
    
    conductor.defineSequence('canvas-late-registration-symphony', LATE_SEQUENCE);
  }, []);

  return <button onClick={handleEarlyClick}>Early Call</button>;
};

// Invalid: Typo in sequence name
const TypoSequenceComponent = () => {
  useEffect(() => {
    const CORRECT_SEQUENCE = {
      name: 'canvas-correct-symphony',
      movements: [{ name: 'correct-action', beats: ['correct-beat'] }]
    };
    
    conductor.defineSequence('canvas-correct-symphony', CORRECT_SEQUENCE);
  }, []);

  const handleClick = () => {
    // Invalid: canvas-corect-symphony (missing 'r') - typo in sequence name
    conductor.startSequence('canvas-corect-symphony', {});
  };

  return <button onClick={handleClick}>Start Sequence with Typo</button>;
};

// Invalid: Missing registration in App.tsx (timing issue)
const AppComponent = () => {
  // Invalid: Calling sequence in App.tsx before any registration
  const initializeApp = () => {
    conductor.startSequence('app-initialization-symphony', {
      appVersion: '1.0.0'
    });
  };

  useEffect(() => {
    initializeApp();
  }, []);

  return <div>App Component</div>;
};

// Invalid: Sequence registration in hook but called in parent
const HookRegistrationIssue = () => {
  const useSequenceHook = () => {
    useEffect(() => {
      const HOOK_SEQUENCE = {
        name: 'hook-registered-symphony',
        movements: [{ name: 'hook-action', beats: ['hook-beat'] }]
      };
      
      conductor.defineSequence('hook-registered-symphony', HOOK_SEQUENCE);
    }, []);
  };

  // Hook is defined but not called
  const handleClick = () => {
    // Invalid: hook-registered-symphony is registered in hook but hook is not used
    conductor.startSequence('hook-registered-symphony', {});
  };

  return <button onClick={handleClick}>Use Hook Sequence</button>;
};

// Invalid: Conditional registration but unconditional call
const ConditionalRegistrationIssue = ({ enableFeature }) => {
  useEffect(() => {
    if (enableFeature) {
      const CONDITIONAL_SEQUENCE = {
        name: 'conditional-symphony',
        movements: [{ name: 'conditional-action', beats: ['conditional-beat'] }]
      };
      
      conductor.defineSequence('conditional-symphony', CONDITIONAL_SEQUENCE);
    }
  }, [enableFeature]);

  const handleClick = () => {
    // Invalid: conditional-symphony might not be registered if enableFeature is false
    conductor.startSequence('conditional-symphony', {});
  };

  return <button onClick={handleClick}>Start Conditional Sequence</button>;
};

// Invalid: Wrong sequence name format
const WrongFormatComponent = () => {
  useEffect(() => {
    const WRONG_FORMAT_SEQUENCE = {
      name: 'WrongFormatSequence', // Should be kebab-case with -symphony suffix
      movements: [{ name: 'wrong-action', beats: ['wrong-beat'] }]
    };
    
    conductor.defineSequence('WrongFormatSequence', WRONG_FORMAT_SEQUENCE);
  }, []);

  const handleClick = () => {
    // Invalid: Using wrong format sequence name
    conductor.startSequence('WrongFormatSequence', {});
  };

  return <button onClick={handleClick}>Wrong Format</button>;
};

// Invalid: Multiple calls to unregistered sequences
const MultipleUnregisteredCalls = () => {
  const handleAction1 = () => {
    // Invalid: first-unregistered-symphony is not registered
    conductor.startSequence('first-unregistered-symphony', {});
  };

  const handleAction2 = () => {
    // Invalid: second-unregistered-symphony is not registered
    conductor.startSequence('second-unregistered-symphony', {});
  };

  const handleAction3 = () => {
    // Invalid: third-unregistered-symphony is not registered
    conductor.startSequence('third-unregistered-symphony', {});
  };

  return (
    <div>
      <button onClick={handleAction1}>Action 1</button>
      <button onClick={handleAction2}>Action 2</button>
      <button onClick={handleAction3}>Action 3</button>
    </div>
  );
};

// Invalid: Sequence called in different file than registration
const CrossFileIssue = () => {
  const handleClick = () => {
    // Invalid: cross-file-symphony might be registered in another file
    // but validator can't find the registration
    conductor.startSequence('cross-file-symphony', {});
  };

  return <button onClick={handleClick}>Cross File Call</button>;
};

// Invalid: Dynamic sequence name (hard to validate)
const DynamicSequenceName = ({ sequenceType }) => {
  const handleClick = () => {
    const sequenceName = `canvas-${sequenceType}-symphony`;
    
    // Invalid: Dynamic sequence names are hard to validate
    conductor.startSequence(sequenceName, {});
  };

  return <button onClick={handleClick}>Dynamic Sequence</button>;
};

export {
  UnregisteredSequenceComponent,
  EarlyCallComponent,
  TypoSequenceComponent,
  AppComponent,
  HookRegistrationIssue,
  ConditionalRegistrationIssue,
  WrongFormatComponent,
  MultipleUnregisteredCalls,
  CrossFileIssue,
  DynamicSequenceName
};
