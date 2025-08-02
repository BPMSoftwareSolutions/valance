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
  onSystemThemeChange: () => onSystemThemeChange,
  onSystemThemeDetection: () => onSystemThemeDetection,
  onThemeApplication: () => onThemeApplication,
  onThemeContextInit: () => onThemeContextInit,
  onThemeLoad: () => onThemeLoad,
  onThemePersistence: () => onThemePersistence,
  onThemeSync: () => onThemeSync,
  onThemeToggleRequest: () => onThemeToggleRequest,
  onThemeValidation: () => onThemeValidation
});
module.exports = __toCommonJS(stdin_exports);
const onSystemThemeDetection = (eventData, context) => {
  console.log("\u{1F3A8} Detecting system theme preference...");
  const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  context.eventBus.emit("theme.system-detected", {
    systemTheme,
    timestamp: Date.now(),
    source: "theme-management-symphony"
  });
  return { systemTheme };
};
const onThemeLoad = (eventData, context) => {
  console.log("\u{1F3A8} Loading saved theme preference...");
  const savedTheme = localStorage.getItem("renderx-theme") || "system";
  context.eventBus.emit("theme.loaded", {
    savedTheme,
    timestamp: Date.now(),
    source: "theme-management-symphony"
  });
  return { savedTheme };
};
const onThemeContextInit = (eventData, context) => {
  console.log("\u{1F3A8} Initializing theme context...");
  context.eventBus.emit("theme.context-initialized", {
    timestamp: Date.now(),
    source: "theme-management-symphony"
  });
  return { contextInitialized: true };
};
const onThemeToggleRequest = (eventData, context) => {
  console.log("\u{1F3A8} Processing theme toggle request...");
  const currentTheme = eventData.currentTheme || "system";
  const themes = ["light", "dark", "system"];
  const currentIndex = themes.indexOf(currentTheme);
  const nextTheme = themes[(currentIndex + 1) % themes.length];
  context.eventBus.emit("theme.toggle-processed", {
    previousTheme: currentTheme,
    nextTheme,
    timestamp: Date.now(),
    source: "theme-management-symphony"
  });
  return { previousTheme: currentTheme, nextTheme };
};
const onThemeValidation = (eventData, context) => {
  console.log("\u{1F3A8} Validating theme selection...");
  const validThemes = ["light", "dark", "system"];
  const isValid = validThemes.includes(eventData.nextTheme);
  if (!isValid) {
    console.warn(`\u26A0\uFE0F Invalid theme: ${eventData.nextTheme}, defaulting to system`);
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
const onThemeApplication = (eventData, context) => {
  console.log(`\u{1F3A8} Applying theme: ${eventData.validatedTheme}`);
  const resolvedTheme = eventData.validatedTheme === "system" ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light" : eventData.validatedTheme;
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
const onThemePersistence = (eventData, context) => {
  console.log(`\u{1F3A8} Persisting theme: ${eventData.appliedTheme}`);
  localStorage.setItem("renderx-theme", eventData.appliedTheme);
  context.eventBus.emit("theme.persisted", {
    theme: eventData.appliedTheme,
    timestamp: Date.now(),
    source: "theme-management-symphony"
  });
  return { persisted: true, theme: eventData.appliedTheme };
};
const onSystemThemeChange = (eventData, context) => {
  console.log("\u{1F3A8} System theme changed, syncing...");
  const newSystemTheme = eventData.matches ? "dark" : "light";
  context.eventBus.emit("theme.system-changed", {
    newSystemTheme,
    timestamp: Date.now(),
    source: "theme-management-symphony"
  });
  return { newSystemTheme };
};
const onThemeSync = (eventData, context) => {
  console.log("\u{1F3A8} Syncing with system theme...");
  const currentTheme = localStorage.getItem("renderx-theme") || "system";
  if (currentTheme === "system") {
    const resolvedTheme = eventData.newSystemTheme;
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
