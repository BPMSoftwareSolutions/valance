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
import { startCanvasComponentDragFlow } from "./communication/sequences/canvas-sequences/CanvasSequences.component-drag-symphony";

// Types
interface AppState {
  layoutMode: "editor" | "preview" | "fullscreen-preview";
  panels: {
    showElementLibrary: boolean;
    showControlPanel: boolean;
  };
  hasUnsavedChanges: boolean;
}

interface ThemeContextType {
  theme: "light" | "dark" | "system";
  resolvedTheme: "light" | "dark";
  toggleTheme: () => void;
}

// Mock Theme Provider
const ThemeContext = React.createContext<ThemeContextType>({
  theme: "system",
  resolvedTheme: "light",
  toggleTheme: () => {},
});

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  const toggleTheme = () => {
    const themes: Array<"light" | "dark" | "system"> = [
      "light",
      "dark",
      "system",
    ];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);

    // Simple resolution logic
    if (nextTheme === "system") {
      setResolvedTheme(
        window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
      );
    } else {
      setResolvedTheme(nextTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, toggleTheme }}>
      <div className={`theme-${resolvedTheme}`}>{children}</div>
    </ThemeContext.Provider>
  );
};

const useTheme = () => React.useContext(ThemeContext);

// Theme Toggle Button Component
const ThemeToggleButton: React.FC = () => {
  const { theme, resolvedTheme, toggleTheme } = useTheme();

  const getThemeIcon = () => {
    if (theme === "system") {
      return "🌓"; // System theme icon
    }
    return resolvedTheme === "dark" ? "🌙" : "☀️";
  };

  const getThemeLabel = () => {
    if (theme === "system") {
      return `System (${resolvedTheme})`;
    }
    return resolvedTheme === "dark" ? "Dark" : "Light";
  };

  return (
    <button
      className="theme-toggle-button"
      onClick={toggleTheme}
      title={`Current theme: ${getThemeLabel()}. Click to toggle.`}
      aria-label={`Toggle theme. Current: ${getThemeLabel()}`}
    >
      <span className="theme-icon">{getThemeIcon()}</span>
    </button>
  );
};

