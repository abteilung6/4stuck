/**
 * Comprehensive Cursor Positioning Utility
 *
 * This utility handles all factors that affect cursor positioning across different:
 * - Screen sizes and resolutions
 * - Viewport configurations
 * - Device pixel ratios
 * - Browser zoom levels
 * - Player window sizes
 * - CSS transforms and positioning
 */

export interface CursorPosition {
  x: number;
  y: number;
}

export interface ViewportInfo {
  screenWidth: number;
  screenHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  devicePixelRatio: number;
  scrollX: number;
  scrollY: number;
  zoomLevel: number;
}

export interface CursorConfig {
  cursorSize: number; // Size of the cursor element (e.g., 20px)
  offsetX: number; // Horizontal offset adjustment
  offsetY: number; // Vertical offset adjustment
  useVisualViewport: boolean; // Whether to use visualViewport API
}

export interface PlayerViewport {
  playerId: number;
  viewport: ViewportInfo;
  cursorConfig: CursorConfig;
}

/**
 * Get comprehensive viewport information
 */
export function getViewportInfo(): ViewportInfo {
  // Get screen dimensions
  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;

  // Get device pixel ratio
  const devicePixelRatio = window.devicePixelRatio || 1;

  // Use visualViewport API if available (better for mobile/zoom handling)
  const visualViewport = window.visualViewport;

  // Check if overflow is hidden (which would constrain the viewport)
  const bodyStyle = window.getComputedStyle(document.body);
  const rootStyle = document.getElementById('root') ? window.getComputedStyle(document.getElementById('root')!) : null;

  const hasOverflowHidden = bodyStyle.overflowX === 'hidden' ||
                           (rootStyle && rootStyle.overflowX === 'hidden');

  // Get the actual visible viewport dimensions
  let viewportWidth: number;
  let viewportHeight: number;

  if (visualViewport) {
    // Use visualViewport for more accurate dimensions
    viewportWidth = visualViewport.width;
    viewportHeight = visualViewport.height;
  } else {
    // Fallback to window dimensions
    viewportWidth = window.innerWidth;
    viewportHeight = window.innerHeight;
  }

  // Ensure we're not using screen dimensions when we should use viewport
  // Only use screen dimensions if the viewport is artificially constrained
  if (hasOverflowHidden && viewportWidth >= screenWidth * 0.95) {
    // If viewport is almost as wide as screen, it might be artificially expanded
    // Use the actual visible area instead
    viewportWidth = Math.min(viewportWidth, window.innerWidth);
    viewportHeight = Math.min(viewportHeight, window.innerHeight);
  }

  // Calculate zoom level
  const zoomLevel = visualViewport ? visualViewport.scale : 1;

  // Get scroll position
  const scrollX = window.pageXOffset || window.scrollX || 0;
  const scrollY = window.pageYOffset || window.scrollY || 0;

  return {
    screenWidth,
    screenHeight,
    viewportWidth,
    viewportHeight,
    devicePixelRatio,
    scrollX,
    scrollY,
    zoomLevel
  };
}

/**
 * Calculate the optimal cursor positioning for a given mouse position
 */
export function calculateCursorPosition(
  mouseX: number,
  mouseY: number,
  config: CursorConfig = getDefaultCursorConfig()
): CursorPosition {
  const viewport = getViewportInfo();

  // Apply cursor size offset (center the cursor on the mouse position)
  const halfCursorSize = config.cursorSize / 2;

  // Calculate base position
  let x = mouseX - halfCursorSize;
  let y = mouseY - halfCursorSize;

  // Apply custom offsets
  x += config.offsetX;
  y += config.offsetY;

  // Ensure cursor stays within viewport bounds
  x = Math.max(0, Math.min(x, viewport.viewportWidth - config.cursorSize));
  y = Math.max(0, Math.min(y, viewport.viewportHeight - config.cursorSize));

  return { x, y };
}

/**
 * Get default cursor configuration
 */
