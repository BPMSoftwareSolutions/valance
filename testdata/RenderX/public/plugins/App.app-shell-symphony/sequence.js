/**
 * App Shell Symphony Sequence Definition
 * 
 * Defines the musical sequence for application shell operations including
 * layout management, theme switching, panel toggling, and navigation.
 * 
 * Based on SPA (Symphonic Plugin Architecture) sequence contract
 */

export const sequence = {
  id: "app-shell-symphony",
  name: "App Shell Symphony",
  version: "1.0.0",
  tempo: 140,
  key: "G-major",
  movements: [
    {
      label: "onLayoutChange",
      beat: 1,
      duration: 200,
      description: "Handle layout mode changes (editor, preview, fullscreen)",
      timing: "immediate",
      errorHandling: "continue"
    },
    {
      label: "onPanelToggle",
      beat: 2,
      duration: 150,
      description: "Toggle visibility of panels (element library, control panel)",
      timing: "immediate",
      errorHandling: "continue"
    },
    {
      label: "onThemeChange",
      beat: 3,
      duration: 100,
      description: "Handle theme switching (light, dark, system)",
      timing: "immediate",
      errorHandling: "continue"
    },
    {
      label: "onShellReady",
      beat: 4,
      duration: 300,
      description: "Initialize shell and coordinate with other plugins",
      timing: "delayed",
      errorHandling: "continue"
    }
  ],
  metadata: {
    category: "app-shell",
    priority: "high",
    dependencies: [],
    capabilities: ["layout", "shell", "navigation", "theme-management"]
  }
};
