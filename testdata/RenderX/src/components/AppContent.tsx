/**
 * App Content Component
 * Main application logic and layout management
 */

import React, { useState, useEffect } from "react";
// ElementLibrary component with Musical Conductor integration
import ElementLibrary from "./ElementLibrary";
import ControlPanel from "./ControlPanel";
import Canvas from "./Canvas";
import { ThemeToggleButton } from "../providers/ThemeProvider";
import type { AppState } from "../types/AppTypes";
import type { LoadedJsonComponent } from "../types/JsonComponent";

// ElementLibrary component is now imported directly and integrates with Musical Conductor
// Removed plugin-loading logic - using original ElementLibrary.tsx with Musical Conductor integration

import {
  initializeCommunicationSystem,
  MusicalConductor,
  resetBeatLogging,
} from "../communication";
import {
  initializeDomainEvents,
  DomainEventSystem,
} from "../communication/DomainEventSystem";

const AppContent: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    layoutMode: "editor",
    panels: {
      showElementLibrary: true,
      showControlPanel: true,
    },
    hasUnsavedChanges: false,
  });

  const [communicationSystem, setCommunicationSystem] = useState<{
    eventBus: any;
    conductor: MusicalConductor;
  } | null>(null);

  const [domainEvents, setDomainEvents] = useState<DomainEventSystem | null>(
    null
  );

  // Drag handlers for ElementLibrary domain events
  const handleDragStart = (
    e: React.DragEvent,
    component: LoadedJsonComponent
  ) => {
    console.log(
      "🎼 Starting drag operation for component:",
      component.metadata.name
    );

    const dragData = {
      type: "component",
      componentType: component.metadata.type,
      name: component.metadata.name,
      metadata: component.metadata,
      componentData: component, // Full component data for data-driven approach
    };

    e.dataTransfer.setData("application/json", JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = "copy";

    // Add visual feedback
    e.currentTarget.classList.add("dragging");

    // 🎼 Emit domain-based event - let plugins handle the specifics
    if (domainEvents) {
      domainEvents.elementLibrary.dragStart(component, dragData);
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    console.log("🎼 Ending drag operation");

    // Remove visual feedback
    e.currentTarget.classList.remove("dragging");

    // 🎼 Emit domain-based event - let plugins handle the specifics
    if (domainEvents) {
      domainEvents.elementLibrary.dragEnd();
    }
  };

  // Canvas element drag start handler for Canvas domain events
  const handleCanvasElementDragStart = (e: React.DragEvent, element: any) => {
    console.log("🎼 Starting canvas element drag operation for:", element.id);

    // Set drag data for canvas element movement
    const dragData = {
      type: element.type,
      componentId: element.id,
      isCanvasElement: true, // Flag to distinguish from library drops
      elementData: element, // Current element data
      source: "canvas-element-drag",
    };

    e.dataTransfer.setData("application/json", JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = "move";

    // Add visual feedback
    e.currentTarget.classList.add("dragging");

    console.log("🎼 Canvas element drag data set:", dragData);

    // 🎼 Emit domain-based event - let plugins handle the specifics
    if (domainEvents) {
      domainEvents.canvas.elementDragStart(element, dragData);
    }
  };

  // Initialize communication system
  useEffect(() => {
    console.log("🚀 RenderX Evolution - Initializing Communication System...");

    try {
      const system = initializeCommunicationSystem();
      setCommunicationSystem(system);

      console.log("✅ Communication System initialized successfully");
      console.log("📡 EventBus:", system.eventBus.getDebugInfo());
      console.log("🎼 Musical Conductor:", system.conductor.getStatistics());

      // Register CIA-compliant plugins
      system.conductor
        .registerCIAPlugins()
        .then(() => {
          console.log("🧠 CIA plugins registration completed");
          // Component loading is now handled by ElementLibrary component
        })
        .catch((error) => {
          console.error("❌ CIA plugins registration failed:", error);
        });

      // Initialize domain event system
      const domainEventSystem = initializeDomainEvents(system);
      setDomainEvents(domainEventSystem);

      // Expose communication system globally for components to access
      (window as any).renderxCommunicationSystem = system;
    } catch (error) {
      console.error("❌ Failed to initialize communication system:", error);
    }

    // Cleanup function for React StrictMode compatibility
    return () => {
      console.log("🧹 Cleaning up communication system...");
      resetBeatLogging();
    };
  }, []);

  // Panel toggle handlers with Musical Sequence integration
  const handleToggleElementLibrary = () => {
    const newState = !appState.panels.showElementLibrary;

    setAppState((prev) => ({
      ...prev,
      panels: {
        ...prev.panels,
        showElementLibrary: newState,
      },
    }));

    // Start musical sequence using CIA conductor.play()
    if (communicationSystem) {
      console.log(
        "🎼 Starting Element Library Panel Toggle via conductor.play()"
      );
      communicationSystem.conductor.play(
        "panel-toggle-symphony",
        "onTogglePanel",
        {
          panelType: "elementLibrary",
          newState,
          options: {
            animated: true,
            updateLayout: true,
          },
          timestamp: Date.now(),
        }
      );
    }
  };

  const handleToggleControlPanel = () => {
    const newState = !appState.panels.showControlPanel;

    setAppState((prev) => ({
      ...prev,
      panels: {
        ...prev.panels,
        showControlPanel: newState,
      },
    }));

    // Start musical sequence using CIA conductor.play()
    if (communicationSystem) {
      console.log("🎼 Starting Control Panel Toggle via conductor.play()");
      communicationSystem.conductor.play(
        "panel-toggle-symphony",
        "onTogglePanel",
        {
          panelType: "controlPanel",
          newState,
          options: {
            animated: true,
            updateLayout: true,
          },
          timestamp: Date.now(),
        }
      );
    }
  };

  // Layout mode handlers with Musical Sequence integration
  const handleEnterPreview = () => {
    const previousMode = appState.layoutMode;
    setAppState((prev) => ({ ...prev, layoutMode: "preview" }));

    // Start musical sequence using CIA conductor.play()
    if (communicationSystem) {
      console.log(
        "🎼 Starting Layout Mode Change: Preview via conductor.play()"
      );
      communicationSystem.conductor.play(
        "layout-mode-symphony",
        "onModeChange",
        {
          previousMode,
          currentMode: "preview",
          options: {
            animated: true,
            preserveState: true,
          },
          timestamp: Date.now(),
        }
      );
    }
  };

  const handleEnterFullscreenPreview = () => {
    const previousMode = appState.layoutMode;
    setAppState((prev) => ({ ...prev, layoutMode: "fullscreen-preview" }));

    // Start musical sequence instead of direct event emission
    if (communicationSystem) {
      console.log(
        "🎼 Starting Layout Mode Change: Fullscreen Preview via conductor.play()"
      );
      communicationSystem.conductor.play(
        "layout-mode-symphony",
        "onModeChange",
        {
          previousMode,
          currentMode: "fullscreen-preview",
          options: {
            animated: true,
            preserveState: false,
          },
          timestamp: Date.now(),
        }
      );
    }
  };

  const handleExitPreview = () => {
    const previousMode = appState.layoutMode;
    setAppState((prev) => ({ ...prev, layoutMode: "editor" }));

    // Start musical sequence using CIA conductor.play()
    if (communicationSystem) {
      console.log(
        "🎼 Starting Layout Mode Change: Editor via conductor.play()"
      );
      communicationSystem.conductor.play(
        "layout-mode-symphony",
        "onModeChange",
        {
          previousMode,
          currentMode: "editor",
          options: {
            animated: true,
            preserveState: true,
          },
          timestamp: Date.now(),
        }
      );
    }
  };

  // Render layout based on mode
  const renderLayout = () => {
    const { layoutMode } = appState;

    switch (layoutMode) {
      case "preview":
        return (
          <div className="app-layout app-layout--preview">
            <Canvas
              mode="preview"
              onCanvasElementDragStart={handleCanvasElementDragStart}
            />
            <div className="preview-overlay">
              <button
                className="preview-exit-button"
                onClick={handleExitPreview}
                title="Exit Preview (Esc)"
              >
                ✕ Exit Preview
              </button>
            </div>
          </div>
        );

      case "fullscreen-preview":
        return (
          <div className="app-layout app-layout--fullscreen-preview">
            <Canvas
              mode="fullscreen-preview"
              onCanvasElementDragStart={handleCanvasElementDragStart}
            />
            <div className="preview-overlay">
              <button
                className="preview-exit-button"
                onClick={handleExitPreview}
                title="Exit Fullscreen Preview"
              >
                ✕ Exit Fullscreen
              </button>
            </div>
          </div>
        );

      case "editor":
      default:
        const { showElementLibrary, showControlPanel } = appState.panels;

        // Determine layout class based on panel visibility
        let layoutClass = "app-layout";
        if (!showElementLibrary && !showControlPanel) {
          layoutClass += " app-layout--no-panels";
        } else if (!showElementLibrary) {
          layoutClass += " app-layout--no-library";
        } else if (!showControlPanel) {
          layoutClass += " app-layout--no-controls";
        }

        return (
          <div className={layoutClass}>
            {/* Element Library - Left Panel */}
            {showElementLibrary && (
              <aside
                className="app-sidebar left"
                id="component-library"
                data-plugin-mounted="true"
              >
                <ElementLibrary
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                />
              </aside>
            )}

            {/* Canvas - Center */}
            <section
              className="app-canvas"
              id="canvas"
              data-plugin-mounted="true"
            >
              <Canvas
                mode="editor"
                onCanvasElementDragStart={handleCanvasElementDragStart}
              />
            </section>

            {/* Control Panel - Right Panel */}
            {showControlPanel && (
              <aside
                className="app-sidebar right"
                id="control-panel"
                data-plugin-mounted="true"
              >
                <ControlPanel />
              </aside>
            )}
          </div>
        );
    }
  };

  return (
    <div className="renderx-app">
      {/* Header - Only show in editor mode */}
      {appState.layoutMode === "editor" && (
        <header className="app-header">
          <div className="app-header-left">
            <h1>RenderX Evolution</h1>
            <p>Lightweight Visual Shell</p>
            {appState.hasUnsavedChanges && (
              <span className="unsaved-indicator">● Unsaved changes</span>
            )}
          </div>

          <div className="app-header-center">
            {/* Panel Toggle Buttons */}
            <div className="panel-toggles">
              <button
                className={`panel-toggle-button ${
                  appState.panels.showElementLibrary ? "active" : ""
                }`}
                onClick={handleToggleElementLibrary}
                title={`${
                  appState.panels.showElementLibrary ? "Hide" : "Show"
                } Element Library`}
              >
                📚 Library
              </button>
              <button
                className={`panel-toggle-button ${
                  appState.panels.showControlPanel ? "active" : ""
                }`}
                onClick={handleToggleControlPanel}
                title={`${
                  appState.panels.showControlPanel ? "Hide" : "Show"
                } Control Panel`}
              >
                🎛️ Properties
              </button>
            </div>
          </div>

          <div className="app-header-right">
            <button
              className="preview-button"
              onClick={handleEnterPreview}
              title="Enter Preview Mode"
            >
              👁️ Preview
            </button>
            <button
              className="fullscreen-preview-button"
              onClick={handleEnterFullscreenPreview}
              title="Enter Fullscreen Preview"
            >
              ⛶ Fullscreen
            </button>
            <ThemeToggleButton />
          </div>
        </header>
      )}

      <main className="app-main">{renderLayout()}</main>
    </div>
  );
};

export default AppContent;
