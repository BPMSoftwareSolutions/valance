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
  default: () => stdin_default,
  handleComponentLoadingStarted: () => handleComponentLoadingStarted
});
module.exports = __toCommonJS(stdin_exports);
const handleComponentLoadingStarted = async (data, context = {}) => {
  console.log("\u{1F3BC} JsonLoader Handler: Component Loading Started", data);
  const { eventBus, conductor } = context;
  try {
    console.log("\u{1F4E6} JsonLoader: Fetching JSON components...");
    console.log("\u{1F4C1} JsonLoader: Loading component registry...");
    const registryResponse = await fetch("/json-components/index.json");
    if (!registryResponse.ok) {
      throw new Error(
        `Failed to load component registry: ${registryResponse.status}`
      );
    }
    const registry = await registryResponse.json();
    const componentFiles = registry.components.map(
      (filename) => `/json-components/${filename}`
    );
    console.log(
      `\u{1F4C1} JsonLoader: Found ${componentFiles.length} components in registry:`,
      registry.components
    );
    const components = [];
    for (const file of componentFiles) {
      try {
        const response = await fetch(file);
        if (response.ok) {
          const component = await response.json();
          components.push(component);
          console.log(
            `\u2705 JsonLoader: Loaded ${component.metadata?.name || "component"} from ${file}`
          );
        } else {
          console.warn(
            `\u26A0\uFE0F JsonLoader: Failed to load ${file}: ${response.status}`
          );
        }
      } catch (error) {
        console.error(`\u274C JsonLoader: Error loading ${file}:`, error);
      }
    }
    console.log(
      `\u{1F4E6} JsonLoader: Successfully loaded ${components.length} components`
    );
    if (conductor) {
      console.log(
        "\u{1F3BC} JsonLoader: Playing component loading completion sequence..."
      );
      conductor.play("json-component-symphony", "onLoadComplete", {
        components,
        componentFiles: registry.components,
        count: components.length,
        source: "json-loader",
        timestamp: Date.now()
      });
      console.log("\u{1F3BC} JsonLoader: Component loading sequence played");
      console.log(
        "\u{1F3BC} JsonLoader: Emitting components:loaded event for ElementLibrary"
      );
      eventBus.emit("components:loaded", {
        components,
        count: components.length,
        source: "json-loader",
        timestamp: Date.now()
      });
    } else {
      console.warn(
        "\u26A0\uFE0F JsonLoader: conductor not available, cannot start sequence"
      );
    }
    return {
      success: true,
      started: true,
      componentsLoaded: components.length
    };
  } catch (error) {
    console.error(
      "\u{1F3BC} JsonLoader Handler: Component Loading Started failed:",
      error
    );
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
};
var stdin_default = handleComponentLoadingStarted;
