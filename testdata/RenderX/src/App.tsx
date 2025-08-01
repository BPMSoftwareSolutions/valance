/**
 * RenderX Evolution - Lightweight Visual Shell
 *
 * This is a visual-only shell of RenderX for re-architecting purposes.
 * Contains the main workspace, element library, and canvas toolbar structure
 * without any underlying functionality.
 */

import React, { useState, useEffect } from "react";
import "./App.css";
import {
  generateAndInjectComponentCSS,
  injectSelectionStyles,
} from "./utils/cssUtils";
import { jsonComponentLoader } from "./services/JsonComponentLoader";
import type { LoadedJsonComponent } from "./types/JsonComponent";
import {
  initializeCommunicationSystem,
  eventBus,
  EVENT_TYPES,
  MusicalConductor,
  MusicalSequences,
} from "./communication";
import {
  initializeDomainEvents,
  DomainEventSystem,
} from "./communication/DomainEventSystem";

// Import ThemeProvider from Theme Management Symphony Plugin
// Note: In production, this would be dynamically loaded by the plugin system
// For now, we'll use a placeholder that gets replaced by the plugin
let ThemeProvider = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);

// This will be replaced by the plugin system when Theme.theme-management-symphony loads
if (
  typeof window !== "undefined" &&
  (window as any).renderxPlugins?.["Theme.theme-management-symphony"]
) {
  ThemeProvider = (window as any).renderxPlugins[
    "Theme.theme-management-symphony"
  ].ThemeProvider;
}

// Types
interface AppState {
  layoutMode: "editor" | "preview" | "fullscreen-preview";
  panels: {
    showElementLibrary: boolean;
    showControlPanel: boolean;
  };
  hasUnsavedChanges: boolean;
}

// Theme management now handled by Theme.theme-management-symphony plugin
// Plugin provides ThemeProvider and useTheme hook globally

// ThemeToggleButton now provided by Theme.theme-management-symphony plugin
let ThemeToggleButton = () => <button>🎨</button>; // Fallback

// This will be replaced by the plugin system when Theme.theme-management-symphony loads
if (
  typeof window !== "undefined" &&
  (window as any).renderxPlugins?.["Theme.theme-management-symphony"]
) {
  ThemeToggleButton = (window as any).renderxPlugins[
    "Theme.theme-management-symphony"
  ].ThemeToggleButton;
}

// Element Library Component with JSON Component Loading
interface ElementLibraryProps {
  onDragStart?: (e: React.DragEvent, component: LoadedJsonComponent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
}

const ElementLibrary: React.FC<ElementLibraryProps> = ({
  onDragStart,
  onDragEnd,
}) => {
  const [components, setComponents] = useState<LoadedJsonComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draggedComponent, setDraggedComponent] =
    useState<LoadedJsonComponent | null>(null);

  // DISABLED: Prevent race condition with plugin loading
  // useEffect(() => {
  //   loadComponentsAfterPlugins();
  // }, []);

  const getComponentsByCategory = () => {
    const categories: Record<string, LoadedJsonComponent[]> = {};

    components.forEach((component) => {
      const category = component.metadata.category || "uncategorized";
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(component);
    });

    return categories;
  };

  const getComponentIcon = (component: LoadedJsonComponent): string => {
    // Simple icon mapping based on component type
    const iconMap: Record<string, string> = {
      button: "🔘",
      input: "📝",
      text: "📄",
      heading: "📰",
      image: "🖼️",
      container: "📦",
      table: "📊",
      chart: "📈",
      div: "🔲",
    };

    return iconMap[component.metadata.type] || "🧩";
  };

