/**
 * Symphony Registry File - Tests EventBus and Event Types import patterns
 * This file should trigger specific import path violations based on C# rules
 */

// VIOLATION: EventBus import with wrong path depth
import { EventBus } from '../../../EventBus.js';

// VIOLATION: Event types import with wrong path depth
import { ButtonEventTypes } from '../../event-types/core/button.event-types.js';

// Valid internal imports (should pass)
import { RegistryHelpers } from './registry-helpers.js';

export class SymphonyRegistry {
  constructor() {
    console.log('Symphony registry with import violations');
  }

  registerEvents() {
    // EventBus should be imported from ../../../../EventBus.ts
    EventBus.register('button-click', this.handleButtonClick);
    
    // Event types should be imported from ../../../../event-types/core/button.event-types.ts
    console.log('Button events:', ButtonEventTypes);
  }

  handleButtonClick(data) {
    console.log('Button clicked:', data);
  }
}

export default SymphonyRegistry;
