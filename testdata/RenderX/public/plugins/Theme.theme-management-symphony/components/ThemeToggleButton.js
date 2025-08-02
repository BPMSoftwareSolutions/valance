var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var stdin_exports = {};
__export(stdin_exports, {
  ThemeToggleButton: () => ThemeToggleButton,
  default: () => stdin_default
});
module.exports = __toCommonJS(stdin_exports);
var import_jsx_runtime = require("react/jsx-runtime");
var import_react = __toESM(require("react"));
var import_ThemeContext = require("../context/ThemeContext.js");
const ThemeToggleButton = () => {
  const { theme, resolvedTheme, toggleTheme } = (0, import_ThemeContext.useTheme)();
  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return "\u2600\uFE0F";
      case "dark":
        return "\u{1F319}";
      case "system":
        return "\u{1F5A5}\uFE0F";
      default:
        return "\u{1F3A8}";
    }
  };
  const getThemeLabel = () => {
    switch (theme) {
      case "light":
        return "Light Mode";
      case "dark":
        return "Dark Mode";
      case "system":
        return `System (${resolvedTheme})`;
      default:
        return "Theme";
    }
  };
  const handleClick = () => {
    const eventBus = window.renderxCommunicationSystem?.eventBus;
    if (eventBus) {
      eventBus.emit("ui.theme-toggle-clicked", {
        currentTheme: theme,
        resolvedTheme,
        timestamp: Date.now()
      });
    }
    toggleTheme();
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
    "button",
    {
      className: "theme-toggle-button",
      onClick: handleClick,
      title: `Current: ${getThemeLabel()}. Click to cycle themes.`,
      "aria-label": `Switch theme. Current: ${getThemeLabel()}`,
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "theme-icon", role: "img", "aria-hidden": "true", children: getThemeIcon() }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "theme-label", children: getThemeLabel() })
      ]
    }
  );
};
var stdin_default = ThemeToggleButton;
