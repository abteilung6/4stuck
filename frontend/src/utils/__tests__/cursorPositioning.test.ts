import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  calculateCursorPosition,
  calculateRemoteCursorPosition,
  getViewportInfo,
  createResponsiveCursorConfig,
  debugCursorPositioning,
  getCursorStyles,
  validateCursorPosition,
  createViewportChangeHandler,
  getDefaultCursorConfig,
  calculateOptimalCursorSize,
  type CursorPosition,
  type ViewportInfo,
  type CursorConfig
} from '../cursorPositioning';

// Mock window object
const mockWindow = {
  screen: { width: 1920, height: 1080 },
  innerWidth: 1200,
  innerHeight: 800,
  devicePixelRatio: 1,
  pageXOffset: 0,
  pageYOffset: 0,
  visualViewport: {
    width: 1200,
    height: 800,
    scale: 1,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  }
};

describe('Cursor Positioning Utility', () => {
  beforeEach(() => {
    // Mock window object
    Object.defineProperty(window, 'screen', {
      value: mockWindow.screen,
      writable: true
    });
    Object.defineProperty(window, 'innerWidth', {
      value: mockWindow.innerWidth,
      writable: true
    });
    Object.defineProperty(window, 'innerHeight', {
      value: mockWindow.innerHeight,
      writable: true
    });
    Object.defineProperty(window, 'devicePixelRatio', {
      value: mockWindow.devicePixelRatio,
      writable: true
    });
    Object.defineProperty(window, 'pageXOffset', {
      value: mockWindow.pageXOffset,
      writable: true
    });
    Object.defineProperty(window, 'pageYOffset', {
      value: mockWindow.pageYOffset,
      writable: true
    });
    Object.defineProperty(window, 'visualViewport', {
      value: mockWindow.visualViewport,
      writable: true
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getViewportInfo', () => {
    it('should return correct viewport information', () => {
      const viewport = getViewportInfo();
      
      expect(viewport).toEqual({
        screenWidth: 1920,
        screenHeight: 1080,
        viewportWidth: 1200,
        viewportHeight: 800,
        devicePixelRatio: 1,
        scrollX: 0,
        scrollY: 0,
        zoomLevel: 1
      });
    });

    it('should handle missing visualViewport', () => {
      Object.defineProperty(window, 'visualViewport', {
        value: undefined,
        writable: true
      });

      const viewport = getViewportInfo();
      
      expect(viewport.viewportWidth).toBe(1200);
      expect(viewport.viewportHeight).toBe(800);
      expect(viewport.zoomLevel).toBe(1);
    });

    it('should handle high DPI displays', () => {
      Object.defineProperty(window, 'devicePixelRatio', {
        value: 2,
        writable: true
      });

      const viewport = getViewportInfo();
      expect(viewport.devicePixelRatio).toBe(2);
    });
  });

  describe('calculateCursorPosition', () => {
    it('should center cursor on mouse position', () => {
      const config = getDefaultCursorConfig();
      const position = calculateCursorPosition(100, 200, config);
      
      // Cursor should be centered on mouse position (100, 200)
      // With 20px cursor size, offset should be 10px
      expect(position.x).toBe(90); // 100 - 10
      expect(position.y).toBe(190); // 200 - 10
    });

    it('should handle custom cursor size', () => {
      const config: CursorConfig = {
        cursorSize: 32,
        offsetX: 0,
        offsetY: 0,
        useVisualViewport: true
      };
      
      const position = calculateCursorPosition(100, 200, config);
      
      // With 32px cursor size, offset should be 16px
      expect(position.x).toBe(84); // 100 - 16
      expect(position.y).toBe(184); // 200 - 16
    });

    it('should apply custom offsets', () => {
      const config: CursorConfig = {
        cursorSize: 20,
        offsetX: 5,
        offsetY: -3,
        useVisualViewport: true
      };
      
      const position = calculateCursorPosition(100, 200, config);
      
      expect(position.x).toBe(95); // 100 - 10 + 5
      expect(position.y).toBe(187); // 200 - 10 - 3
    });

    it('should clamp cursor to viewport bounds', () => {
      const config = getDefaultCursorConfig();
      
      // Test top-left boundary
      const topLeft = calculateCursorPosition(0, 0, config);
      expect(topLeft.x).toBe(0);
      expect(topLeft.y).toBe(0);
      
      // Test bottom-right boundary
      const bottomRight = calculateCursorPosition(1200, 800, config);
      expect(bottomRight.x).toBe(1180); // 1200 - 20
      expect(bottomRight.y).toBe(780); // 800 - 20
    });

    it('should handle negative mouse coordinates', () => {
      const config = getDefaultCursorConfig();
      const position = calculateCursorPosition(-50, -30, config);
      
      // Should clamp to 0
      expect(position.x).toBe(0);
      expect(position.y).toBe(0);
    });
  });

  describe('calculateRemoteCursorPosition', () => {
    it('should normalize remote cursor position correctly', () => {
      const remoteViewport: ViewportInfo = {
        screenWidth: 1920,
        screenHeight: 1080,
        viewportWidth: 800,
        viewportHeight: 600,
        devicePixelRatio: 1,
        scrollX: 0,
        scrollY: 0,
        zoomLevel: 1
      };

      const localViewport: ViewportInfo = {
        screenWidth: 1920,
        screenHeight: 1080,
        viewportWidth: 1200,
        viewportHeight: 800,
        devicePixelRatio: 1,
        scrollX: 0,
        scrollY: 0,
        zoomLevel: 1
      };

      const config = getDefaultCursorConfig();
      
      // Remote cursor at center of their viewport (400, 300)
      const remotePosition = calculateRemoteCursorPosition(400, 300, remoteViewport, localViewport, config);
      
      // Should map to center of local viewport (600, 400)
      expect(remotePosition.x).toBe(590); // 600 - 10 (cursor offset)
      expect(remotePosition.y).toBe(390); // 400 - 10 (cursor offset)
    });

    it('should handle different aspect ratios', () => {
      const remoteViewport: ViewportInfo = {
        screenWidth: 1920,
        screenHeight: 1080,
        viewportWidth: 1000,
        viewportHeight: 500, // Wide aspect ratio
        devicePixelRatio: 1,
        scrollX: 0,
        scrollY: 0,
        zoomLevel: 1
      };

      const localViewport: ViewportInfo = {
        screenWidth: 1920,
        screenHeight: 1080,
        viewportWidth: 800,
        viewportHeight: 800, // Square aspect ratio
        devicePixelRatio: 1,
        scrollX: 0,
        scrollY: 0,
        zoomLevel: 1
      };

      const config = getDefaultCursorConfig();
      
      // Remote cursor at top-right corner (1000, 0)
      // This should map to 100% of remote width = 100% of local width
      const remotePosition = calculateRemoteCursorPosition(1000, 0, remoteViewport, localViewport, config);
      
      // Calculate expected value:
      // remotePercentX = 1000 / 1000 = 1.0 (100%)
      // localX = 1.0 * 800 = 800
      // finalX = 800 - 10 (cursor offset) = 790
      expect(remotePosition.x).toBe(790); // 800 - 10
      expect(remotePosition.y).toBe(0);
    });
  });

  describe('validateCursorPosition', () => {
    it('should validate correct positions', () => {
      const viewport = getViewportInfo();
      const config = getDefaultCursorConfig();
      const position: CursorPosition = { x: 100, y: 200 };
      
      const result = validateCursorPosition(position, viewport, config);
      
      expect(result.isValid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should detect out-of-bounds positions', () => {
      const viewport = getViewportInfo();
      const config = getDefaultCursorConfig();
      
      // Test negative position
      const negativePos = { x: -10, y: 100 };
      const negativeResult = validateCursorPosition(negativePos, viewport, config);
      expect(negativeResult.isValid).toBe(false);
      expect(negativeResult.issues).toContain('Cursor X position is negative');
      
      // Test position exceeding viewport
      const overflowPos = { x: 1200, y: 100 };
      const overflowResult = validateCursorPosition(overflowPos, viewport, config);
      expect(overflowResult.isValid).toBe(false);
      expect(overflowResult.issues).toContain('Cursor X position exceeds viewport width');
    });

    it('should detect invalid numeric values', () => {
      const viewport = getViewportInfo();
      const config = getDefaultCursorConfig();
      
      const nanPos = { x: NaN, y: 100 };
      const nanResult = validateCursorPosition(nanPos, viewport, config);
      expect(nanResult.isValid).toBe(false);
      expect(nanResult.issues).toContain('Cursor X position is not a finite number');
      
      const infinitePos = { x: Infinity, y: 100 };
      const infiniteResult = validateCursorPosition(infinitePos, viewport, config);
      expect(infiniteResult.isValid).toBe(false);
      expect(infiniteResult.issues).toContain('Cursor X position is not a finite number');
    });
  });

  describe('getCursorStyles', () => {
    it('should return correct CSS styles', () => {
      const position: CursorPosition = { x: 100, y: 200 };
      const config: CursorConfig = {
        cursorSize: 24,
        offsetX: 0,
        offsetY: 0,
        useVisualViewport: true
      };
      
      const styles = getCursorStyles(position, config);
      
      expect(styles).toEqual({
        position: 'absolute',
        left: '100px',
        top: '200px',
        width: '24px',
        height: '24px',
        pointerEvents: 'none',
        zIndex: 1000,
        transform: 'none',
        transition: 'none'
      });
    });
  });

  describe('calculateOptimalCursorSize', () => {
    it('should calculate appropriate cursor size for different viewports', () => {
      const viewport: ViewportInfo = {
        screenWidth: 1920,
        screenHeight: 1080,
        viewportWidth: 1200,
        viewportHeight: 800,
        devicePixelRatio: 1,
        scrollX: 0,
        scrollY: 0,
        zoomLevel: 1
      };
      
      const size = calculateOptimalCursorSize(viewport);
      
      // Should be within bounds
      expect(size).toBeGreaterThanOrEqual(16);
      expect(size).toBeLessThanOrEqual(32);
    });

    it('should scale cursor size for high DPI displays', () => {
      const viewport: ViewportInfo = {
        screenWidth: 1920,
        screenHeight: 1080,
        viewportWidth: 1200,
        viewportHeight: 800,
        devicePixelRatio: 2,
        scrollX: 0,
        scrollY: 0,
        zoomLevel: 1
      };
      
      const size = calculateOptimalCursorSize(viewport);
      
      // Should be smaller for high DPI displays
      expect(size).toBeLessThan(20);
    });
  });

  describe('createResponsiveCursorConfig', () => {
    it('should create config with optimal cursor size', () => {
      const config = createResponsiveCursorConfig();
      
      expect(config.cursorSize).toBeGreaterThanOrEqual(16);
      expect(config.cursorSize).toBeLessThanOrEqual(32);
      expect(config.offsetX).toBe(0);
      expect(config.offsetY).toBe(0);
      expect(config.useVisualViewport).toBe(true);
    });
  });

  describe('debugCursorPositioning', () => {
    it('should log debug information', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      debugCursorPositioning(100, 200);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '🎯 Cursor Positioning Debug:',
        expect.objectContaining({
          mouseX: 100,
          mouseY: 200,
          viewport: expect.any(Object),
          config: expect.any(Object),
          timestamp: expect.any(String),
          userAgent: expect.any(String)
        })
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('createViewportChangeHandler', () => {
    it('should create and cleanup event listeners', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      
      const callback = vi.fn();
      const cleanup = createViewportChangeHandler(callback);
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('orientationchange', expect.any(Function));
      
      // Check that visualViewport listeners were added
      expect(mockWindow.visualViewport.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
      expect(mockWindow.visualViewport.addEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
      
      cleanup();
      
      // Check that visualViewport listeners were removed
      expect(mockWindow.visualViewport.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
      expect(mockWindow.visualViewport.removeEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
      
      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });
  });
}); 