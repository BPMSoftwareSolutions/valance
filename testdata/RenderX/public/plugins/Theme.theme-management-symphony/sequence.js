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
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var stdin_exports = {};
__export(stdin_exports, {
  THEME_MANAGEMENT_SEQUENCE: () => THEME_MANAGEMENT_SEQUENCE,
  startThemeManagementFlow: () => startThemeManagementFlow,
  startThemeToggleFlow: () => startThemeToggleFlow
});
module.exports = __toCommonJS(stdin_exports);
const THEME_MANAGEMENT_SEQUENCE = {
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
const startThemeManagementFlow = (eventBus, initialData = {}) => {
  console.log("\u{1F3A8} Starting Theme Management Symphony...");
  eventBus.emit("sequence.theme-management.started", {
    sequence: THEME_MANAGEMENT_SEQUENCE,
    timestamp: Date.now(),
    ...initialData
  });
  return THEME_MANAGEMENT_SEQUENCE;
};
const startThemeToggleFlow = (eventBus, toggleData = {}) => {
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
