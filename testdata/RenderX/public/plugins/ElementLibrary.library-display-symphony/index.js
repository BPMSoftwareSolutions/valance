var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
        });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var stdin_exports = {};
__export(stdin_exports, {
  CIAPlugin: () => CIAPlugin,
  ElementLibraryDisplaySequence: () => import_sequence.ElementLibraryDisplaySequence,
  default: () => stdin_default,
  sequence: () => import_sequence.ElementLibraryDisplaySequence,
  handleComponentsLoaded: () => import_onComponentsLoaded.onComponentsLoaded,
  handleLibraryRefresh: () => import_onLibraryRefresh.onLibraryRefresh,
  PLUGIN_INFO: () => PLUGIN_INFO,
  startElementLibraryDisplayFlow: () => startElementLibraryDisplayFlow,
  processComponentDisplay: () => processComponentDisplay,
  validateComponentLibrary: () => validateComponentLibrary
});
module.exports = __toCommonJS(stdin_exports);
var import_sequence = require("./sequence.js");
var import_onComponentsLoaded = require("./handlers/onComponentsLoaded.js");
var import_onLibraryRefresh = require("./handlers/onLibraryRefresh.js");
const PLUGIN_INFO = {
  id: "ElementLibrary.library-display-symphony",
  name: "Element Library Display Symphony No. 12",
  version: "1.0.0",
  description: "Orchestrates component library display and interaction",
  author: "RenderX Symphony System",
  category: "library-operations",
  type: "symphony-plugin"
};
const startElementLibraryDisplayFlow = (conductor, eventBus, options = {}) => {
  console.log("\u{1F3BC} Starting Element Library Display Flow...");
  try {
    const result = conductor.play("library-display-symphony", "onLibraryInit", {
      source: "element-library",
      timestamp: Date.now(),
      ...options
    });
    console.log("\u2705 Element Library Display Flow started:", result);
    return result;
  } catch (error) {
    console.error(
      "\u274C Failed to start Element Library Display Flow:",
      error
    );
    throw error;
  }
};
const processComponentDisplay = (components, options = {}) => {
  console.log("\u{1F3BC} Processing component display...", {
    componentCount: components.length
  });
  try {
    const processedComponents = components.map((component) => ({
      ...component,
      displayReady: true,
      category: component.metadata?.category || "uncategorized",
      searchableText: [
        component.metadata?.name,
        component.metadata?.type,
        component.metadata?.description
      ].filter(Boolean).join(" ").toLowerCase()
    }));
    console.log(
      "\u2705 Components processed for display:",
      processedComponents.length
    );
    return processedComponents;
  } catch (error) {
    console.error("\u274C Failed to process components for display:", error);
    throw error;
  }
};
const validateComponentLibrary = (components) => {
  console.log("\u{1F3BC} Validating component library...");
  try {
    const validation = {
      isValid: true,
      componentCount: components.length,
      categories: {},
      errors: [],
      warnings: []
    };
    components.forEach((component) => {
      const category = component.metadata?.category || "uncategorized";
      if (!validation.categories[category]) {
        validation.categories[category] = 0;
      }
      validation.categories[category]++;
      if (!component.metadata?.name) {
        validation.warnings.push(`Component ${component.id} missing name`);
      }
      if (!component.metadata?.type) {
        validation.warnings.push(`Component ${component.id} missing type`);
      }
    });
    console.log("\u2705 Component library validation complete:", validation);
    return validation;
  } catch (error) {
    console.error("\u274C Component library validation failed:", error);
    return {
      isValid: false,
      error: error.message,
      componentCount: 0,
      categories: {},
      errors: [error.message],
      warnings: []
    };
  }
};
const createElementLibraryComponent = (conductor, eventBus) => {
  const React = window.React || globalThis.React;
  if (!React) {
    console.error(
      "\u{1F6A8} React not found in global scope for ElementLibrary plugin"
    );
    return function ElementLibraryFallback() {
      return "React not available for ElementLibrary plugin";
    };
  }
  return function ElementLibrary({ onDragStart, onDragEnd }) {
    const [components, setComponents] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);
    const [draggedComponent, setDraggedComponent] = React.useState(null);
    React.useEffect(() => {
      const handleComponentsLoaded = (data) => {
        console.log(
          "\u{1F3BC} ElementLibrary Component: Received components",
          data
        );
        if (data.components && Array.isArray(data.components)) {
          setComponents(data.components);
          setLoading(false);
          setError(null);
        }
      };
      const handleComponentsError = (data) => {
        console.error(
          "\u{1F3BC} ElementLibrary Component: Error loading components",
          data
        );
        setError(data.error || "Failed to load components");
        setLoading(false);
      };
      eventBus.subscribe("components:loaded", handleComponentsLoaded);
      eventBus.subscribe("components:error", handleComponentsError);
      return () => {
        eventBus.unsubscribe("components:loaded", handleComponentsLoaded);
        eventBus.unsubscribe("components:error", handleComponentsError);
      };
    }, []);
    const handleDragStart = (e, component) => {
      setDraggedComponent(component);
      if (onDragStart) {
        onDragStart(e, component);
      }
      eventBus.emit("library:drag:start", {
        component,
        timestamp: Date.now()
      });
    };
    const handleDragEnd = (e) => {
      setDraggedComponent(null);
      if (onDragEnd) {
        onDragEnd(e);
      }
      eventBus.emit("library:drag:end", {
        timestamp: Date.now()
      });
    };
    const getComponentsByCategory = () => {
      const categories2 = {};
      components.forEach((component) => {
        const category = component.metadata?.category || "uncategorized";
        if (!categories2[category]) {
          categories2[category] = [];
        }
        categories2[category].push(component);
      });
      return categories2;
    };
    const getComponentIcon = (component) => {
      const iconMap = {
        button: "\u{1F518}",
        input: "\u{1F4DD}",
        text: "\u{1F4C4}",
        container: "\u{1F4E6}",
        image: "\u{1F5BC}\uFE0F",
        default: "\u{1F9E9}"
      };
      return iconMap[component.metadata?.type] || iconMap.default;
    };
    if (loading) {
      return React.createElement(
        "div",
        { className: "element-library loading" },
        React.createElement("h3", null, "\u{1F3BC} Element Library"),
        React.createElement(
          "div",
          { className: "loading-state" },
          React.createElement("p", null, "Loading components...")
        )
      );
    }
    if (error) {
      return React.createElement(
        "div",
        { className: "element-library error" },
        React.createElement("h3", null, "\u{1F3BC} Element Library"),
        React.createElement(
          "div",
          { className: "error-state" },
          React.createElement("p", null, `Error: ${error}`)
        )
      );
    }
    const categories = getComponentsByCategory();
    return React.createElement(
      "div",
      { className: "element-library" },
      React.createElement("h3", null, "\u{1F3BC} Element Library"),
      React.createElement(
        "div",
        { className: "component-categories" },
        Object.entries(categories).map(
          ([category, categoryComponents]) => React.createElement(
            "div",
            { key: category, className: "category" },
            React.createElement("h4", null, category),
            React.createElement(
              "div",
              { className: "components" },
              categoryComponents.map(
                (component) => React.createElement(
                  "div",
                  {
                    key: component.id,
                    className: `component-item ${draggedComponent?.id === component.id ? "dragging" : ""}`,
                    draggable: true,
                    onDragStart: (e) => handleDragStart(e, component),
                    onDragEnd: handleDragEnd
                  },
                  React.createElement(
                    "span",
                    { className: "component-icon" },
                    getComponentIcon(component)
                  ),
                  React.createElement(
                    "span",
                    { className: "component-name" },
                    component.metadata?.name || component.id
                  )
                )
              )
            )
          )
        )
      )
    );
  };
};
const CIAPlugin = {
  mount: (conductor, eventBus) => {
    console.log("\u{1F3BC} ElementLibrary Plugin: Mounting...");
    try {
      eventBus.subscribe("components:loaded", (data) => {
        console.log(
          "\u{1F3BC} ElementLibrary Plugin: Components loaded event received"
        );
        import_onComponentsLoaded.onComponentsLoaded(data, {
          conductor,
          eventBus
        });
      });
      eventBus.subscribe("library:refresh", (data) => {
        console.log(
          "\u{1F3BC} ElementLibrary Plugin: Library refresh event received"
        );
        import_onLibraryRefresh.onLibraryRefresh(data, { conductor, eventBus });
      });
      eventBus.subscribe("library:search", (data) => {
        console.log(
          "\u{1F3BC} ElementLibrary Plugin: Library search event received"
        );
        const { query, components } = data;
        const filteredComponents = components.filter(
          (component) => component.searchableText?.includes(query.toLowerCase())
        );
        eventBus.emit("library:search:results", {
          query,
          results: filteredComponents,
          timestamp: Date.now()
        });
      });
      console.log(
        "\u{1F3BC} ElementLibrary Plugin: Triggering JSON component loading..."
      );
      eventBus.emit("component:load:start", {
        source: "element-library",
        timestamp: Date.now()
      });
      startElementLibraryDisplayFlow(conductor, eventBus);
      console.log("\u2705 ElementLibrary Plugin: Mounted successfully");
      return true;
    } catch (error) {
      console.error("\u{1F6A8} ElementLibrary Plugin: Mount failed:", error);
      return false;
    }
  },
  unmount: (conductor, eventBus) => {
    console.log("\u{1F3BC} ElementLibrary Plugin: Unmounting...");
    try {
      eventBus.unsubscribe(
        "components:loaded",
        import_onComponentsLoaded.onComponentsLoaded
      );
      eventBus.unsubscribe(
        "library:refresh",
        import_onLibraryRefresh.onLibraryRefresh
      );
      eventBus.unsubscribe("library:search");
      if (typeof window !== "undefined" && window.renderxPlugins) {
        delete window.renderxPlugins["ElementLibrary.library-display-symphony"];
        console.log(
          "\u{1F3BC} ElementLibrary Component removed from global registry"
        );
      }
      console.log("\u2705 ElementLibrary Plugin: Unmounted successfully");
      return true;
    } catch (error) {
      console.error("\u{1F6A8} ElementLibrary Plugin: Unmount failed:", error);
      return false;
    }
  }
};
var stdin_default = CIAPlugin;