export function getDefaultCursorConfig(): CursorConfig {
  return {
    cursorSize: 20,
    offsetX: 0,
    offsetY: 0,
    useVisualViewport: true
  };
}

/**
 * Calculate cursor position for remote players (accounting for different viewports)
 */
export function calculateRemoteCursorPosition(
  remoteMouseX: number,
  remoteMouseY: number,
  remoteViewport: ViewportInfo,
  localViewport: ViewportInfo,
  config: CursorConfig = getDefaultCursorConfig()
): CursorPosition {
  // Normalize remote position to percentage (0-1)
  const remotePercentX = remoteMouseX / remoteViewport.viewportWidth;
  const remotePercentY = remoteMouseY / remoteViewport.viewportHeight;

  // Apply percentage to local viewport
  const localX = remotePercentX * localViewport.viewportWidth;
  const localY = remotePercentY * localViewport.viewportHeight;

  // Calculate final cursor position
  return calculateCursorPosition(localX, localY, config);
}

/**
 * Detect and handle viewport changes
 */
export function createViewportChangeHandler(
  callback: (viewport: ViewportInfo) => void
): () => void {
  let lastViewport = getViewportInfo();

  const handleViewportChange = () => {
    const currentViewport = getViewportInfo();

    // Check if viewport has actually changed
    if (
      currentViewport.viewportWidth !== lastViewport.viewportWidth ||
      currentViewport.viewportHeight !== lastViewport.viewportHeight ||
      currentViewport.zoomLevel !== lastViewport.zoomLevel ||
      currentViewport.scrollX !== lastViewport.scrollX ||
      currentViewport.scrollY !== lastViewport.scrollY
    ) {
      lastViewport = currentViewport;
      callback(currentViewport);
    }
  };

  // Listen for various viewport change events
  window.addEventListener('resize', handleViewportChange);
  window.addEventListener('scroll', handleViewportChange);
  window.addEventListener('orientationchange', handleViewportChange);

  // Listen for visualViewport changes if available
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', handleViewportChange);
    window.visualViewport.addEventListener('scroll', handleViewportChange);
  }

  // Return cleanup function
  return () => {
    window.removeEventListener('resize', handleViewportChange);
    window.removeEventListener('scroll', handleViewportChange);
    window.removeEventListener('orientationchange', handleViewportChange);

    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', handleViewportChange);
      window.visualViewport.removeEventListener('scroll', handleViewportChange);
    }
  };
}

/**
 * Debug utility to log comprehensive positioning information
 */
