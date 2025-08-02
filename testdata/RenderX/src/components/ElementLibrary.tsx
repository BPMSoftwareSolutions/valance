/**
 * Element Library Component
 * Displays available JSON components for drag-and-drop
 */

import React, { useState, useEffect } from 'react';
import type { LoadedJsonComponent } from '../types/JsonComponent';
import type { ElementLibraryProps } from '../types/AppTypes';
import { jsonComponentLoader } from '../services/JsonComponentLoader';

const ElementLibrary: React.FC<ElementLibraryProps> = ({
  onDragStart,
  onDragEnd,
}) => {
  const [components, setComponents] = useState<LoadedJsonComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draggedComponent, setDraggedComponent] =
    useState<LoadedJsonComponent | null>(null);

  // Component loading function - now properly scoped within ElementLibrary
  const loadComponentsAfterPlugins = async () => {
    try {
      console.log("🔄 Loading JSON components with musical sequences...");

      // Get the communication system from global scope
      const system = (window as any).renderxCommunicationSystem;

      if (system) {
        jsonComponentLoader.connectToConductor(system.conductor);

        // Use musical sequence loading
        const result = await jsonComponentLoader.loadAllComponentsMusical();

        if (result.failed.length > 0) {
          console.warn("⚠️ Some components failed to load:", result.failed);
          setError(`Failed to load ${result.failed.length} components`);
        }

        console.log(
          `✅ Loaded ${result.success.length} JSON components via musical sequences`
        );

        // Update React state with loaded components
        setComponents(result.success);
        setLoading(false);
        setError(null);

        console.log(
          `🎨 Updated UI state with ${result.success.length} components`
        );
      } else {
        console.log("🔄 No conductor available for component loading");
        setError("No conductor available for component loading");
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
    const checkAndLoadComponents = () => {
      const system = (window as any).renderxCommunicationSystem;
      if (system) {
        loadComponentsAfterPlugins();
      } else {
        // Wait a bit and try again
        setTimeout(checkAndLoadComponents, 100);
      }
    };

    checkAndLoadComponents();
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
