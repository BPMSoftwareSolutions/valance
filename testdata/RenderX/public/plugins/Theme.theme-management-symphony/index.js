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
  THEME_MANAGEMENT_SEQUENCE: () => THEME_MANAGEMENT_SEQUENCE,
  startThemeManagementFlow: () => startThemeManagementFlow,
  startThemeToggleFlow: () => startThemeToggleFlow,
  onSystemThemeDetection: () => onSystemThemeDetection,
  onThemeLoad: () => onThemeLoad,
  onThemeContextInit: () => onThemeContextInit,
  onThemeToggleRequest: () => onThemeToggleRequest,
  onThemeValidation: () => onThemeValidation,
  onThemeApplication: () => onThemeApplication,
  onThemePersistence: () => onThemePersistence,
  onSystemThemeChange: () => onSystemThemeChange,
  onThemeSync: () => onThemeSync,
  ThemeProvider: () => ThemeProvider,
  useTheme: () => useTheme,
  ThemeToggleButton: () => ThemeToggleButton,
  PLUGIN_INFO: () => PLUGIN_INFO,
  sequence: () => THEME_MANAGEMENT_SEQUENCE,
  default: () => ThemeManagementPlugin,
  CIAPlugin: () => ThemeManagementPlugin
});
module.exports = __toCommonJS(stdin_exports);
var THEME_MANAGEMENT_SEQUENCE = {
  name: "Theme Management Symphony No. 1",
  description: "Orchestrates theme initialization, switching, and persistence",
  version: "1.0.0",
  movements: [
    {
      name: "Theme Initialization",
      description: "Initialize theme system and detect preferences",
      steps: [
        {
          action: "detect-system-theme",
          description: "Detect user's system theme preference",
          handler: "onSystemThemeDetection"
        },
        {
          action: "load-saved-theme",
          description: "Load previously saved theme preference",
          handler: "onThemeLoad"
        },
        {
          action: "initialize-theme-context",
          description: "Initialize React theme context",
          handler: "onThemeContextInit"
        }
      ]
    },
    {
      name: "Theme Switching",
      description: "Handle theme switching operations",
      steps: [
        {
          action: "theme-toggle-requested",
          description: "User requests theme toggle",
          handler: "onThemeToggleRequest"
        },
        {
          action: "theme-validation",
          description: "Validate theme selection",
          handler: "onThemeValidation"
        },
        {
          action: "theme-application",
          description: "Apply new theme to UI",
          handler: "onThemeApplication"
        },
        {
          action: "theme-persistence",
          description: "Save theme preference",
          handler: "onThemePersistence"
        }
      ]
    },
    {
      name: "Theme Monitoring",
      description: "Monitor system theme changes",
      steps: [
        {
          action: "system-theme-change",
          description: "System theme preference changed",
          handler: "onSystemThemeChange"
        },
        {
          action: "theme-sync",
          description: "Sync with system theme if needed",
          handler: "onThemeSync"
        }
      ]
    }
  ],
  events: {
    triggers: [
      "app.initialized",
      "ui.theme-toggle-clicked",
      "system.theme-changed"
    ],
    emits: [
      "theme.changed",
      "theme.initialized",
      "theme.system-detected",
      "theme.persisted"
    ]
  }
};
var startThemeManagementFlow = (eventBus, initialData = {}) => {
  console.log("\u{1F3A8} Starting Theme Management Symphony...");
  eventBus.emit("sequence.theme-management.started", {
    sequence: THEME_MANAGEMENT_SEQUENCE,
    timestamp: Date.now(),
    ...initialData
  });
  return THEME_MANAGEMENT_SEQUENCE;
};
var startThemeToggleFlow = (eventBus, toggleData = {}) => {
  console.log("\u{1F504} Starting Theme Toggle Flow...");
  eventBus.emit("theme.toggle-requested", {
    timestamp: Date.now(),
    ...toggleData
  });
  return {
    movement: "Theme Switching",
    action: "theme-toggle-requested"
  };
};
var onSystemThemeDetection = (eventData, context) => {
  console.log("\u{1F3A8} Detecting system theme preference...");
  var systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  context.eventBus.emit("theme.system-detected", {
    systemTheme,
    timestamp: Date.now(),
    source: "theme-management-symphony"
  });
  return { systemTheme };
};
var onThemeLoad = (eventData, context) => {
  console.log("\u{1F3A8} Loading saved theme preference...");
  var savedTheme = localStorage.getItem("renderx-theme") || "system";
  context.eventBus.emit("theme.loaded", {
    savedTheme,
    timestamp: Date.now(),
    source: "theme-management-symphony"
  });
  return { savedTheme };
};
var onThemeContextInit = (eventData, context) => {
  console.log("\u{1F3A8} Initializing theme context...");
  context.eventBus.emit("theme.context-initialized", {
    timestamp: Date.now(),
    source: "theme-management-symphony"
  });
  return { contextInitialized: true };
};
var onThemeToggleRequest = (eventData, context) => {
  console.log("\u{1F3A8} Processing theme toggle request...");
  var currentTheme = eventData.currentTheme || "system";
  var themes = ["light", "dark", "system"];
  var currentIndex = themes.indexOf(currentTheme);
  var nextTheme = themes[(currentIndex + 1) % themes.length];
  context.eventBus.emit("theme.toggle-processed", {
    previousTheme: currentTheme,
    nextTheme,
    timestamp: Date.now(),
    source: "theme-management-symphony"
  });
  return { previousTheme: currentTheme, nextTheme };
};
var onThemeValidation = (eventData, context) => {
  console.log("\u{1F3A8} Validating theme selection...");
  var validThemes = ["light", "dark", "system"];
  var isValid = validThemes.includes(eventData.nextTheme);
  if (!isValid) {
    console.warn(
      `\u26A0\uFE0F Invalid theme: ${eventData.nextTheme}, defaulting to system`
    );
    eventData.nextTheme = "system";
  }
  context.eventBus.emit("theme.validated", {
    theme: eventData.nextTheme,
    isValid,
    timestamp: Date.now(),
    source: "theme-management-symphony"
  });
  return { validatedTheme: eventData.nextTheme, isValid };
};
var onThemeApplication = (eventData, context) => {
  console.log(`\u{1F3A8} Applying theme: ${eventData.validatedTheme}`);
  var resolvedTheme = eventData.validatedTheme === "system" ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light" : eventData.validatedTheme;
  document.documentElement.setAttribute("data-theme", resolvedTheme);
  document.documentElement.className = resolvedTheme;
  context.eventBus.emit("theme.applied", {
    theme: eventData.validatedTheme,
    resolvedTheme,
    timestamp: Date.now(),
    source: "theme-management-symphony"
  });
  return { appliedTheme: eventData.validatedTheme, resolvedTheme };
};
var onThemePersistence = (eventData, context) => {
  console.log(`\u{1F3A8} Persisting theme: ${eventData.appliedTheme}`);
  localStorage.setItem("renderx-theme", eventData.appliedTheme);
  context.eventBus.emit("theme.persisted", {
    theme: eventData.appliedTheme,
    timestamp: Date.now(),
    source: "theme-management-symphony"
  });
  return { persisted: true, theme: eventData.appliedTheme };
};
var onSystemThemeChange = (eventData, context) => {
  console.log("\u{1F3A8} System theme changed, syncing...");
  var newSystemTheme = eventData.matches ? "dark" : "light";
  context.eventBus.emit("theme.system-changed", {
    newSystemTheme,
    timestamp: Date.now(),
    source: "theme-management-symphony"
  });
  return { newSystemTheme };
};
var onThemeSync = (eventData, context) => {
  console.log("\u{1F3A8} Syncing with system theme...");
  var currentTheme = localStorage.getItem("renderx-theme") || "system";
  if (currentTheme === "system") {
    var resolvedTheme = eventData.newSystemTheme;
    document.documentElement.setAttribute("data-theme", resolvedTheme);
    document.documentElement.className = resolvedTheme;
    context.eventBus.emit("theme.synced", {
      resolvedTheme,
      timestamp: Date.now(),
      source: "theme-management-symphony"
    });
  }
  return { synced: currentTheme === "system" };
};
var ThemeProvider = ({ children }) => {
  return children;
};
var useTheme = () => {
  return {
    theme: "system",
    resolvedTheme: "light",
    toggleTheme: () => console.log("Theme toggle from plugin")
  };
};
var ThemeToggleButton = () => {
  var button = document.createElement("button");
  button.innerHTML = "\u{1F3A8} Theme";
  button.className = "theme-toggle-button";
  button.onclick = () => {
    var eventBus = window.renderxCommunicationSystem?.eventBus;
    if (eventBus) {
      eventBus.emit("ui.theme-toggle-clicked", { timestamp: Date.now() });
    }
  };
  return button;
};
var PLUGIN_INFO = {
  name: "Theme Management Symphony",
  version: "1.0.0",
  description: "Comprehensive theme management system with context provider",
  domain: "Theme",
  type: "symphony",
  capabilities: [
    "theme-provider",
    "theme-toggle",
    "theme-context",
    "system-theme-detection",
    "theme-persistence"
  ],
  mountPoints: ["theme-provider", "theme-toggle"]
};
var ThemeManagementPlugin = {
  mount: (conductor, eventBus) => {
    console.log("\u{1F3A8} Mounting Theme Management Symphony...");
    var handlers = {
      "theme.toggle-requested": onThemeToggleRequest,
      "theme.system-changed": onSystemThemeChange,
      "app.initialized": onSystemThemeDetection
    };
    Object.entries(handlers).forEach(([event, handler]) => {
      eventBus.on(event, (data) => handler(data, { eventBus, conductor }));
    });
    startThemeManagementFlow(eventBus);
    if (typeof window !== "undefined") {
      window.renderxPlugins = window.renderxPlugins || {};
      window.renderxPlugins["Theme.theme-management-symphony"] = {
        ThemeProvider,
        ThemeToggleButton,
        useTheme
      };
    }
    console.log("\u2705 Theme Management Symphony mounted successfully");
    return {
      success: true,
      handlers: Object.keys(handlers),
      mountPoints: PLUGIN_INFO.mountPoints
    };
  },
  unmount: (conductor, eventBus) => {
    console.log("\u{1F3A8} Unmounting Theme Management Symphony...");
    var events = [
      "theme.toggle-requested",
      "theme.system-changed",
      "app.initialized"
    ];
    events.forEach((event) => {
      eventBus.off(event);
    });
    if (typeof window !== "undefined" && window.renderxPlugins) {
      delete window.renderxPlugins["Theme.theme-management-symphony"];
    }
    console.log("\u2705 Theme Management Symphony unmounted successfully");
    return { success: true };
  }
};
