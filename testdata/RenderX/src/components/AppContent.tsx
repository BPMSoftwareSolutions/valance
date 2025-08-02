/**
 * App Content Component
 * Main application logic and layout management
 */

import React, { useState, useEffect } from "react";
// ElementLibrary is now provided by ElementLibrary.library-display-symphony plugin
// import ElementLibrary from "./ElementLibrary";
import ControlPanel from "./ControlPanel";
import Canvas from "./Canvas";
import { ThemeToggleButton } from "../providers/ThemeProvider";
import type { AppState } from "../types/AppTypes";
import type { LoadedJsonComponent } from "../types/JsonComponent";

// Plugin-based ElementLibrary component
const ElementLibrary: React.FC<{
  onDragStart?: (e: React.DragEvent, component: LoadedJsonComponent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
}> = ({ onDragStart, onDragEnd }) => {
  const [PluginComponent, setPluginComponent] =
    useState<React.ComponentType<any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 10;

    const loadPluginComponent = () => {
      try {
        // Get the plugin from global registry
        const plugin = (window as any).renderxPlugins?.[
          "ElementLibrary.library-display-symphony"
        ];

        if (plugin && plugin.Component) {
          console.log(
            "🎼 Loading ElementLibrary from library-display-symphony plugin"
          );
          setPluginComponent(() => plugin.Component);
          setLoading(false);
          return true; // Success
        } else if (retryCount >= maxRetries) {
          // After max retries, show fallback
          console.warn(
            "⚠️ ElementLibrary.library-display-symphony plugin not found after retries, using fallback"
          );
          setPluginComponent(
            () =>
              ({ children }: { children?: React.ReactNode }) =>
                (
                  <div className="element-library plugin-fallback">
                    <div className="element-library-header">
                      <h3>Element Library</h3>
                      <div className="warning-indicator">Plugin Fallback</div>
                    </div>
                    <div className="element-library-content">
                      <div className="element-library-error">
                        <div className="error-state">
                          <h4>🔌 Plugin System</h4>
                          <p>
                            ElementLibrary.library-display-symphony plugin could
                            not be loaded.
                          </p>
                          <p>Using fallback display.</p>
                          <button
                            onClick={() => window.location.reload()}
                            className="retry-button"
                          >
                            🔄 Reload Page
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
          );
          setLoading(false);
          return true; // Stop retrying
        }
        return false; // Continue retrying
      } catch (err) {
        console.error("❌ Failed to load ElementLibrary plugin:", err);
        setError(err instanceof Error ? err.message : "Plugin loading failed");
        setLoading(false);
        return true; // Stop retrying on error
      }
    };

    // Try to load immediately
    if (loadPluginComponent()) {
      return; // Success or error, no need to retry
    }

    // If not available, retry periodically with limit
    const retryInterval = setInterval(() => {
      retryCount++;
      if (loadPluginComponent()) {
        clearInterval(retryInterval);
      }
    }, 500); // Retry every 500ms

    return () => clearInterval(retryInterval);
  }, []); // Empty dependency array - only run once on mount

  if (loading) {
    return (
      <div className="element-library loading">
        <div className="element-library-header">
          <h3>Element Library</h3>
          <div className="loading-indicator">Loading plugin...</div>
        </div>
        <div className="element-library-content">
          <div className="loading-state">
            <h4>🎼 Loading Symphony Plugin</h4>
            <p>ElementLibrary.library-display-symphony initializing...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="element-library error">
        <div className="element-library-header">
          <h3>Element Library</h3>
          <div className="error-indicator">Plugin Error</div>
        </div>
        <div className="element-library-content">
          <div className="error-state">
            <h4>❌ Plugin Loading Failed</h4>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!PluginComponent) {
    return (
      <div className="element-library fallback">
        <div className="element-library-header">
          <h3>Element Library</h3>
          <div className="warning-indicator">Using Fallback</div>
        </div>
        <div className="element-library-content">
          <div className="fallback-state">
            <h4>🔌 Plugin System</h4>
            <p>ElementLibrary plugin not available</p>
          </div>
        </div>
      </div>
    );
  }

  // Get communication system for plugin
  const communicationSystem = (window as any).renderxCommunicationSystem;

  return (
    <PluginComponent
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      conductor={communicationSystem?.conductor}
      eventBus={communicationSystem?.eventBus}
    />
  );
};
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
