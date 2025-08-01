/**
 * App Shell Main Component for RX.Evolution.client
 * 
 * Provides the main application shell layout including header, navigation,
 * panel management, and theme switching. Replaces the inline components
 * from the original App.tsx with a pure plugin-based approach.
 */

import React, { useState, useEffect, useContext } from 'react';

/**
 * Theme Context for App Shell
 */
const ThemeContext = React.createContext({
  theme: 'system',
  resolvedTheme: 'light',
  toggleTheme: () => {}
});

/**
 * Theme Provider Component
 */
const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('system');
  const [resolvedTheme, setResolvedTheme] = useState('light');

  const toggleTheme = () => {
    const themes = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);

    // Simple resolution logic
    if (nextTheme === 'system') {
      setResolvedTheme(
        window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
      );
    } else {
      setResolvedTheme(nextTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, toggleTheme }}>
      <div className={`theme-${resolvedTheme}`}>{children}</div>
    </ThemeContext.Provider>
  );
};

/**
 * Theme Toggle Button Component
 */
const ThemeToggleButton = () => {
  const { theme, resolvedTheme, toggleTheme } = useContext(ThemeContext);

  const getThemeIcon = () => {
    if (theme === 'system') {
      return '🌓'; // System theme icon
    }
    return resolvedTheme === 'dark' ? '🌙' : '☀️';
  };

  const getThemeLabel = () => {
    if (theme === 'system') {
      return `System (${resolvedTheme})`;
    }
    return resolvedTheme === 'dark' ? 'Dark' : 'Light';
  };

  return (
    <button
      className="theme-toggle-button"
      onClick={toggleTheme}
      title={`Current theme: ${getThemeLabel()}. Click to toggle.`}
      aria-label={`Toggle theme. Current: ${getThemeLabel()}`}
    >
      <span className="theme-icon">{getThemeIcon()}</span>
    </button>
  );
};

/**
 * App Header Component
 */
const AppHeader = ({ appState, onLayoutChange, onPanelToggle }) => {
  const handleEnterPreview = () => {
    onLayoutChange('preview');
  };

  const handleEnterFullscreenPreview = () => {
    onLayoutChange('fullscreen-preview');
  };

  const handleToggleElementLibrary = () => {
    onPanelToggle('elementLibrary', !appState.panels.showElementLibrary);
  };

  const handleToggleControlPanel = () => {
    onPanelToggle('controlPanel', !appState.panels.showControlPanel);
  };

  if (appState.layoutMode !== 'editor') {
    return null; // Only show header in editor mode
  }

  return (
    <header className="app-header">
      <div className="app-header-left">
        <h1>RenderX Evolution</h1>
        <p>CIA & SPA Architecture</p>
        {appState.hasUnsavedChanges && (
          <span className="unsaved-indicator">● Unsaved changes</span>
        )}
      </div>

      <div className="app-header-center">
        {/* Panel Toggle Buttons */}
        <div className="panel-toggles">
          <button
            className={`panel-toggle-button ${
              appState.panels.showElementLibrary ? 'active' : ''
            }`}
            onClick={handleToggleElementLibrary}
            title={`${
              appState.panels.showElementLibrary ? 'Hide' : 'Show'
            } Element Library`}
          >
            📚 Library
          </button>
          <button
            className={`panel-toggle-button ${
              appState.panels.showControlPanel ? 'active' : ''
            }`}
            onClick={handleToggleControlPanel}
            title={`${
              appState.panels.showControlPanel ? 'Hide' : 'Show'
            } Control Panel`}
          >
            🎛️ Properties
          </button>
        </div>
      </div>

      <div className="app-header-right">
        <button
          className="preview-button"
          onClick={handleEnterPreview}
          title="Enter Preview Mode"
        >
          👁️ Preview
        </button>
        <button
          className="fullscreen-preview-button"
          onClick={handleEnterFullscreenPreview}
          title="Enter Fullscreen Preview"
        >
          ⛶ Fullscreen
        </button>
        <ThemeToggleButton />
      </div>
    </header>
  );
};

/**
 * Plugin Container Component
 * 
 * Renders other plugins in their designated areas
 */