  return (
    <div className="element-library">
      <div className="element-library-header">
        <h3>Element Library</h3>
        {loading && <div className="loading-indicator">Loading...</div>}
        {error && <div className="error-indicator">Error: {error}</div>}
      </div>
      <div className="element-library-content">
        {loading ? (
          <div className="element-library-loading">
            <div className="loading-state">
              <h4>Loading Components...</h4>
              <p>Scanning json-components folder</p>
            </div>
          </div>
        ) : error ? (
          <div className="element-library-error">
            <div className="error-state">
              <h4>Failed to Load Components</h4>
              <p>{error}</p>
            </div>
          </div>
        ) : components.length === 0 ? (
          <div className="element-library-empty">
            <div className="empty-state">
              <h4>No Components Found</h4>
              <p>No JSON components found in public/json-components/</p>
              <p>Add .json component files to see them here.</p>
            </div>
          </div>
        ) : (
          Object.entries(getComponentsByCategory()).map(
            ([category, categoryComponents]) => (
              <div key={category} className="element-category">
                <h4>{category.charAt(0).toUpperCase() + category.slice(1)}</h4>
                <div className="element-list">
                  {categoryComponents.map((component) => (
                    <div
                      key={component.id}
                      className="element-item"
                      data-component={component.metadata.type.toLowerCase()}
                      draggable
                      onDragStart={
                        onDragStart
                          ? (e) => onDragStart(e, component)
                          : undefined
                      }
                      onDragEnd={onDragEnd}
                      title={`${component.metadata.description}\nVersion: ${component.metadata.version}\nAuthor: ${component.metadata.author}\nDrag to canvas to add`}
                    >
                      <span className="element-icon">
                        {getComponentIcon(component)}
                      </span>
                      <span className="element-name">
                        {component.metadata.name}
                      </span>
                      <span className="element-type">
                        ({component.metadata.type})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          )
        )}
      </div>
    </div>
  );
};

const ControlPanel: React.FC = () => (
  <div className="control-panel">
    <div className="control-panel-header">
      <h3>Properties</h3>
    </div>
    <div className="control-panel-content">
      <div className="property-section">
        <h4>Position</h4>
        <div className="property-group">
          <label>
            X: <input type="number" placeholder="0" disabled />
          </label>
          <label>
            Y: <input type="number" placeholder="0" disabled />
          </label>
        </div>
      </div>
      <div className="property-section">
        <h4>Size</h4>
        <div className="property-group">
          <label>
            Width: <input type="number" placeholder="100" disabled />
          </label>
          <label>
            Height: <input type="number" placeholder="50" disabled />
          </label>
        </div>
      </div>
      <div className="property-section">
        <h4>Style</h4>
        <div className="property-group">
          <label>
            Background: <input type="color" disabled />
          </label>
          <label>
            Border: <input type="text" placeholder="1px solid #ccc" disabled />
          </label>
        </div>
      </div>
    </div>
  </div>
);

// Data-driven Canvas Element Component
const CanvasElement: React.FC<{
  element: any;
  elementId: string;
  cssClass: string;
  onDragStart?: (e: React.DragEvent, element: any) => void;
}> = ({ element, elementId, cssClass, onDragStart }) => {
  // Get component data from the element
  const componentData = element.componentData;

  if (!componentData?.ui?.template) {
    // Fallback for elements without component data
    return (
      <div
        id={elementId}
        data-component-id={elementId}
        className={`${cssClass} rx-selected`}
        draggable="true"
        onDragStart={onDragStart ? (e) => onDragStart(e, element) : undefined}
      >
        {element.metadata?.name || element.type} (No template)
      </div>
    );
  }

  // Generic component rendering - app doesn't know component specifics
  // Component rendering should be handled by JsonComponentLoader at runtime
  return (
    <div
      id={elementId}
      data-component-id={elementId}
      className={`${cssClass} rx-generic-component rx-selected`}
      draggable="true"
      onDragStart={onDragStart ? (e) => onDragStart(e, element) : undefined}
    >
      {/* Generic component placeholder - actual rendering handled by JsonComponentLoader */}
      <span className="rx-component-placeholder">Component {element.id}</span>
    </div>
  );
};

interface CanvasProps {
  mode: string;
  onCanvasElementDragStart?: (e: React.DragEvent, element: any) => void;
}

const Canvas: React.FC<CanvasProps> = ({ mode, onCanvasElementDragStart }) => {
  const [canvasElements, setCanvasElements] = useState<any[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  // Drop handlers for Canvas Library Drop Symphony
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setIsDragOver(true);

    // Note: No symphony needed for simple canvas hover state changes
    // This is just visual feedback, not an actual drag operation
    console.log("🎨 Canvas drag over - visual state updated");
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    // Note: No symphony needed for simple canvas hover state changes
    // This is just visual feedback, not an actual drag operation
    console.log("🎨 Canvas drag leave - visual state updated");
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    try {
      // Get drag data
      const dragDataString = e.dataTransfer.getData("application/json");
      if (!dragDataString) {
        console.warn("No drag data found");
        return;
      }

      const dragData = JSON.parse(dragDataString);
      console.log("🎼 Canvas drop detected:", dragData);

      // Get drop coordinates relative to canvas
      const canvasRect = e.currentTarget.getBoundingClientRect();
      const dropCoordinates = {
        x: e.clientX - canvasRect.left,
        y: e.clientY - canvasRect.top,
        canvasX: e.clientX - canvasRect.left,
        canvasY: e.clientY - canvasRect.top,
      };

      // Handle canvas element movement vs library drop
      if (dragData.isCanvasElement) {
        console.log(
          "🎼 Canvas element move detected:",
          dragData.elementData.id
        );

        // Update existing element position
        setCanvasElements((prev) =>
          prev.map((el) =>
            el.id === dragData.elementData.id
              ? { ...el, position: dropCoordinates }
              : el
          )
        );

        return;
      }

      // Get communication system and start Canvas Library Drop Symphony
      const communicationSystem = (window as any).renderxCommunicationSystem;
      if (communicationSystem && communicationSystem.conductor) {
        console.log("🎼 Starting Canvas Library Drop Symphony...");

        // Import the sequence function
        const { MusicalSequences } = await import("./communication/sequences");

        // Start the Canvas Library Drop Symphony using CIA conductor.play()
        console.log(
          "🎼 Starting Canvas Library Drop Symphony via conductor.play()..."
        );

        // CIA-compliant trigger using conductor.play()
        const result = communicationSystem.conductor.play(
          "library-drop-symphony",
          "onDropValidation",
          {
            dragData,
            dropCoordinates,
            dropZone: { isValidDropZone: true },
            timestamp: Date.now(),
            source: "canvas-drop",
          }
        );

        console.log(
          `🎼 Canvas Library Drop Symphony triggered via conductor.play(): ${
            result ? "SUCCESS" : "FAILED"
          }`
        );

        // Create element with proper ID and CSS class generation
        const timestamp = Date.now();
        const randomHash = Math.random().toString(36).substr(2, 9);
        const cssHash = Math.random().toString(36).substr(2, 6);

        const newElement = {
          id: `element-${timestamp}`,
          elementId: `${dragData.type}-${timestamp}-${randomHash}`,
          cssClass: `rx-comp-${dragData.type}-${cssHash}`,
          type: dragData.type,
          componentId: dragData.componentId,
          position: dropCoordinates,
          metadata: dragData.metadata,
          componentData: dragData.componentData, // Store full component data for data-driven rendering
        };

        // Generate and inject CSS for the component (data-driven approach)
        if (dragData.componentData) {
          generateAndInjectComponentCSS(
            newElement.cssClass,
            dragData.componentData,
            dropCoordinates,
            {}, // element properties
            {} // custom styles
          );
        } else {
          console.warn(
            "No component data available for styling, element may not render correctly"
          );
        }

        // Ensure selection styles are available
        injectSelectionStyles();

        setCanvasElements((prev) => [...prev, newElement]);
      } else {
        console.warn(
          "No communication system available for Canvas Library Drop Symphony"
        );
      }
    } catch (error) {
      console.error("Failed to handle canvas drop:", error);
    }
  };

  return (
    <div className={`canvas-container canvas-container--${mode}`}>
      <div className="canvas-toolbar">
        <div className="canvas-toolbar-left">
          <button className="toolbar-button" disabled>
            💾 Save
          </button>
          <button className="toolbar-button" disabled>
            📁 Load
          </button>
          <button className="toolbar-button" disabled>
            ↩️ Undo
          </button>
          <button className="toolbar-button" disabled>
            ↪️ Redo
          </button>
        </div>
        <div className="canvas-toolbar-center">
          <span className="canvas-title">Untitled Canvas</span>
        </div>
        <div className="canvas-toolbar-right">
          <button className="toolbar-button" disabled>
            🔍 Zoom
          </button>
          <button className="toolbar-button" disabled>
            ⚙️ Settings
          </button>
        </div>
      </div>
      <div className="canvas-workspace">
        <div className="canvas-grid"></div>
        <div
          className={`canvas-content ${isDragOver ? "drag-over" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {canvasElements.length === 0 ? (
            <div className="canvas-placeholder">
              <h3>Canvas Workspace</h3>
              <p>Drag components from Element Library to add them</p>
              <p>Mode: {mode}</p>
            </div>
          ) : (
            <>
              {canvasElements.map((element) => {
                // Generate stable element ID and CSS class (should be done once when element is created)
                const elementId =
                  element.elementId ||
                  `${element.type}-${element.id}-${Math.random()
                    .toString(36)
                    .substr(2, 9)}`;
                const cssClass =
                  element.cssClass ||
                  `component-${element.type.toLowerCase()} rx-comp-${
                    element.type
                  }-${Math.random().toString(36).substr(2, 6)}`;

                // Render component using data-driven approach
                return (
                  <CanvasElement
                    key={element.id}
                    element={element}
                    elementId={elementId}
                    cssClass={cssClass}
                    onDragStart={onCanvasElementDragStart}
                  />
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Main App Content Component
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

  // Component loading function - defined in AppContent where it's called
  const loadComponentsAfterPlugins = async () => {
    try {
      console.log("🔄 Loading JSON components with musical sequences...");

      // Connect to conductor if available
      if (communicationSystem) {
        jsonComponentLoader.connectToConductor(communicationSystem.conductor);

        // Use musical sequence loading
        const result = await jsonComponentLoader.loadAllComponentsMusical();

        if (result.failed.length > 0) {
          console.warn("⚠️ Some components failed to load:", result.failed);
        }

        console.log(
          `✅ Loaded ${result.success.length} JSON components via musical sequences`
        );

        // TODO: Need to pass components to ElementLibrary
        // This will require refactoring the component state management
      } else {
        console.log("🔄 No conductor available for component loading");
      }
    } catch (err) {
      console.error("❌ Failed to load JSON components:", err);
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

      // Register CIA-compliant plugins first, then load components
      system.conductor
        .registerCIAPlugins()
        .then(() => {
          console.log("🧠 CIA plugins registration completed");

          // Now load JSON components after plugins are ready
          loadComponentsAfterPlugins();
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

// Main App Component with Providers
function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
