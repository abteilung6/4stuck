// Utility for cursor color assignment
import { getPlayerColor } from './useColorAssignment';

/**
 * Get the color for a cursor given a userId, playerCursors, and teamMembers.
 * - Prefer color from teamMembers (by id)
 * - Fallback to color from playerCursors map
 * - Fallback to 'gray' if neither is set
 */
export function getCursorColor(userId: number, playerCursors: Map<number, { color?: string }>, teamMembers: { id: number; color?: string }[]): string {
  // Prefer color from teamMembers
  const member = teamMembers.find(m => m.id === userId);
  if (member && member.color) return member.color;
  // Fallback to color from playerCursors
  const cursor = playerCursors.get(userId);
  if (cursor && cursor.color) return cursor.color;
  // Fallback to gray
  return 'gray';
} 