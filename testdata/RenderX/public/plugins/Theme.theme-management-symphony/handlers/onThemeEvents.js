/**
 * Theme Event Handlers
 * Handle theme-related events in the musical sequence
 */

// System theme detection handler
export const onSystemThemeDetection = (eventData, context) => {
  console.log("🎨 Detecting system theme preference...");
  
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  
  context.eventBus.emit('theme.system-detected', {
    systemTheme,
    timestamp: Date.now(),
    source: 'theme-management-symphony'
  });
  
  return { systemTheme };
};

// Theme loading handler
export const onThemeLoad = (eventData, context) => {
  console.log("🎨 Loading saved theme preference...");
  
  const savedTheme = localStorage.getItem('renderx-theme') || 'system';
  
  context.eventBus.emit('theme.loaded', {
    savedTheme,
    timestamp: Date.now(),
    source: 'theme-management-symphony'
  });
  
  return { savedTheme };
};

// Theme context initialization handler
export const onThemeContextInit = (eventData, context) => {
  console.log("🎨 Initializing theme context...");
  
  context.eventBus.emit('theme.context-initialized', {
    timestamp: Date.now(),
    source: 'theme-management-symphony'
  });
  
  return { contextInitialized: true };
};

// Theme toggle request handler
export const onThemeToggleRequest = (eventData, context) => {
  console.log("🎨 Processing theme toggle request...");
  
  const currentTheme = eventData.currentTheme || 'system';
  const themes = ['light', 'dark', 'system'];
  const currentIndex = themes.indexOf(currentTheme);
  const nextTheme = themes[(currentIndex + 1) % themes.length];
  
  context.eventBus.emit('theme.toggle-processed', {
    previousTheme: currentTheme,
    nextTheme,
    timestamp: Date.now(),
    source: 'theme-management-symphony'
  });
  
  return { previousTheme: currentTheme, nextTheme };
};

// Theme validation handler
export const onThemeValidation = (eventData, context) => {
  console.log("🎨 Validating theme selection...");
  
  const validThemes = ['light', 'dark', 'system'];
  const isValid = validThemes.includes(eventData.nextTheme);
  
  if (!isValid) {
    console.warn(`⚠️ Invalid theme: ${eventData.nextTheme}, defaulting to system`);
    eventData.nextTheme = 'system';
  }
  
  context.eventBus.emit('theme.validated', {
    theme: eventData.nextTheme,
    isValid,
    timestamp: Date.now(),
    source: 'theme-management-symphony'
  });
  
  return { validatedTheme: eventData.nextTheme, isValid };
};

// Theme application handler
export const onThemeApplication = (eventData, context) => {
  console.log(`🎨 Applying theme: ${eventData.validatedTheme}`);
  
  const resolvedTheme = eventData.validatedTheme === 'system' 
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : eventData.validatedTheme;
  
  // Apply to document
  document.documentElement.setAttribute('data-theme', resolvedTheme);
  document.documentElement.className = resolvedTheme;
  
  context.eventBus.emit('theme.applied', {
    theme: eventData.validatedTheme,
    resolvedTheme,
    timestamp: Date.now(),
    source: 'theme-management-symphony'
  });
  
  return { appliedTheme: eventData.validatedTheme, resolvedTheme };
};

// Theme persistence handler
export const onThemePersistence = (eventData, context) => {
  console.log(`🎨 Persisting theme: ${eventData.appliedTheme}`);
  
  localStorage.setItem('renderx-theme', eventData.appliedTheme);
  
  context.eventBus.emit('theme.persisted', {
    theme: eventData.appliedTheme,
    timestamp: Date.now(),
    source: 'theme-management-symphony'
  });
  
  return { persisted: true, theme: eventData.appliedTheme };
};

// System theme change handler
export const onSystemThemeChange = (eventData, context) => {
  console.log("🎨 System theme changed, syncing...");
  
  const newSystemTheme = eventData.matches ? 'dark' : 'light';
  
  context.eventBus.emit('theme.system-changed', {
    newSystemTheme,
    timestamp: Date.now(),
    source: 'theme-management-symphony'
  });
  
  return { newSystemTheme };
};

// Theme sync handler
export const onThemeSync = (eventData, context) => {
  console.log("🎨 Syncing with system theme...");
  
  const currentTheme = localStorage.getItem('renderx-theme') || 'system';
  
  if (currentTheme === 'system') {
    const resolvedTheme = eventData.newSystemTheme;
    document.documentElement.setAttribute('data-theme', resolvedTheme);
    document.documentElement.className = resolvedTheme;
    
    context.eventBus.emit('theme.synced', {
      resolvedTheme,
      timestamp: Date.now(),
      source: 'theme-management-symphony'
    });
  }
  
  return { synced: currentTheme === 'system' };
};
