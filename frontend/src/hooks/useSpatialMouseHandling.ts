import { useCallback, useRef, useState } from 'react';
import { 
  type Position,
  type GameConfig,
  isMouseInCircle,
  calculateDragOffset,
  calculateCirclePosition
} from '../services/spatialPuzzleLogic';

interface UseSpatialMouseHandlingProps {
  gameConfig: GameConfig;
  circlePosition: Position;
  isGameActive: boolean;
  onCirclePositionChange: (position: Position) => void;
}

export function useSpatialMouseHandling({
  gameConfig,
  circlePosition,
  isGameActive,
  onCirclePositionChange
}: UseSpatialMouseHandlingProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const getMousePosition = useCallback((e: React.MouseEvent): Position | null => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return null;
    
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isGameActive) return;
    
    const mousePos = getMousePosition(e);
    if (!mousePos) return;
    
    if (isMouseInCircle(mousePos.x, mousePos.y, circlePosition, gameConfig.circleRadius)) {
      setIsDragging(true);
      setDragOffset(calculateDragOffset(mousePos.x, mousePos.y, circlePosition));
    }
  }, [isGameActive, getMousePosition, circlePosition, gameConfig.circleRadius]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !isGameActive) return;
    
    const mousePos = getMousePosition(e);
    if (!mousePos) return;
    
    const newPosition = calculateCirclePosition(
      mousePos.x,
      mousePos.y,
      dragOffset,
      gameConfig.gameWidth,
      gameConfig.gameHeight,
      gameConfig.circleRadius
    );
    
    onCirclePositionChange(newPosition);
  }, [isDragging, isGameActive, getMousePosition, dragOffset, gameConfig, onCirclePositionChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  return {
    containerRef,
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave
  };
} 