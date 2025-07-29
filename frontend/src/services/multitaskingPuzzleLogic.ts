// Multitasking puzzle logic extraction

export interface GridCell {
  value: number;
  row: number;
  col: number;
  isFound: boolean;
}

export interface SixPosition {
  row: number;
  col: number;
}

/**
 * Generate a grid with one 6 at a random position, rest are 9s.
 */
export function generateMultitaskingGrid(rows: number, cols: number) {
  const sixRow = Math.floor(Math.random() * rows);
  const sixCol = Math.floor(Math.random() * cols);
  const sixPosition: SixPosition = { row: sixRow, col: sixCol };
  const grid: GridCell[][] = [];
  for (let row = 0; row < rows; row++) {
    const rowData: GridCell[] = [];
    for (let col = 0; col < cols; col++) {
      const value = (row === sixRow && col === sixCol) ? 6 : 9;
      rowData.push({ value, row, col, isFound: false });
    }
    grid.push(rowData);
  }
  return { grid, sixPosition };
}

/**
 * Returns true if the clicked cell is the six.
 */
export function isSixCellClicked(row: number, col: number, sixPosition: SixPosition | null): boolean {
  if (!sixPosition) return false;
  return row === sixPosition.row && col === sixPosition.col;
}
