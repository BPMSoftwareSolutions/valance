/**
 * App-level type definitions for RenderX Evolution
 */

import type { LoadedJsonComponent } from "./JsonComponent";

export interface AppState {
  layoutMode: "editor" | "preview" | "fullscreen-preview";
  panels: {
    showElementLibrary: boolean;
    showControlPanel: boolean;
  };
  hasUnsavedChanges: boolean;
}

export interface ElementLibraryProps {
  onDragStart?: (e: React.DragEvent, component: LoadedJsonComponent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
}

export interface CanvasProps {
  mode: "editor" | "preview" | "fullscreen-preview";
  onCanvasElementDragStart?: (element: any, dragData: any) => void;
}

export interface CanvasElementProps {
  id: string;
  type: string;
  content: string;
  style: React.CSSProperties;
  onDragStart?: (element: any, dragData: any) => void;
}