// Element Library Component with JSON Component Loading
const ElementLibrary: React.FC = () => {
  const [components, setComponents] = useState<LoadedJsonComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draggedComponent, setDraggedComponent] =
    useState<LoadedJsonComponent | null>(null);

  useEffect(() => {
    const loadComponents = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("🔄 Loading JSON components with musical sequences...");

        // Connect to conductor if available (from parent context)
        const communicationSystem = (window as any).renderxCommunicationSystem;
        if (communicationSystem) {
          jsonComponentLoader.connectToConductor(communicationSystem.conductor);

          // Use musical sequence loading
          const result = await jsonComponentLoader.loadAllComponentsMusical();

          if (result.failed.length > 0) {
            console.warn("⚠️ Some components failed to load:", result.failed);
          }

          setComponents(result.success);
          console.log(
            `✅ Loaded ${result.success.length} JSON components via musical sequences`
          );
        } else {
          // Fallback to direct loading
          console.log("🔄 No conductor available, using direct loading...");
          const result = await jsonComponentLoader.loadAllComponents();

          if (result.failed.length > 0) {
            console.warn("⚠️ Some components failed to load:", result.failed);
          }

          setComponents(result.success);
          console.log(
            `✅ Loaded ${result.success.length} JSON components (direct loading)`
          );
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        console.error("❌ Failed to load JSON components:", err);
      } finally {
        setLoading(false);
      }
    };

    loadComponents();
  }, []);

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

  // Drag handlers for Canvas Library Drop Symphony
  const handleDragStart = (
    e: React.DragEvent,
    component: LoadedJsonComponent
  ) => {
    console.log(
      "🎼 Starting drag operation for component:",
      component.metadata.name
    );

    // Set drag data - include full component data for data-driven styling
    const dragData = {
      type: component.metadata.type,
      componentId: component.id,
      metadata: component.metadata,
      componentData: component, // Full component data for data-driven approach
    };

    e.dataTransfer.setData("application/json", JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = "copy";

    // Update drag state
    setDraggedComponent(component);

    // Add visual feedback
    e.currentTarget.classList.add("dragging");

    // 🎼 Start Component Drag Symphony for library element drag using CIA conductor.play()
    const communicationSystem = (window as any).renderxCommunicationSystem;
    if (communicationSystem && communicationSystem.conductor) {
      console.log("🎼 Starting Component Drag Symphony for library element drag via conductor.play()...");

      // CIA-compliant trigger using conductor.play()
      communicationSystem.conductor.play('component-drag-symphony', 'onDragStart', {
        element: component,
        dragData,
        source: 'element-library-drag',
        timestamp: Date.now(),
        eventType: 'drag-start',
        changes: { dragStart: true, dragData },
        elements: [], // elements array (empty for library drag)
        setElements: undefined, // setElements function (not needed for library drag)
        syncElementCSS: undefined  // syncElementCSS function (not needed for library drag)
      });
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    console.log("🎼 Ending drag operation");

    // Clear drag state
    setDraggedComponent(null);

    // Remove visual feedback
    e.currentTarget.classList.remove("dragging");

    // 🎼 Start Component Drag Symphony for drag end using CIA conductor.play()
    const communicationSystem = (window as any).renderxCommunicationSystem;
    if (communicationSystem && communicationSystem.conductor) {
      console.log("🎼 Starting Component Drag Symphony for drag end via conductor.play()...");

      // CIA-compliant trigger using conductor.play()
      communicationSystem.conductor.play('component-drag-symphony', 'onDragEnd', {
        element: { id: 'drag-end-operation', type: 'drag-end' },
        changes: { dragEnd: true },
        source: 'element-library-drag-end',
        timestamp: Date.now(),
        eventType: 'drag-end',
        elements: [], // elements array (empty for library drag end)
        setElements: undefined, // setElements function
        syncElementCSS: undefined  // syncElementCSS function
      });
    }
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
                      draggable
                      onDragStart={(e) => handleDragStart(e, component)}
                      onDragEnd={handleDragEnd}
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

  // Get default properties from component definition
  const defaultProperties = componentData.integration?.properties?.defaultValues || {};

  // Simple template rendering (for now, just handle basic button case)
  // In a full implementation, this would use a proper template engine
  if (element.type === 'button') {
    const content = defaultProperties.content || element.metadata?.name || 'Click me';
    const variant = defaultProperties.variant || 'primary';
    const size = defaultProperties.size || 'medium';
    const disabled = defaultProperties.disabled || false;

    return (
      <button
        id={elementId}
        data-component-id={elementId}
        className={`${cssClass} rx-button rx-button--${variant} rx-button--${size} rx-selected`}
        draggable="true"
        type="button"
        disabled={disabled}
        onDragStart={onDragStart ? (e) => onDragStart(e, element) : undefined}
      >
        {content}
      </button>
    );
  }

  // Generic fallback for other component types
  return (
    <div
      id={elementId}
      data-component-id={elementId}
      className={`${cssClass} rx-selected`}
      draggable="true"
      onDragStart={onDragStart ? (e) => onDragStart(e, element) : undefined}
    >
      {element.metadata?.name || element.type}
    </div>
  );
};

const Canvas: React.FC<{ mode: string }> = ({ mode }) => {
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

  // Canvas element drag start handler for Component Drag Symphony
  const handleCanvasElementDragStart = (
    e: React.DragEvent,
    element: any
  ) => {
    console.log("🎼 Starting canvas element drag operation for:", element.id);

    // Set drag data for canvas element movement
    const dragData = {
      type: element.type,
      componentId: element.id,
      isCanvasElement: true, // Flag to distinguish from library drops
      elementData: element, // Current element data
      source: 'canvas-element-drag'
    };

    e.dataTransfer.setData("application/json", JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = "move";

    // Add visual feedback
    e.currentTarget.classList.add("dragging");

    console.log("🎼 Canvas element drag data set:", dragData);

    // 🎼 Start Component Drag Symphony for canvas element drag using CIA conductor.play()
    const communicationSystem = (window as any).renderxCommunicationSystem;
    if (communicationSystem && communicationSystem.conductor) {
      console.log("🎼 Starting Component Drag Symphony for canvas element drag via conductor.play()...");

      // CIA-compliant trigger using conductor.play()
      communicationSystem.conductor.play('component-drag-symphony', 'onDragStart', {
        element, // The canvas element being dragged
        changes: { dragStart: true, dragData },
        source: 'canvas-element-drag-start',
        timestamp: Date.now(),
        eventType: 'canvas-element-drag-start',
        dragData,
        elements: canvasElements, // elements array
        setElements: setCanvasElements, // setElements function
        syncElementCSS: undefined  // syncElementCSS function
      });
    }
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
        console.log("🎼 Canvas element move detected:", dragData.elementData.id);

        // Update existing element position
        setCanvasElements(prev =>
          prev.map(el =>
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
        console.log("🎼 Starting Canvas Library Drop Symphony via conductor.play()...");

        // CIA-compliant trigger using conductor.play()
        const result = communicationSystem.conductor.play('library-drop-symphony', 'onDropValidation', {
          dragData,
          dropCoordinates,
          dropZone: { isValidDropZone: true },
          timestamp: Date.now(),
          source: "canvas-drop"
        });

        console.log(
          `🎼 Canvas Library Drop Symphony triggered via conductor.play(): ${result ? 'SUCCESS' : 'FAILED'}`
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
          console.warn('No component data available for styling, element may not render correctly');
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
                  `rx-comp-${element.type}-${Math.random()
                    .toString(36)
                    .substr(2, 6)}`;

                // Render component using data-driven approach
                return (
                  <CanvasElement
                    key={element.id}
                    element={element}
                    elementId={elementId}
                    cssClass={cssClass}
                    onDragStart={handleCanvasElementDragStart}
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
      system.conductor.registerCIAPlugins().then(() => {
        console.log("🧠 CIA plugins registration completed");
      }).catch((error) => {
        console.error("❌ CIA plugins registration failed:", error);
      });

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
      console.log("🎼 Starting Element Library Panel Toggle via conductor.play()");
      communicationSystem.conductor.play('panel-toggle-symphony', 'onTogglePanel', {
        panelType: "elementLibrary",
        newState,
        options: {
          animated: true,
          updateLayout: true,
        },
        timestamp: Date.now()
      });
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
      communicationSystem.conductor.play('panel-toggle-symphony', 'onTogglePanel', {
        panelType: "controlPanel",
        newState,
        options: {
          animated: true,
          updateLayout: true,
        },
        timestamp: Date.now()
      });
    }
  };

  // Layout mode handlers with Musical Sequence integration
  const handleEnterPreview = () => {
    const previousMode = appState.layoutMode;
    setAppState((prev) => ({ ...prev, layoutMode: "preview" }));

    // Start musical sequence using CIA conductor.play()
    if (communicationSystem) {
      console.log("🎼 Starting Layout Mode Change: Preview via conductor.play()");
      communicationSystem.conductor.play('layout-mode-symphony', 'onModeChange', {
        previousMode,
        currentMode: "preview",
        options: {
          animated: true,
          preserveState: true,
        },
        timestamp: Date.now()
      });
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
      communicationSystem.conductor.play('layout-mode-symphony', 'onModeChange', {
        previousMode,
        currentMode: "fullscreen-preview",
        options: {
          animated: true,
          preserveState: false,
        },
        timestamp: Date.now()
      });
    }
  };

  const handleExitPreview = () => {
    const previousMode = appState.layoutMode;
    setAppState((prev) => ({ ...prev, layoutMode: "editor" }));

    // Start musical sequence using CIA conductor.play()
    if (communicationSystem) {
      console.log("🎼 Starting Layout Mode Change: Editor via conductor.play()");
      communicationSystem.conductor.play('layout-mode-symphony', 'onModeChange', {
        previousMode,
        currentMode: "editor",
        options: {
          animated: true,
          preserveState: true,
        },
        timestamp: Date.now()
      });
    }
  };

  // Render layout based on mode
  const renderLayout = () => {
    const { layoutMode } = appState;

    switch (layoutMode) {
      case "preview":
        return (
          <div className="app-layout app-layout--preview">
            <Canvas mode="preview" />
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
            <Canvas mode="fullscreen-preview" />
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
              <aside className="app-sidebar left">
                <ElementLibrary />
              </aside>
            )}

            {/* Canvas - Center */}
            <section className="app-canvas">
              <Canvas mode="editor" />
            </section>

            {/* Control Panel - Right Panel */}
            {showControlPanel && (
              <aside className="app-sidebar right">
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