const PluginContainer = ({ pluginId, conductor, className }) => {
  const [PluginComponent, setPluginComponent] = useState(null);

  useEffect(() => {
    // Get the main component for this plugin
    const component = conductor.getPluginComponent(pluginId, 'MainComponent');
    setPluginComponent(() => component);
  }, [pluginId, conductor]);

  if (!PluginComponent) {
    return (
      <div className={`plugin-loading ${className}`}>
        <p>Loading {pluginId}...</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <PluginComponent 
        conductor={conductor}
        pluginId={pluginId}
        eventBus={conductor.eventBus}
      />
    </div>
  );
};

/**
 * Main App Shell Component
 * 
 * Provides the complete application shell with layout management
 */
const AppShellComponent = ({ conductor, pluginId, eventBus }) => {
  // App state management
  const [appState, setAppState] = useState({
    layoutMode: 'editor',
    panels: {
      showElementLibrary: true,
      showControlPanel: true,
    },
    hasUnsavedChanges: false,
  });

  /**
   * Handle layout mode changes
   */
  const handleLayoutChange = async (newMode) => {
    setAppState(prev => ({
      ...prev,
      layoutMode: newMode
    }));

    // Trigger musical sequence for layout change
    if (conductor) {
      await conductor.startSequence('app-shell-symphony', {
        action: 'layoutChange',
        layoutMode: newMode,
        timestamp: Date.now()
      });
    }
  };

  /**
   * Handle panel toggle
   */
  const handlePanelToggle = async (panelName, newState) => {
    setAppState(prev => ({
      ...prev,
      panels: {
        ...prev.panels,
        [`show${panelName.charAt(0).toUpperCase() + panelName.slice(1)}`]: newState
      }
    }));

    // Trigger musical sequence for panel toggle
    if (conductor) {
      await conductor.startSequence('app-shell-symphony', {
        action: 'panelToggle',
        panelName,
        newState,
        timestamp: Date.now()
      });
    }
  };

  /**
   * Render layout based on current mode
   */
  const renderLayout = () => {
    const { layoutMode, panels } = appState;
    const { showElementLibrary, showControlPanel } = panels;

    // Layout class based on mode and panel visibility
    const layoutClass = [
      'app-layout',
      `layout-${layoutMode}`,
      showElementLibrary ? 'with-element-library' : 'without-element-library',
      showControlPanel ? 'with-control-panel' : 'without-control-panel'
    ].join(' ');

    if (layoutMode === 'fullscreen-preview') {
      return (
        <div className="fullscreen-preview-layout">
          <PluginContainer 
            pluginId="canvas-symphony" 
            conductor={conductor}
            className="fullscreen-canvas"
          />
        </div>
      );
    }

    if (layoutMode === 'preview') {
      return (
        <div className="preview-layout">
          <PluginContainer 
            pluginId="canvas-symphony" 
            conductor={conductor}
            className="preview-canvas"
          />
        </div>
      );
    }

    // Editor layout
    return (
      <div className={layoutClass}>
        {/* Element Library - Left Panel */}
        {showElementLibrary && (
          <aside className="app-sidebar left">
            <PluginContainer 
              pluginId="element-library-symphony" 
              conductor={conductor}
              className="element-library-container"
            />
          </aside>
        )}

        {/* Canvas - Center */}
        <section className="app-canvas">
          <PluginContainer 
            pluginId="canvas-symphony" 
            conductor={conductor}
            className="canvas-container"
          />
        </section>

        {/* Control Panel - Right Panel */}
        {showControlPanel && (
          <aside className="app-sidebar right">
            <PluginContainer 
              pluginId="control-panel-symphony" 
              conductor={conductor}
              className="control-panel-container"
            />
          </aside>
        )}
      </div>
    );
  };

  // Initialize shell when component mounts
  useEffect(() => {
    if (conductor) {
      conductor.startSequence('app-shell-symphony', {
        action: 'shellReady',
        timestamp: Date.now()
      });
    }
  }, [conductor]);

  return (
    <ThemeProvider>
      <div className="renderx-app app-shell-symphony">
        <AppHeader 
          appState={appState}
          onLayoutChange={handleLayoutChange}
          onPanelToggle={handlePanelToggle}
        />
        <main className="app-main">
          {renderLayout()}
        </main>
      </div>
    </ThemeProvider>
  );
};

export default AppShellComponent;
