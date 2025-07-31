// @agent-context: test for DragStart handler validation
import { onDragStart } from '../handlers/onDragStart';

describe('onDragStart Handler', () => {
  const mockElements = [
    { id: 'element-1', type: 'rectangle', x: 100, y: 100, width: 50, height: 50 },
    { id: 'element-2', type: 'circle', x: 200, y: 200, width: 30, height: 30 }
  ];

  it('should handle valid drag start data', () => {
    const data = {
      elementId: 'element-1',
      changes: { x: 110, y: 110 },
      source: 'canvas-drag',
      elements: mockElements
    };

    const result = onDragStart(data);
    expect(result).toBe(true);
  });

  it('should skip non-component drag events', () => {
    const data = {
      elementId: '',
      changes: null,
      source: '',
      elements: mockElements
    };

    const result = onDragStart(data);
    expect(result).toBe(true);
  });

  it('should handle missing elementId', () => {
    const data = {
      elementId: '',
      changes: { x: 110, y: 110 },
      source: 'canvas-drag',
      elements: mockElements
    };

    const result = onDragStart(data);
    expect(result).toBe(true);
  });

  it('should handle missing changes', () => {
    const data = {
      elementId: 'element-1',
      changes: null,
      source: 'canvas-drag',
      elements: mockElements
    };

    const result = onDragStart(data);
    expect(result).toBe(true);
  });

  it('should handle missing source', () => {
    const data = {
      elementId: 'element-1',
      changes: { x: 110, y: 110 },
      source: '',
      elements: mockElements
    };

    const result = onDragStart(data);
    expect(result).toBe(true);
  });

  it('should handle errors gracefully', () => {
    const data = {
      elementId: 'element-1',
      changes: { x: 110, y: 110 },
      source: 'canvas-drag',
      elements: null as any
    };

    const result = onDragStart(data);
    expect(result).toBe(false);
  });
});