export function debugCursorPositioning(
  mouseX: number,
  mouseY: number,
  config?: CursorConfig
): void {
  const viewport = getViewportInfo();
  const cursorPos = calculateCursorPosition(mouseX, mouseY, config);
  const gameContainerPos = calculateCursorPositionWithGameContainer(mouseX, mouseY, config);
  const normalizedPos = calculateCursorPositionNormalized(mouseX, mouseY, config);
  const normalized = normalizeMouseCoordinates(mouseX, mouseY);
  const styles = getCursorStyles(cursorPos, config || getDefaultCursorConfig());

  // Check for overflow issues
  const bodyStyle = window.getComputedStyle(document.body);
  const rootStyle = document.getElementById('root') ? window.getComputedStyle(document.getElementById('root')!) : null;
  const hasOverflowHidden = bodyStyle.overflowX === 'hidden' ||
                           (rootStyle && rootStyle.overflowX === 'hidden');

  // Get raw viewport dimensions for comparison
  const visualViewport = window.visualViewport;
  const rawViewportWidth = visualViewport ? visualViewport.width : window.innerWidth;
  const rawViewportHeight = visualViewport ? visualViewport.height : window.innerHeight;

  // Get game container dimensions
  const gameContainer = getGameContainerDimensions();
  const gameGrid = getGameGridDimensions();
  const padding = getContainerPadding();
  const gameGridInfo = getGameGridInfo();

  console.log('🎯 Cursor Positioning Debug:', {
    // Input coordinates
    mouseX,
    mouseY,

    // Calculated cursor positions
    viewportPosition: cursorPos,
    gameContainerPosition: gameContainerPos,
    normalizedPosition: normalizedPos,

    // Normalized coordinates (0-1)
    normalizedCoordinates: normalized,

    // Applied CSS styles
    appliedStyles: styles,

    // Viewport information
    viewport,

    // Configuration
    config: config || getDefaultCursorConfig(),

    // Additional context
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,

    // Debug info
    offsetApplied: {
      x: mouseX - cursorPos.x,
      y: mouseY - cursorPos.y
    },

    // Overflow detection
    overflowDetection: {
      bodyOverflowX: bodyStyle.overflowX,
      rootOverflowX: rootStyle?.overflowX || 'N/A',
      hasOverflowHidden,
      rawViewportWidth,
      rawViewportHeight,
      screenWidth: viewport.screenWidth,
      screenHeight: viewport.screenHeight,
      finalViewportWidth: viewport.viewportWidth,
      finalViewportHeight: viewport.viewportHeight
    },

    // Game container information
    gameContainerInfo: {
      containerWidth: gameContainer.width,
      containerHeight: gameContainer.height,
      gridWidth: gameGrid.width,
      gridHeight: gameGrid.height,
      paddingLeft: padding.left,
      paddingTop: padding.top,
      containerBounds: {
        minX: padding.left,
        maxX: padding.left + gameContainer.width,
        minY: padding.top,
        maxY: padding.top + gameContainer.height
      }
    },

    // Normalized coordinate system info (using game grid)
    normalizedSystem: {
      gameGridWidth: gameGridInfo.width,
      gameGridHeight: gameGridInfo.height,
      gameGridPaddingLeft: gameGridInfo.paddingLeft,
      gameGridPaddingTop: gameGridInfo.paddingTop,
      normalizedX: normalized.x,
      normalizedY: normalized.y
    }
  });
}

/**
 * Validate cursor position is within reasonable bounds
 */
export function validateCursorPosition(
  position: CursorPosition,
  viewport: ViewportInfo,
  config: CursorConfig
): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];

  // Check if position is within viewport bounds
  if (position.x < 0) issues.push('Cursor X position is negative');
  if (position.y < 0) issues.push('Cursor Y position is negative');
  if (position.x > viewport.viewportWidth - config.cursorSize) {
    issues.push('Cursor X position exceeds viewport width');
  }
  if (position.y > viewport.viewportHeight - config.cursorSize) {
    issues.push('Cursor Y position exceeds viewport height');
  }

  // Check for NaN or infinite values
  if (!isFinite(position.x)) issues.push('Cursor X position is not a finite number');
  if (!isFinite(position.y)) issues.push('Cursor Y position is not a finite number');

  return {
    isValid: issues.length === 0,
    issues
  };
}

/**
 * Get CSS styles for cursor positioning
 */
export function getCursorStyles(
  position: CursorPosition,
  config: CursorConfig
): React.CSSProperties {
  return {
    position: 'absolute',
    left: `${position.x}px`,
    top: `${position.y}px`,
    width: `${config.cursorSize}px`,
    height: `${config.cursorSize}px`,
    pointerEvents: 'none',
    zIndex: 1000,
    transform: 'none', // Avoid additional transforms
    transition: 'none' // Disable transitions for precise positioning
  };
}

/**
 * Calculate optimal cursor size based on viewport
 */
export function calculateOptimalCursorSize(viewport: ViewportInfo): number {
  const baseSize = 20;
  const minSize = 16;
  const maxSize = 32;

  // Scale based on device pixel ratio
  let size = baseSize / viewport.devicePixelRatio;

  // Scale based on viewport size (larger viewports get slightly larger cursors)
  const viewportArea = viewport.viewportWidth * viewport.viewportHeight;
  const scaleFactor = Math.min(1.5, Math.max(0.8, viewportArea / (1920 * 1080)));
  size *= scaleFactor;

  // Ensure size is within bounds
  return Math.max(minSize, Math.min(maxSize, Math.round(size)));
}

