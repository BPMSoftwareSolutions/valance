// @agent-context: test for drag context validation logic
import { validateDragContext } from '../logic/validateDragContext';

describe('validateDragContext Logic', () => {
  const mockElements = [
    { id: 'element-1', type: 'rectangle', x: 100, y: 100, width: 50, height: 50 },
    { id: 'element-2', type: 'circle', x: 200, y: 200, width: 30, height: 30 }
  ];

  it('should validate correct drag context', () => {
    const result = validateDragContext(
      'element-1',
      { x: 110, y: 110 },
      'canvas-drag',
      mockElements
    );
    expect(result).toBe(true);
  });

  it('should handle library drag operations', () => {
    const result = validateDragContext(
      'new-element',
      { x: 50, y: 50 },
      'element-library-drag',
      mockElements
    );
    expect(result).toBe(true);
  });

  it('should handle synthetic drag operations', () => {
    const result = validateDragContext(
      'canvas-drag-over',
      { x: 50, y: 50 },
      'drag-over',
      mockElements
    );
    expect(result).toBe(true);
  });

  it('should fail with missing elementId', () => {
    const result = validateDragContext(
      '',
      { x: 110, y: 110 },
      'canvas-drag',
      mockElements
    );
    expect(result).toBe(false);
  });

  it('should fail with invalid elements array', () => {
    const result = validateDragContext(
      'element-1',
      { x: 110, y: 110 },
      'canvas-drag',
      null as any
    );
    expect(result).toBe(false);
  });

  it('should fail with missing changes', () => {
    const result = validateDragContext(
      'element-1',
      null,
      'canvas-drag',
      mockElements
    );
    expect(result).toBe(false);
  });

  it('should fail with missing source', () => {
    const result = validateDragContext(
      'element-1',
      { x: 110, y: 110 },
      '',
      mockElements
    );
    expect(result).toBe(false);
  });

  it('should fail when canvas element not found', () => {
    const result = validateDragContext(
      'non-existent-element',
      { x: 110, y: 110 },
      'canvas-drag',
      mockElements
    );
    expect(result).toBe(false);
  });
});
