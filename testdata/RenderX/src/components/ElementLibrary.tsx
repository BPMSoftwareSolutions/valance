/**
 * Element Library Component
 * Displays available JSON components for drag-and-drop
 */

import React, { useState, useEffect } from "react";
import type { LoadedJsonComponent } from "../types/JsonComponent";
import type { ElementLibraryProps } from "../types/AppTypes";
import { jsonComponentLoader } from "../services/JsonComponentLoader";

const ElementLibrary: React.FC<ElementLibraryProps> = ({
  onDragStart,
  onDragEnd,
}) => {
  const [components, setComponents] = useState<LoadedJsonComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draggedComponent, setDraggedComponent] =
    useState<LoadedJsonComponent | null>(null);

  // Component loading function - integrates with Musical Conductor symphony
  const loadComponentsAfterPlugins = async () => {
    try {
      console.log(
        "🎼 ElementLibrary: Triggering JSON component loading symphony..."
      );

      // Get the communication system from global scope
      const system = (window as any).renderxCommunicationSystem;

      if (system && system.conductor && system.eventBus) {
        const { conductor, eventBus } = system;

        // Emit component:load:start event to trigger JsonLoader plugin
        console.log("🎼 ElementLibrary: Emitting component:load:start event");
        eventBus.emit("component:load:start", {
          source: "element-library",
          timestamp: Date.now(),
        });

        // Listen for components:loaded event from JsonLoader
        const handleComponentsLoaded = (data: any) => {
          console.log(
            "🎼 ElementLibrary: Received components from JsonLoader",
            data
          );
          if (data.components && Array.isArray(data.components)) {
            setComponents(data.components);
            setLoading(false);
            setError(null);

            // Play library display completion symphony
            console.log(
              "🎼 ElementLibrary: Playing library display completion symphony"
            );
            conductor.play("library-display-symphony", "onDisplayComplete", {
              components: data.components,
              count: data.components.length,
              source: "element-library",
              timestamp: Date.now(),
            });
          }
        };

        const handleComponentsError = (data: any) => {
          console.error("🎼 ElementLibrary: Error loading components", data);
          setError(data.error || "Failed to load components");
          setLoading(false);

          // Play library display error symphony
          conductor.play("library-display-symphony", "onDisplayError", {
            error: data.error || "Failed to load components",
            source: "element-library",
            timestamp: Date.now(),
          });
        };

        // Subscribe to events
        eventBus.subscribe("components:loaded", handleComponentsLoaded);
        eventBus.subscribe("components:error", handleComponentsError);

        // Cleanup function
        return () => {
          eventBus.unsubscribe("components:loaded", handleComponentsLoaded);
          eventBus.unsubscribe("components:error", handleComponentsError);
        };
      } else {
        console.log("🔄 No conductor/eventBus available for component loading");
        setError("Musical Conductor not available for component loading");
        setLoading(false);
      }
    } catch (err) {
      console.error("❌ Failed to load JSON components:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load components"
      );
      setLoading(false);
    }
  };

  // Load components when ElementLibrary mounts and communication system is ready
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const checkAndLoadComponents = async () => {
      const system = (window as any).renderxCommunicationSystem;
      if (system) {
        cleanup = await loadComponentsAfterPlugins();
      } else {
        // Wait a bit and try again
        setTimeout(checkAndLoadComponents, 100);
      }
    };

    checkAndLoadComponents();

    // Return cleanup function
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
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
    // Use the icon from the component's metadata if available
    if (component.metadata.icon) {
      return component.metadata.icon;
    }

    // Fallback to type-based icon mapping
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

    return iconMap[component.metadata.type.toLowerCase()] || "🧩";
  };

  const createComponentPreview = (component: LoadedJsonComponent): string => {
    // Create a mini preview using the component's template and styles
    if (component.ui?.template && component.ui?.styles?.css) {
      // Create a simplified version of the template for preview
      let template = component.ui.template;

      // Remove event handlers for preview
      template = template.replace(/on\w+="[^"]*"/g, "");

      // Add preview-specific classes
      template = template.replace(
        /class="([^"]*)"/,
        'class="$1 component-preview"'
      );

      return template;
    }

    // Fallback to simple text preview
    return `<span class="component-preview-fallback">${component.metadata.name}</span>`;
  };

  const getComponentStyles = (component: LoadedJsonComponent): string => {
    // Return the CSS styles for the component
    if (component.ui?.styles?.css) {
      // Scope the styles to the preview container to avoid conflicts
      const scopedCSS = component.ui.styles.css.replace(
        /(\.[a-zA-Z-_][a-zA-Z0-9-_]*)/g,
        `.element-item[data-component-id="${component.id}"] $1`
      );
      return scopedCSS;
    }
    return "";
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
          <>
            {/* Inject component styles */}
            <style>
              {components
                .map((component) => getComponentStyles(component))
                .join("\n")}
              {/* Additional preview styles */}
              {`
                .element-item .component-preview-container {
                  margin: 4px 0;
                  padding: 4px;
                  border: 1px solid #e0e0e0;
                  border-radius: 3px;
                  background: #f9f9f9;
                  min-height: 24px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 12px;
                  overflow: hidden;
                }
                .element-item .component-preview {
                  transform: scale(0.8);
                  transform-origin: center;
                  pointer-events: none;
                }
                .element-item .component-preview-fallback {
                  color: #666;
                  font-style: italic;
                }
              `}
            </style>

            {Object.entries(getComponentsByCategory()).map(
              ([category, categoryComponents]) => (
                <div key={category} className="element-category">
                  <h4>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </h4>
                  <div className="element-list">
                    {categoryComponents.map((component) => (
                      <div
                        key={component.id}
                        className="element-item"
                        data-component={component.metadata.type.toLowerCase()}
                        data-component-id={component.id}
                        draggable
                        onDragStart={
                          onDragStart
                            ? (e) => onDragStart(e, component)
                            : undefined
                        }
                        onDragEnd={onDragEnd}
                        title={`${component.metadata.description}\nVersion: ${component.metadata.version}\nAuthor: ${component.metadata.author}\nDrag to canvas to add`}
                      >
                        <div className="element-header">
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
                        <div
                          className="component-preview-container"
                          dangerouslySetInnerHTML={{
                            __html: createComponentPreview(component),
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ElementLibrary;
