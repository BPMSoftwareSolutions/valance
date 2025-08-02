/**
 * TypeScript interfaces for JSON Component structure
 * Used by the lightweight shell to load and display components
 */

export interface JsonComponentMetadata {
  type: string;
  name: string;
  version: string;
  author: string;
  description: string;
  category: string;
  tags: string[];
  icon?: string;
  replaces?: string;
}

export interface JsonComponentStyles {
  css: string;
  variables: Record<string, string>;
}

export interface JsonComponentUI {
  template: string;
  styles: JsonComponentStyles;
}

export interface JsonComponentPropertySchema {
  type: "string" | "number" | "boolean" | "array" | "object";
  default: any;
  description: string;
  required?: boolean;
  enum?: string[];
}

export interface JsonComponentProperties {
  schema: Record<string, JsonComponentPropertySchema>;
  defaultValues: Record<string, any>;
}

export interface JsonComponentCanvasIntegration {
  resizable: boolean;
  draggable: boolean;
  selectable: boolean;
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
  defaultWidth: number;
  defaultHeight: number;
  snapToGrid: boolean;
  allowChildElements: boolean;
}

export interface JsonComponentEvent {
  description: string;
  parameters: string[];
}

export interface JsonComponentIntegration {
  properties: JsonComponentProperties;
  canvasIntegration: JsonComponentCanvasIntegration;
  events: Record<string, JsonComponentEvent>;
}

export interface JsonComponentMusicalSequence {
  sequenceName: string;
  description: string;
  key: string;
  tempo: number;
  movements: Array<{
    name: string;
    measures: Array<{
      beat: number;
      event: string;
      dynamics: string;
    }>;
  }>;
}

export interface JsonComponentMusicalSequences {
  componentInteraction?: JsonComponentMusicalSequence;
  resizeOperation?: JsonComponentMusicalSequence;
  positionUpdate?: JsonComponentMusicalSequence;
}

export interface JsonComponent {
  metadata: JsonComponentMetadata;
  ui: JsonComponentUI;
  integration: JsonComponentIntegration;
  musicalSequences: JsonComponentMusicalSequences;
}

export interface LoadedJsonComponent extends JsonComponent {
  id: string;
  filename: string;
  loadedAt: Date;
}

export interface JsonComponentLoadResult {
  success: LoadedJsonComponent[];
  failed: Array<{
    filename: string;
    error: string;
  }>;
}
