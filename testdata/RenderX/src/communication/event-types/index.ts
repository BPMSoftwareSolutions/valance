/**
 * Event Types Index
 * Central export point for all event type definitions
 * 
 * This follows the legacy RX.React pattern:
 * import { EVENT_TYPES } from './event-types/index.js';
 */

// Import all event type modules
import { CORE_EVENT_TYPES, type CoreEventType } from './core.event-types';
import { CANVAS_EVENT_TYPES, type CanvasEventType } from './canvas.event-types';
import { CONTROL_PANEL_EVENT_TYPES, type ControlPanelEventType } from './control-panel.event-types';
import { LAYOUT_EVENT_TYPES, type LayoutEventType } from './layout.event-types';
import { ELEMENT_LIBRARY_EVENT_TYPES, type ElementLibraryEventType } from './element-library.event-types';

// Import musical conductor event types from sequences
import { MUSICAL_CONDUCTOR_EVENT_TYPES, type MusicalConductorEventType } from '../sequences/SequenceTypes';

/**
 * Consolidated EVENT_TYPES object
 * Combines all event types into a single object for easy access
 */
export const EVENT_TYPES = {
  // Core Events
  ...CORE_EVENT_TYPES,
  
  // Canvas Events
  ...CANVAS_EVENT_TYPES,
  
  // Control Panel Events
  ...CONTROL_PANEL_EVENT_TYPES,
  
  // Layout Events
  ...LAYOUT_EVENT_TYPES,
  
  // Element Library Events
  ...ELEMENT_LIBRARY_EVENT_TYPES,
  
  // Musical Conductor Events
  ...MUSICAL_CONDUCTOR_EVENT_TYPES
} as const;

/**
 * Union type of all event types
 */
export type EventType = 
  | CoreEventType
  | CanvasEventType
  | ControlPanelEventType
  | LayoutEventType
  | ElementLibraryEventType
  | MusicalConductorEventType;

/**
 * Individual event type exports for specific use cases
 */
export {
  CORE_EVENT_TYPES,
  CANVAS_EVENT_TYPES,
  CONTROL_PANEL_EVENT_TYPES,
  LAYOUT_EVENT_TYPES,
  ELEMENT_LIBRARY_EVENT_TYPES,
  MUSICAL_CONDUCTOR_EVENT_TYPES
};

export type {
  CoreEventType,
  CanvasEventType,
  ControlPanelEventType,
  LayoutEventType,
  ElementLibraryEventType,
  MusicalConductorEventType
};

/**
 * Event Categories
 * Organizational categories for different types of events
 */
export const EVENT_CATEGORIES = {
  CORE: 'core',
  CANVAS: 'canvas',
  CONTROL_PANEL: 'control-panel',
  LAYOUT: 'layout',
  ELEMENT_LIBRARY: 'element-library',
  MUSICAL_CONDUCTOR: 'musical-conductor'
} as const;

export type EventCategory = typeof EVENT_CATEGORIES[keyof typeof EVENT_CATEGORIES];

/**
 * Get event category for a given event type
 * @param eventType - The event type to categorize
 * @returns The category of the event type
 */
export function getEventCategory(eventType: string): EventCategory | null {
  if (Object.values(CORE_EVENT_TYPES).includes(eventType as any)) {
    return EVENT_CATEGORIES.CORE;
  }
  if (Object.values(CANVAS_EVENT_TYPES).includes(eventType as any)) {
    return EVENT_CATEGORIES.CANVAS;
  }
  if (Object.values(CONTROL_PANEL_EVENT_TYPES).includes(eventType as any)) {
    return EVENT_CATEGORIES.CONTROL_PANEL;
  }
  if (Object.values(LAYOUT_EVENT_TYPES).includes(eventType as any)) {
    return EVENT_CATEGORIES.LAYOUT;
  }
  if (Object.values(ELEMENT_LIBRARY_EVENT_TYPES).includes(eventType as any)) {
    return EVENT_CATEGORIES.ELEMENT_LIBRARY;
  }
  if (Object.values(MUSICAL_CONDUCTOR_EVENT_TYPES).includes(eventType as any)) {
    return EVENT_CATEGORIES.MUSICAL_CONDUCTOR;
  }
  return null;
}

/**
 * Get all event types for a specific category
 * @param category - The category to get events for
 * @returns Array of event types in the category
 */
export function getEventsByCategory(category: EventCategory): string[] {
  switch (category) {
    case EVENT_CATEGORIES.CORE:
      return Object.values(CORE_EVENT_TYPES);
    case EVENT_CATEGORIES.CANVAS:
      return Object.values(CANVAS_EVENT_TYPES);
    case EVENT_CATEGORIES.CONTROL_PANEL:
      return Object.values(CONTROL_PANEL_EVENT_TYPES);
    case EVENT_CATEGORIES.LAYOUT:
      return Object.values(LAYOUT_EVENT_TYPES);
    case EVENT_CATEGORIES.ELEMENT_LIBRARY:
      return Object.values(ELEMENT_LIBRARY_EVENT_TYPES);
    case EVENT_CATEGORIES.MUSICAL_CONDUCTOR:
      return Object.values(MUSICAL_CONDUCTOR_EVENT_TYPES);
    default:
      return [];
  }
}
