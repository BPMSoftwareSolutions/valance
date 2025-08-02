/**
 * RenderX Evolution - Main Application Component
 * Lightweight Visual Shell for Component-Based Development
 * 
 * Refactored into modular components for better maintainability
 */

import React from "react";
import "./App.css";

// Import components
import AppContent from "./components/AppContent";
import { ThemeProvider } from "./providers/ThemeProvider";

// Main App Component with Providers
function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
