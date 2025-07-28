import { getCursorColor } from '../useCursorAssignment';

describe('getCursorColor', () => {
  const teamMembers = [
    { id: 1, color: 'red' },
    { id: 2, color: 'blue' },
    { id: 3, color: undefined },
  ];
  const playerCursors = new Map([
    [1, { color: 'red' }],
    [2, { color: 'blue' }],
    [3, { color: 'green' }],
    [4, { color: 'yellow' }],
  ]);

  it('returns color from teamMembers if available', () => {
    expect(getCursorColor(1, playerCursors, teamMembers)).toBe('red');
    expect(getCursorColor(2, playerCursors, teamMembers)).toBe('blue');
  });

  it('returns color from playerCursors if not in teamMembers', () => {
    expect(getCursorColor(4, playerCursors, teamMembers)).toBe('yellow');
  });

  it('returns color from playerCursors if teamMember has no color', () => {
    expect(getCursorColor(3, playerCursors, teamMembers)).toBe('green');
  });

  it('returns gray if neither teamMembers nor playerCursors has color', () => {
    expect(getCursorColor(5, playerCursors, teamMembers)).toBe('gray');
  });
}); 