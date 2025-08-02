/**
 * Theme Context and Provider
 * Extracted from App.tsx for plugin-based architecture
 */

import React, { useState, useEffect, createContext, useContext } from "react";

// Theme Context Type
const ThemeContext = createContext({
  theme: "system",
  resolvedTheme: "light",
  toggleTheme: () => {},
});

// Theme Provider Component
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("system");
  const [resolvedTheme, setResolvedTheme] = useState("light");

  // Detect system theme preference
  const detectSystemTheme = () => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light";
  };

  // Initialize theme on mount
  useEffect(() => {
    // Load saved theme preference
    const savedTheme = localStorage.getItem("renderx-theme") || "system";
    setTheme(savedTheme);

    // Set initial resolved theme
    if (savedTheme === "system") {
      setResolvedTheme(detectSystemTheme());
    } else {
      setResolvedTheme(savedTheme);
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = (e) => {
      if (theme === "system") {
        setResolvedTheme(e.matches ? "dark" : "light");

        // Emit theme change event
        const eventBus = window.renderxCommunicationSystem?.eventBus;
        if (eventBus) {
          eventBus.emit("theme.system-detected", {
            systemTheme: e.matches ? "dark" : "light",
            timestamp: Date.now(),
          });
        }
      }
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);
    return () =>
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, [theme]);

  // Theme toggle function
  const toggleTheme = () => {
    const themes = ["light", "dark", "system"];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];

    setTheme(nextTheme);
    localStorage.setItem("renderx-theme", nextTheme);

    // Update resolved theme
    if (nextTheme === "system") {
      setResolvedTheme(detectSystemTheme());
    } else {
      setResolvedTheme(nextTheme);
    }

    // Emit theme change event
    const eventBus = window.renderxCommunicationSystem?.eventBus;
    if (eventBus) {
      eventBus.emit("theme.changed", {
        previousTheme: theme,
        newTheme: nextTheme,
        resolvedTheme: nextTheme === "system" ? detectSystemTheme() : nextTheme,
        timestamp: Date.now(),
      });
    }

    console.log(`🎨 Theme changed: ${theme} → ${nextTheme}`);
  };

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", resolvedTheme);
    document.documentElement.className = resolvedTheme;
  }, [resolvedTheme]);

  const contextValue = {
    theme,
    resolvedTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Theme Hook
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export default ThemeContext;
