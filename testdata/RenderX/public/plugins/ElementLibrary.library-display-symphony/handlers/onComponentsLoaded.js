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
  onComponentsLoaded: () => onComponentsLoaded
});
module.exports = __toCommonJS(stdin_exports);
const onComponentsLoaded = (data, context) => {
  console.log(
    "\u{1F3BC} Element Library Display Symphony: Components loaded handler triggered",
    data
  );
  const { components = [], metadata = {} } = data;
  const { eventBus, conductor, pluginInstance } = context;
  try {
    if (!Array.isArray(components)) {
      throw new Error("Components data must be an array");
    }
    const processedComponents = components.map((component) => ({
      ...component,
      // Ensure required metadata
      metadata: {
        name: component.metadata?.name || "Unnamed Component",
        type: component.metadata?.type || "unknown",
        category: component.metadata?.category || "uncategorized",
        description: component.metadata?.description || "No description available",
        version: component.metadata?.version || "1.0.0",
        author: component.metadata?.author || "Unknown",
        ...component.metadata
      },
      // Add display properties
      displayId: `component-${component.id || Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      searchableText: [
        component.metadata?.name,
        component.metadata?.type,
        component.metadata?.description,
        component.metadata?.category
      ].filter(Boolean).join(" ").toLowerCase()
    }));
    const categoryStats = processedComponents.reduce((stats, component) => {
      const category = component.metadata.category;
      stats[category] = (stats[category] || 0) + 1;
      return stats;
    }, {});
    console.log("\u{1F3BC} Component categorization complete:", {
      totalComponents: processedComponents.length,
      categories: Object.keys(categoryStats).length,
      categoryBreakdown: categoryStats
    });
    if (pluginInstance && pluginInstance.updateState) {
      pluginInstance.updateState({
        components: processedComponents,
        loading: false,
        error: null,
        categoryStats,
        lastUpdated: Date.now()
      });
    }
    if (conductor) {
      console.log(
        "\u{1F3BC} ElementLibrary: Playing library display completion sequence..."
      );
      conductor.play("library-display-symphony", "onDisplayComplete", {
        components: processedComponents,
        categoryStats,
        totalCount: processedComponents.length,
        timestamp: Date.now(),
        source: "library-display-symphony"
      });
      console.log("\u{1F3BC} ElementLibrary: Library display sequence played");
    }
    if (conductor) {
      conductor.play("library-display-symphony", "onDisplayComplete", {
        components: processedComponents,
        success: true,
        timestamp: Date.now()
      });
    }
    return {
      success: true,
      components: processedComponents,
      categoryStats,
      message: `Successfully processed ${processedComponents.length} components`
    };
  } catch (error) {
    console.error(
      "\u274C Element Library Display Symphony: Components loaded handler failed:",
      error
    );
    if (pluginInstance && pluginInstance.updateState) {
      pluginInstance.updateState({
        loading: false,
        error: error.message,
        components: []
      });
    }
    if (conductor) {
      console.log(
        "\u{1F3BC} ElementLibrary: Playing error handling sequence..."
      );
      conductor.play("library-display-symphony", "onDisplayError", {
        error: error.message,
        timestamp: Date.now(),
        source: "library-display-symphony"
      });
    }
    return {
      success: false,
      error: error.message,
      components: []
    };
  }
};
