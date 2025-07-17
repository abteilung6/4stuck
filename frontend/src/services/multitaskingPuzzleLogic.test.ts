import { describe, it, expect } from 'vitest';
import { generateMultitaskingGrid, isSixCellClicked } from './multitaskingPuzzleLogic';
import type { SixPosition } from './multitaskingPuzzleLogic';

describe('Multitasking Puzzle Logic', () => {
  it('should generate a grid with exactly one 6', () => {
    const rows = 3;
    const cols = 9;
    const { grid, sixPosition } = generateMultitaskingGrid(rows, cols);
    let sixCount = 0;
    grid.forEach(row => row.forEach(cell => { if (cell.value === 6) sixCount++; }));
    expect(sixCount).toBe(1);
    expect(grid[sixPosition.row][sixPosition.col].value).toBe(6);
  });

  it('should place the 6 at the correct position', () => {
    const rows = 4;
    const cols = 7;
    const { grid, sixPosition } = generateMultitaskingGrid(rows, cols);
    expect(grid[sixPosition.row][sixPosition.col].value).toBe(6);
    // All other cells are 9
    grid.forEach((row, r) => row.forEach((cell, c) => {
      if (!(r === sixPosition.row && c === sixPosition.col)) {
        expect(cell.value).toBe(9);
      }
    }));
  });

  it('isSixCellClicked returns true only for the six position', () => {
    const six: SixPosition = { row: 2, col: 5 };
    expect(isSixCellClicked(2, 5, six)).toBe(true);
    expect(isSixCellClicked(0, 0, six)).toBe(false);
    expect(isSixCellClicked(2, 4, six)).toBe(false);
    expect(isSixCellClicked(1, 5, six)).toBe(false);
    expect(isSixCellClicked(2, 5, null)).toBe(false);
  });
}); 