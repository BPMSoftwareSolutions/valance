import { test, expect } from '@playwright/test';

/**
 * RenderX E2E Tests
 * 
 * Tests the main RenderX application following TDA (Test-Driven Architecture) principles.
 * Validates CIA (Conductor Integration Architecture) and SPA (Symphonic Plugin Architecture) compliance.
 * 
 * Requirements:
 * - Load main RenderX app at http://localhost:3000
 * - Assert presence of #component-library, #canvas, #control-panel
 * - Simulate dragging data-component="button" onto canvas
 * - Confirm .component-button appears in canvas
 */

test.describe('RenderX Application E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to RenderX application
    await page.goto('http://localhost:3000');
    
    // Wait for the application to load
    await page.waitForLoadState('networkidle');
  });

  test('should load RenderX application with required DOM elements', async ({ page }) => {
    // Verify the main application loads
    await expect(page).toHaveTitle(/RenderX/);
    
    // Assert presence of required DOM elements for SPA architecture
    await expect(page.locator('#component-library')).toBeVisible();
    await expect(page.locator('#canvas')).toBeVisible();
    await expect(page.locator('#control-panel')).toBeVisible();
    
    // Verify the elements are properly positioned
    const componentLibrary = page.locator('#component-library');
    const canvas = page.locator('#canvas');
    const controlPanel = page.locator('#control-panel');
    
    await expect(componentLibrary).toBeVisible();
    await expect(canvas).toBeVisible();
    await expect(controlPanel).toBeVisible();
  });

  test('should support drag and drop from component library to canvas', async ({ page }) => {
    // Wait for component library to be ready
    await expect(page.locator('#component-library')).toBeVisible();
    await expect(page.locator('#canvas')).toBeVisible();
    
    // Find button component in the library
    const buttonComponent = page.locator('[data-component="button"]').first();
    await expect(buttonComponent).toBeVisible();
    
    // Get canvas element
    const canvas = page.locator('#canvas');
    
    // Perform drag and drop operation
    await buttonComponent.dragTo(canvas);
    
    // Verify that a button component appears in the canvas
    await expect(canvas.locator('.component-button')).toBeVisible();
    
    // Verify the component has proper attributes
    const droppedButton = canvas.locator('.component-button').first();
    await expect(droppedButton).toBeVisible();
    
    // Additional validation: check if the component is properly rendered
    await expect(droppedButton).toContainText(/button/i);
  });

  test('should maintain SPA plugin architecture integrity', async ({ page }) => {
    // Verify that each main section is properly mounted as SPA plugin
    const componentLibrary = page.locator('#component-library');
    const canvas = page.locator('#canvas');
    const controlPanel = page.locator('#control-panel');
    
    // Check that plugins are properly mounted
    await expect(componentLibrary).toHaveAttribute('data-plugin-mounted', 'true');
    await expect(canvas).toHaveAttribute('data-plugin-mounted', 'true');
    await expect(controlPanel).toHaveAttribute('data-plugin-mounted', 'true');
  });

  test('should handle multiple component drag operations', async ({ page }) => {
    // Wait for application to be ready
    await expect(page.locator('#component-library')).toBeVisible();
    await expect(page.locator('#canvas')).toBeVisible();
    
    const canvas = page.locator('#canvas');
    
    // Drag multiple button components
    for (let i = 0; i < 3; i++) {
      const buttonComponent = page.locator('[data-component="button"]').first();
      await buttonComponent.dragTo(canvas);
      
      // Wait a bit between drags
      await page.waitForTimeout(100);
    }
    
    // Verify multiple components are in canvas
    const buttonComponents = canvas.locator('.component-button');
    await expect(buttonComponents).toHaveCount(3);
  });

  test('should validate CIA conductor integration', async ({ page }) => {
    // Check that the musical conductor is properly initialized
    const conductorStatus = await page.evaluate(() => {
      return (window as any).renderxCommunicationSystem?.conductor?.getStatistics();
    });
    
    expect(conductorStatus).toBeDefined();
    expect(conductorStatus.totalSequencesExecuted).toBeGreaterThanOrEqual(0);
  });

  test('should handle component library interactions', async ({ page }) => {
    const componentLibrary = page.locator('#component-library');
    await expect(componentLibrary).toBeVisible();
    
    // Check that components are properly categorized
    const categories = componentLibrary.locator('.element-category');
    await expect(categories).toHaveCountGreaterThan(0);
    
    // Verify button component exists and is draggable
    const buttonComponent = page.locator('[data-component="button"]').first();
    await expect(buttonComponent).toBeVisible();
    await expect(buttonComponent).toHaveAttribute('draggable', 'true');
  });

  test('should validate control panel functionality', async ({ page }) => {
    const controlPanel = page.locator('#control-panel');
    await expect(controlPanel).toBeVisible();
    
    // Check that control panel has proper structure
    // This test can be expanded based on actual control panel features
    await expect(controlPanel).toContainText(/control/i);
  });

  test('should maintain responsive layout', async ({ page }) => {
    // Test different viewport sizes
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    await expect(page.locator('#component-library')).toBeVisible();
    await expect(page.locator('#canvas')).toBeVisible();
    await expect(page.locator('#control-panel')).toBeVisible();
    
    // Test smaller viewport
    await page.setViewportSize({ width: 1024, height: 768 });
    
    await expect(page.locator('#component-library')).toBeVisible();
    await expect(page.locator('#canvas')).toBeVisible();
    await expect(page.locator('#control-panel')).toBeVisible();
  });

  test('should handle error scenarios gracefully', async ({ page }) => {
    // Test drag and drop to invalid areas
    const buttonComponent = page.locator('[data-component="button"]').first();
    const header = page.locator('header').first();
    
    if (await header.isVisible()) {
      // Try dragging to header (should not work)
      await buttonComponent.dragTo(header);
      
      // Verify no component was added to header
      await expect(header.locator('.component-button')).toHaveCount(0);
    }
    
    // Verify canvas is still functional
    const canvas = page.locator('#canvas');
    await buttonComponent.dragTo(canvas);
    await expect(canvas.locator('.component-button')).toBeVisible();
  });
});
