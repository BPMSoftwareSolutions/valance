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

export default ElementLibrary;
