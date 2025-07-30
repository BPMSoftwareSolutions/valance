/**
 * Test file for Architecture Violation Detection
 * Contains various architectural violations to test the validator
 */

// ❌ DIRECT_EVENTBUS_EMIT - Critical violation
function handleButtonClick() {
  eventBus.emit('button-clicked', { id: 'submit-btn' });
  return true;
}

// ❌ CONDUCTOR_EMIT_EVENT - Critical violation  
function triggerSequence() {
  conductor.emitEvent('canvas-drag-start', { x: 100, y: 200 });
}

// ❌ DIRECT_EXECUTE_MOVEMENT - Critical violation
function executeCanvasMovement() {
  conductor.executeMovement('drag-movement', { duration: 500 });
}

// ❌ DIRECT_EXECUTE_BEAT - Error violation (outside sequence context)
function handleDragEnd() {
  conductor.executeBeat('drag-end-beat');
}

// ❌ INCORRECT_EVENTBUS_METHOD - Critical violation
function setupEventListeners() {
  eventBus.on('canvas-ready', handleCanvasReady);
  eventBus.addEventListener('resize', handleResize);
  eventBus.off('old-event', oldHandler);
}

// ❌ STATIC_EVENTBUS_EMIT - Critical violation
function notifyGlobalState() {
  EventBus.emit('global-state-change', newState);
}

// ❌ GENERIC_EMIT_PATTERN - Warning violation
function customEmitter() {
  myEmitter.emit('custom-event', data);
  this.emit('instance-event', payload);
}

// ❌ CUSTOM_EVENT_DISPATCH - Error violation
function dispatchCustomEvent() {
  dispatchEvent(new CustomEvent('my-event'));
  fireEvent('legacy-event', data);
  triggerEvent('manual-trigger');
  sendEvent('notification', message);
}

// ❌ DOM_EVENT_DISPATCH - Error violation
function dispatchDOMEvent() {
  document.dispatchEvent(new Event('dom-ready'));
}

// ❌ WINDOW_EVENT_DISPATCH - Warning violation
function windowCommunication() {
  window.dispatchEvent(new Event('app-ready'));
  window.postMessage({ type: 'cross-frame' }, '*');
}

// ✅ Valid patterns that should NOT trigger violations
function validPatterns() {
  // Valid MusicalSequences usage
  MusicalSequences.startCanvasFlow('drag-sequence', { x: 100, y: 200 });
  
  // Valid eventBus subscription pattern
  const unsubscribe = eventBus.subscribe('canvas-ready', handleCanvasReady);
  
  // Valid conductor usage within sequence context (would be in sequence.ts file)
  // conductor.executeBeat({ eventType: 'DRAG_START', data: {} });
  
  // Valid imports and comments should be ignored
  // import { eventBus } from './eventBus';
  /* conductor.emit() in comments should be ignored */
}

// Test edge cases
function edgeCases() {
  // Should detect even with extra whitespace
  eventBus.emit(  'spaced-event'  ,   data   );
  
  // Should detect with single quotes
  conductor.emitEvent('single-quote-event', payload);
  
  // Should detect with template literals (if supported)
  const eventName = 'dynamic-event';
  eventBus.emit(eventName, data); // This might not be caught by regex
}
