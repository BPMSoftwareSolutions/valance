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
  MainComponent: () => import_components.MainComponent,
  components: () => components,
  default: () => stdin_default,
  handlers: () => handlers,
  lifecycle: () => lifecycle,
  pluginInfo: () => pluginInfo,
  sequence: () => import_sequence.sequence,
  utils: () => utils
});
module.exports = __toCommonJS(stdin_exports);
var import_sequence = require("./sequence");
var import_handlers = require("./handlers/index");
var import_components = require("./components/index");
const pluginInfo = {
  id: "app-shell-symphony",
  name: "App Shell Symphony",
  version: "1.0.0",
  description: "Main application shell and layout management for RX.Evolution.client",
  author: "RenderX Team",
  type: "symphony",
  capabilities: ["layout", "shell", "navigation", "theme-management"],
  dependencies: [],
  spa: {
    tempo: 140,
    key: "G-major",
    movements: 4
  },
  evolution: {
    isCore: true,
    priority: 1,
    autoMount: true,
    layoutProvider: true
  }
};
const handlers = {
  onLayoutChange: import_handlers.onLayoutChange,
  onPanelToggle: import_handlers.onPanelToggle,
  onThemeChange: import_handlers.onThemeChange,
  onShellReady: import_handlers.onShellReady
};
const components = {
  MainComponent: import_components.MainComponent
};
const lifecycle = {
  /**
   * Called when plugin is loaded
   */
  onLoad: () => {
    console.log("\u{1F3BC} App Shell Symphony: Plugin loaded");
    if (typeof window !== "undefined") {
      if (!window.RenderX) {
        window.RenderX = {};
      }
      if (!window.RenderX.appShellState) {
        window.RenderX.appShellState = {
          layoutMode: "editor",
          panels: {
            elementLibrary: true,
            controlPanel: true
          },
          theme: "system",
          resolvedTheme: "light",
          isReady: false,
          loadedAt: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString()
        };
      }
    }
  },
  /**
   * Called when plugin is mounted to conductor
   */
  onMount: (conductor) => {
    console.log("\u{1F3BC} App Shell Symphony: Plugin mounted to conductor");
    if (typeof window !== "undefined") {
      if (!window.RenderX) {
        window.RenderX = {};
      }
      window.RenderX.appShellConductor = conductor;
    }
    if (typeof window !== "undefined" && window.RenderX?.eventBus) {
      window.RenderX.eventBus.emit("app-shell:plugin:ready", {
        pluginId: pluginInfo.id,
        capabilities: pluginInfo.capabilities,
        timestamp: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  },
  /**
   * Called when plugin is unmounted
   */
  onUnmount: () => {
    console.log("\u{1F3BC} App Shell Symphony: Plugin unmounted");
    if (typeof window !== "undefined" && window.RenderX) {
      delete window.RenderX.appShellConductor;
    }
  },
  /**
   * Called when plugin encounters an error
   */
  onError: (error, context) => {
    console.error("\u{1F6A8} App Shell Symphony: Plugin error:", error);
    if (typeof window !== "undefined" && window.RenderX?.eventBus) {
      window.RenderX.eventBus.emit("app-shell:plugin:error", {
        pluginId: pluginInfo.id,
        error: error.message,
        context,
        timestamp: /* @__PURE__ */ (/* @__PURE__ */ new Date()).toISOString()
      });
    }
  }
};
const utils = {
  /**
   * Get app shell state
   */
  getAppShellState: () => {
    if (typeof window !== "undefined" && window.RenderX?.appShellState) {
      return window.RenderX.appShellState;
    }
    return null;
  },
  /**
   * Get current layout mode
   */
  getLayoutMode: () => {
    const state = utils.getAppShellState();
    return state?.layoutMode || "editor";
  },
  /**
   * Get panel visibility state
   */
  getPanelState: (panelName) => {
    const state = utils.getAppShellState();
    return state?.panels?.[panelName] || false;
  },
  /**
   * Get current theme
   */
  getCurrentTheme: () => {
    const state = utils.getAppShellState();
    return {
      theme: state?.theme || "system",
      resolvedTheme: state?.resolvedTheme || "light"
    };
  },
  /**
   * Check if shell is ready
   */
  isShellReady: () => {
    const state = utils.getAppShellState();
    return state?.isReady || false;
  }
};
var CIAPlugin = {
  mount: (conductor, eventBus) => {
    console.log("\u{1F3BC} App Shell Symphony: Mounting via CIA interface...");
    try {
      lifecycle.onMount(conductor);
      if (eventBus) {
        eventBus.subscribe("layout:change", import_handlers.onLayoutChange);
        eventBus.subscribe("panel:toggle", import_handlers.onPanelToggle);
        eventBus.subscribe("theme:change", import_handlers.onThemeChange);
        eventBus.subscribe("shell:ready", import_handlers.onShellReady);
      }
      console.log("\u2705 App Shell Symphony: Mounted successfully");
      return true;
    } catch (error) {
      console.error("\u{1F6A8} App Shell Symphony: Mount failed:", error);
      lifecycle.onError(error, "mount");
      return false;
    }
  },
  unmount: (conductor, eventBus) => {
    console.log("\u{1F3BC} App Shell Symphony: Unmounting via CIA interface...");
    try {
      if (eventBus) {
        eventBus.unsubscribe("layout:change", import_handlers.onLayoutChange);
        eventBus.unsubscribe("panel:toggle", import_handlers.onPanelToggle);
        eventBus.unsubscribe("theme:change", import_handlers.onThemeChange);
        eventBus.unsubscribe("shell:ready", import_handlers.onShellReady);
      }
      lifecycle.onUnmount();
      console.log("\u2705 App Shell Symphony: Unmounted successfully");
      return true;
    } catch (error) {
      console.error("\u{1F6A8} App Shell Symphony: Unmount failed:", error);
      lifecycle.onError(error, "unmount");
      return false;
    }
  }
};
var stdin_default = CIAPlugin;
if (typeof window !== "undefined" && window.RenderX?.debug) {
  if (!import_sequence.sequence || !import_sequence.sequence.id || !import_sequence.sequence.movements) {
    console.error("\u{1F6A8} App Shell Symphony: Invalid sequence structure");
  }
  if (!handlers || typeof handlers !== "object") {
    console.error("\u{1F6A8} App Shell Symphony: Invalid handlers structure");
  }
  if (!components || typeof components !== "object") {
    console.error("\u{1F6A8} App Shell Symphony: Invalid components structure");
  }
  if (import_sequence.sequence && import_sequence.sequence.movements && handlers) {
    import_sequence.sequence.movements.forEach((movement) => {
      if (!handlers[movement.label]) {
        console.error(
          `\u{1F6A8} App Shell Symphony: Missing handler for movement: ${movement.label}`
        );
      }
    });
  }
  console.log(
    "\u2705 App Shell Symphony: Plugin structure validation complete"
  );
}
