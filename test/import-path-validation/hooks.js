/**
 * Symphony Hooks File - Tests EventBus and Conductor import patterns
 * This file should trigger specific import path violations based on C# rules
 */

// VIOLATION: EventBus import with wrong path depth
import { EventBus } from '../../EventBus.js';

// VIOLATION: Conductor import with wrong path depth  
import { Conductor } from '../../../../sequences/index.js';

// Valid internal imports (should pass)
import { HookHelpers } from './hook-helpers.js';
import { Constants } from './constants.js';

export class SymphonyHooks {
  constructor() {
    console.log('Symphony hooks with import violations');
  }

  setupEventHandlers() {
    // EventBus should be imported from ../../../../EventBus.ts
    EventBus.on('test-event', this.handleEvent);
  }

  initializeConductor() {
    // Conductor should be imported from ../../../index.ts
    return new Conductor();
  }

  handleEvent(data) {
    console.log('Handling event:', data);
  }
}

export default SymphonyHooks;
