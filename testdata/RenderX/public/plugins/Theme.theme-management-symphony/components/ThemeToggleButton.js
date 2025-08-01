/**
 * Theme Toggle Button Component
 * Extracted from App.tsx for plugin-based architecture
 */

import React from 'react';
import { useTheme } from '../context/ThemeContext.js';

export const ThemeToggleButton = () => {
  const { theme, resolvedTheme, toggleTheme } = useTheme();

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return '☀️';
      case 'dark':
        return '🌙';
      case 'system':
        return '🖥️';
      default:
        return '🎨';
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light Mode';
      case 'dark':
        return 'Dark Mode';
      case 'system':
        return `System (${resolvedTheme})`;
      default:
        return 'Theme';
    }
  };

  const handleClick = () => {
    // Emit UI event before toggling
    const eventBus = (window as any).renderxCommunicationSystem?.eventBus;
    if (eventBus) {
      eventBus.emit('ui.theme-toggle-clicked', {
        currentTheme: theme,
        resolvedTheme: resolvedTheme,
        timestamp: Date.now()
      });
    }

    toggleTheme();
  };

  return (
    <button
      className="theme-toggle-button"
      onClick={handleClick}
      title={`Current: ${getThemeLabel()}. Click to cycle themes.`}
      aria-label={`Switch theme. Current: ${getThemeLabel()}`}
    >
      <span className="theme-icon" role="img" aria-hidden="true">
        {getThemeIcon()}
      </span>
      <span className="theme-label">
        {getThemeLabel()}
      </span>
    </button>
  );
};

export default ThemeToggleButton;
