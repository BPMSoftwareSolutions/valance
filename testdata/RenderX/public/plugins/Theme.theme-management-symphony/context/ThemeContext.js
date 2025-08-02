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
  ThemeProvider: () => ThemeProvider,
  default: () => stdin_default,
  useTheme: () => useTheme
});
module.exports = __toCommonJS(stdin_exports);
var import_jsx_runtime = require("react/jsx-runtime");
var import_react = __toESM(require("react"));
const ThemeContext = (0, import_react.createContext)({
  theme: "system",
  resolvedTheme: "light",
  toggleTheme: () => {
  }
});
const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = (0, import_react.useState)("system");
  const [resolvedTheme, setResolvedTheme] = (0, import_react.useState)("light");
  const detectSystemTheme = () => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
  };
  (0, import_react.useEffect)(() => {
    const savedTheme = localStorage.getItem("renderx-theme") || "system";
    setTheme(savedTheme);
    if (savedTheme === "system") {
      setResolvedTheme(detectSystemTheme());
    } else {
      setResolvedTheme(savedTheme);
    }
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = (e) => {
      if (theme === "system") {
        setResolvedTheme(e.matches ? "dark" : "light");
        const eventBus = window.renderxCommunicationSystem?.eventBus;
        if (eventBus) {
          eventBus.emit("theme.system-detected", {
            systemTheme: e.matches ? "dark" : "light",
            timestamp: Date.now()
          });
        }
      }
    };
    mediaQuery.addEventListener("change", handleSystemThemeChange);
    return () => mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, [theme]);
  const toggleTheme = () => {
    const themes = ["light", "dark", "system"];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
    localStorage.setItem("renderx-theme", nextTheme);
    if (nextTheme === "system") {
      setResolvedTheme(detectSystemTheme());
    } else {
      setResolvedTheme(nextTheme);
    }
    const eventBus = window.renderxCommunicationSystem?.eventBus;
    if (eventBus) {
      eventBus.emit("theme.changed", {
        previousTheme: theme,
        newTheme: nextTheme,
        resolvedTheme: nextTheme === "system" ? detectSystemTheme() : nextTheme,
        timestamp: Date.now()
      });
    }
    console.log(`\u{1F3A8} Theme changed: ${theme} \u2192 ${nextTheme}`);
  };
  (0, import_react.useEffect)(() => {
    document.documentElement.setAttribute("data-theme", resolvedTheme);
    document.documentElement.className = resolvedTheme;
  }, [resolvedTheme]);
  const contextValue = {
    theme,
    resolvedTheme,
    toggleTheme
  };
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeContext.Provider, { value: contextValue, children });
};
const useTheme = () => {
  const context = (0, import_react.useContext)(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
var stdin_default = ThemeContext;
