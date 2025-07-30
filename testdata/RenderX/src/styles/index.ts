/**
 * RenderX Evolution - Styles Index
 * 
 * Central export point for all styling utilities and theme management.
 * Provides TypeScript interfaces for theme variables and utility functions.
 * 
 * @version 1.0.0
 * @author RenderX Evolution Team
 * @date 2025-07-29
 */

// Import global styles
import './global.css';

/**
 * Theme Variables Interface
 * TypeScript interface for CSS custom properties
 */
export interface ThemeVariables {
  // Base Colors
  primaryColor: string;
  primaryHover: string;
  secondaryColor: string;
  successColor: string;
  warningColor: string;
  errorColor: string;

  // Theme Colors
  themeBgPrimary: string;
  themeBgSecondary: string;
  themeBgTertiary: string;
  themeTextPrimary: string;
  themeTextSecondary: string;
  themeTextMuted: string;
  themeBorder: string;
  themeBorderLight: string;
  themeBorderDark: string;
  themeAccent: string;

  // Legacy Variables
  bgColor: string;
  textColor: string;
  border: string;
  padding: string;
  borderRadius: string;
  fontSize: string;

  // Typography
  appFontFamily: string;
  fontSizeXs: string;
  fontSizeSm: string;
  fontSizeBase: string;
  fontSizeLg: string;
  fontSizeXl: string;

  // Spacing
  spacingXs: string;
  spacingSm: string;
  spacingMd: string;
  spacingLg: string;
  spacingXl: string;

  // Shadows
  shadowSm: string;
  shadowMd: string;
  shadowLg: string;

  // Border Radius
  radiusSm: string;
  radiusMd: string;
  radiusLg: string;

  // Transitions
  transitionFast: string;
  transitionNormal: string;
  transitionSlow: string;
}

/**
 * Theme Management Utilities
 */
export const ThemeUtils = {
  /**
   * Get CSS variable value
   * @param variableName - CSS variable name (without --)
   * @returns CSS variable value
   */
  getCSSVariable: (variableName: string): string => {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(`--${variableName}`)
      .trim();
  },

  /**
   * Set CSS variable value
   * @param variableName - CSS variable name (without --)
   * @param value - CSS variable value
   */
  setCSSVariable: (variableName: string, value: string): void => {
    document.documentElement.style.setProperty(`--${variableName}`, value);
  },

  /**
   * Apply theme
   * @param theme - Theme name ('light' | 'dark')
   */
  applyTheme: (theme: 'light' | 'dark'): void => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${theme}`);
  },

  /**
   * Get current theme
   * @returns Current theme name
   */
  getCurrentTheme: (): 'light' | 'dark' => {
    const theme = document.documentElement.getAttribute('data-theme');
    return theme === 'dark' ? 'dark' : 'light';
  },

  /**
   * Toggle theme
   */
  toggleTheme: (): void => {
    const currentTheme = ThemeUtils.getCurrentTheme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    ThemeUtils.applyTheme(newTheme);
  },

  /**
   * Detect system theme preference
   * @returns System theme preference
   */
  getSystemTheme: (): 'light' | 'dark' => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  },

  /**
   * Apply system theme
   */
  applySystemTheme: (): void => {
    const systemTheme = ThemeUtils.getSystemTheme();
    ThemeUtils.applyTheme(systemTheme);
  }
};

/**
 * Legacy CSS Variables
 * Direct access to legacy system variables for backward compatibility
 */
export const LegacyVariables = {
  bgColor: 'var(--bg-color)',
  textColor: 'var(--text-color)',
  border: 'var(--border)',
  padding: 'var(--padding)',
  borderRadius: 'var(--border-radius)',
  fontSize: 'var(--font-size)'
};

/**
 * Component Style Generators
 * Utility functions for generating component styles
 */
export const StyleGenerators = {
  /**
   * Generate button styles with legacy variables
   * @param variant - Button variant
   * @returns CSS styles object
   */
  generateButtonStyles: (variant: 'primary' | 'secondary' | 'default' = 'default') => ({
    backgroundColor: LegacyVariables.bgColor,
    color: LegacyVariables.textColor,
    border: LegacyVariables.border,
    padding: LegacyVariables.padding,
    borderRadius: LegacyVariables.borderRadius,
    fontSize: LegacyVariables.fontSize,
    cursor: 'pointer',
    transition: 'var(--transition-normal)',
    ...(variant === 'primary' && {
      backgroundColor: 'var(--primary-color)',
      color: '#ffffff',
      border: '1px solid var(--primary-color)'
    }),
    ...(variant === 'secondary' && {
      backgroundColor: 'transparent',
      color: 'var(--primary-color)',
      border: '1px solid var(--primary-color)'
    })
  }),

  /**
   * Generate input styles with legacy variables
   * @returns CSS styles object
   */
  generateInputStyles: () => ({
    backgroundColor: LegacyVariables.bgColor,
    color: LegacyVariables.textColor,
    border: LegacyVariables.border,
    padding: LegacyVariables.padding,
    borderRadius: LegacyVariables.borderRadius,
    fontSize: LegacyVariables.fontSize,
    transition: 'var(--transition-normal)'
  }),

  /**
   * Generate container styles with legacy variables
   * @returns CSS styles object
   */
  generateContainerStyles: () => ({
    backgroundColor: 'transparent',
    border: LegacyVariables.border,
    borderRadius: LegacyVariables.borderRadius,
    padding: LegacyVariables.padding
  })
};

/**
 * Export theme constants
 */
export const THEME_CONSTANTS = {
  LIGHT: 'light' as const,
  DARK: 'dark' as const,
  SYSTEM: 'system' as const
};

export type ThemeType = typeof THEME_CONSTANTS[keyof typeof THEME_CONSTANTS];