/**
 * Create a responsive cursor configuration
 */
export function createResponsiveCursorConfig(): CursorConfig {
  const viewport = getViewportInfo();
  const optimalSize = calculateOptimalCursorSize(viewport);

  return {
    cursorSize: optimalSize,
    offsetX: 0,
    offsetY: 0,
    useVisualViewport: true
  };
}

/**
 * Get container padding information for accurate positioning
 */
export function getContainerPadding(): { left: number; top: number } {
  const gameContainer = document.querySelector('.game-grid-container');
  if (!gameContainer) {
    return { left: 0, top: 0 };
  }

  const computedStyle = window.getComputedStyle(gameContainer);
  return {
    left: parseFloat(computedStyle.paddingLeft) || 0,
    top: parseFloat(computedStyle.paddingTop) || 0
  };
}

/**
 * Calculate cursor position with container padding adjustment
 */
export function calculateCursorPositionWithPadding(
  mouseX: number,
  mouseY: number,
  config: CursorConfig
): CursorPosition {
  const padding = getContainerPadding();

  // Adjust mouse position for container padding
  const adjustedX = mouseX - padding.left;
  const adjustedY = mouseY - padding.top;

  // Calculate position with adjusted coordinates
  const position = calculateCursorPosition(adjustedX, adjustedY, config);

  // Add padding back to final position
  return {
    x: position.x + padding.left,
    y: position.y + padding.top
  };
}

/**
 * Get the actual available space for cursor positioning
 */
export function getActualAvailableSpace(): { width: number; height: number } {
  // Check if there's a body overflow issue
  const bodyStyle = window.getComputedStyle(document.body);
  const htmlStyle = window.getComputedStyle(document.documentElement);

  // Get the actual available space
  const availableWidth = Math.min(
    window.innerWidth,
    document.documentElement.clientWidth,
    window.screen.width
  );

  const availableHeight = Math.min(
    window.innerHeight,
    document.documentElement.clientHeight,
    window.screen.height
  );

  return { width: availableWidth, height: availableHeight };
}

/**
 * Detect CSS overflow issues that might affect cursor positioning
 */
export function detectOverflowIssues(): Array<{ element: string; issue: string }> {
  const issues: Array<{ element: string; issue: string }> = [];

  // Check body overflow
  const bodyStyle = window.getComputedStyle(document.body);
  if (bodyStyle.overflow !== 'visible') {
    issues.push({ element: 'body', issue: `overflow: ${bodyStyle.overflow}` });
  }

  // Check html overflow
  const htmlStyle = window.getComputedStyle(document.documentElement);
  if (htmlStyle.overflow !== 'visible') {
    issues.push({ element: 'html', issue: `overflow: ${htmlStyle.overflow}` });
  }

  // Check for any fixed positioning issues
  const root = document.getElementById('root');
  if (root) {
    const rootStyle = window.getComputedStyle(root);
    if (rootStyle.position === 'fixed' || rootStyle.position === 'absolute') {
      issues.push({ element: '#root', issue: `position: ${rootStyle.position}` });
    }
  }

  return issues;
}

/**
 * Get the actual game container dimensions
 */
export function getGameContainerDimensions(): { width: number; height: number } {
  const gameContainer = document.querySelector('.game-grid-container');
  if (!gameContainer) {
    return { width: 0, height: 0 };
  }

  const rect = gameContainer.getBoundingClientRect();
  return {
    width: rect.width,
    height: rect.height
  };
}

/**
 * Get the actual game grid dimensions
 */
export function getGameGridDimensions(): { width: number; height: number } {
  const gameGrid = document.querySelector('.game-grid');
  if (!gameGrid) {
    return { width: 0, height: 0 };
  }

  const rect = gameGrid.getBoundingClientRect();
  return {
    width: rect.width,
    height: rect.height
  };
}

/**
 * Calculate cursor position with game container bounds instead of viewport bounds
 */
export function calculateCursorPositionWithGameContainer(
  mouseX: number,
  mouseY: number,
  config: CursorConfig = getDefaultCursorConfig()
): CursorPosition {
  const gameContainer = getGameContainerDimensions();
  const padding = getContainerPadding();

  // Apply cursor size offset (center the cursor on the mouse position)
  const halfCursorSize = config.cursorSize / 2;

  // Calculate base position
  let x = mouseX - halfCursorSize;
  let y = mouseY - halfCursorSize;

  // Apply custom offsets
  x += config.offsetX;
  y += config.offsetY;

  // Ensure cursor stays within game container bounds (not viewport bounds)
  const maxX = padding.left + gameContainer.width - config.cursorSize;
  const maxY = padding.top + gameContainer.height - config.cursorSize;

  x = Math.max(padding.left, Math.min(x, maxX));
  y = Math.max(padding.top, Math.min(y, maxY));

  return { x, y };
}

/**
 * Normalized coordinate system for cross-browser mouse sharing
 *
 * The key insight: We need to normalize coordinates relative to the game area,
 * not the viewport or screen. This ensures consistent positioning across
 * different browser windows and screen sizes.
 */

export interface NormalizedCoordinates {
  x: number; // 0-1 relative to game area width
  y: number; // 0-1 relative to game area height
}

export interface GameAreaInfo {
  width: number;
  height: number;
  paddingLeft: number;
  paddingTop: number;
}

/**
 * Get game grid information for coordinate normalization
 * Using the game grid (cyan border) as the reference container
 */
export function getGameGridInfo(): GameAreaInfo {
  const gameGrid = getGameGridDimensions();
  const padding = getContainerPadding();

  return {
    width: gameGrid.width,
    height: gameGrid.height,
    paddingLeft: padding.left,
    paddingTop: padding.top
  };
}

/**
 * Convert mouse coordinates to normalized coordinates (0-1) relative to game grid
 */
export function normalizeMouseCoordinates(
  mouseX: number,
  mouseY: number
): NormalizedCoordinates {
  const gameGrid = getGameGridInfo();

  // Calculate position relative to game grid
  const relativeX = mouseX - gameGrid.paddingLeft;
  const relativeY = mouseY - gameGrid.paddingTop;

  // Normalize to 0-1 range
  const normalizedX = Math.max(0, Math.min(1, relativeX / gameGrid.width));
  const normalizedY = Math.max(0, Math.min(1, relativeY / gameGrid.height));

  return { x: normalizedX, y: normalizedY };
}

/**
 * Convert normalized coordinates back to absolute coordinates for current viewport
 */
export function denormalizeCoordinates(
  normalized: NormalizedCoordinates
): CursorPosition {
  const gameGrid = getGameGridInfo();
  const config = getDefaultCursorConfig();

  // Convert normalized coordinates to absolute coordinates
  const absoluteX = gameGrid.paddingLeft + (normalized.x * gameGrid.width);
  const absoluteY = gameGrid.paddingTop + (normalized.y * gameGrid.height);

  // Apply cursor centering
  const halfCursorSize = config.cursorSize / 2;
  const x = absoluteX - halfCursorSize;
  const y = absoluteY - halfCursorSize;

  return { x, y };
}

/**
 * Get game area information for coordinate normalization
 */
export function getGameAreaInfo(): GameAreaInfo {
  const gameContainer = getGameContainerDimensions();
  const padding = getContainerPadding();

  return {
    width: gameContainer.width,
    height: gameContainer.height,
    paddingLeft: padding.left,
    paddingTop: padding.top
  };
}

/**
 * Calculate cursor position using normalized coordinates
 */
export function calculateCursorPositionNormalized(
  mouseX: number,
  mouseY: number,
  config: CursorConfig = getDefaultCursorConfig()
): CursorPosition {
  // First normalize the coordinates
  const normalized = normalizeMouseCoordinates(mouseX, mouseY);

  // Then denormalize to get the final position
  return denormalizeCoordinates(normalized);
}
