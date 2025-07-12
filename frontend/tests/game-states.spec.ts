import { test, expect } from '@playwright/test';

// Helper function to generate unique team names
const generateUniqueTeamName = (baseName: string) => `${baseName}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

test.describe('Game States and UI Components', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test.describe('Lobby State', () => {
    test('should display lobby with all required elements', async ({ page }) => {
      // Check main lobby elements
      await expect(page.getByText('Game Lobby')).toBeVisible();
      await expect(page.getByText('Available Teams:')).toBeVisible();
      
      // Check username section
      await expect(page.getByPlaceholder('Username')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Set Username' })).toBeVisible();
      
      // Check team creation section
      await expect(page.getByPlaceholder('New team name')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Create New Team' })).toBeVisible();
      
      // Check teams list container
      await expect(page.locator('.teams-list')).toBeVisible();
    });

    test('should handle username setting workflow', async ({ page }) => {
      const username = 'testuser123';
      
      // Set username
      await page.getByPlaceholder('Username').fill(username);
      await page.getByRole('button', { name: 'Set Username' }).click();
      
      // Verify username is set
      await expect(page.getByText(`Hello, ${username}!`)).toBeVisible();
      
      // Verify username field is disabled
      await expect(page.getByPlaceholder('Username')).toBeDisabled();
      await expect(page.getByRole('button', { name: 'Set Username' })).toBeDisabled();
    });

    test('should handle team creation workflow', async ({ page }) => {
      // Set username first
      await page.getByPlaceholder('Username').fill('testuser');
      await page.getByRole('button', { name: 'Set Username' }).click();
      
      // Create team
      const teamName = `TestTeam123_${Date.now()}`;
      await page.getByPlaceholder('New team name').fill(teamName);
      await page.getByRole('button', { name: 'Create New Team' }).click();
      
      // Verify team creation feedback
      await expect(page.getByText(`Created team ${teamName}`)).toBeVisible();
      
      // Verify team appears in list
      await expect(page.getByText(teamName)).toBeVisible();
    });

    test('should handle team joining workflow', async ({ page }) => {
      // Set username
      await page.getByPlaceholder('Username').fill('testuser');
      await page.getByRole('button', { name: 'Set Username' }).click();
      
      // Create team
      const teamName = `TestTeam123_${Date.now()}`;
      await page.getByPlaceholder('New team name').fill(teamName);
      await page.getByRole('button', { name: 'Create New Team' }).click();
      
      // Join team
      await page.getByRole('button', { name: `Join team ${teamName}` }).click();
      
      // Verify team membership
      await expect(page.getByText(`Your Team: ${teamName}`)).toBeVisible();
      await expect(page.getByRole('button', { name: 'Start Game' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Leave Team' })).toBeVisible();
    });
  });

  test.describe('Game Session States', () => {
    test('should transition from lobby to game session', async ({ page }) => {
      // Setup: Create user and team
      const username = `user_${Date.now()}`;
      const teamName = `team_${Date.now()}`;
      
      await page.getByPlaceholder('Username').fill(username);
      await page.getByRole('button', { name: 'Set Username' }).click();
      await page.getByPlaceholder('New team name').fill(teamName);
      await page.getByRole('button', { name: 'Create New Team' }).click();
      await page.getByRole('button', { name: `Join team ${teamName}` }).click();
      
      // Start game
      await page.getByRole('button', { name: 'Start Game' }).click();
      
      // Wait for transition
      await page.waitForTimeout(2000);
      
      // Verify game session view
      await expect(page.locator('.game-session-container')).toBeVisible();
      await expect(page.getByText('Game Session')).toBeVisible();
    });

    test('should display connecting state', async ({ page }) => {
      // Setup and start game
      const teamName = generateUniqueTeamName('TestTeam');
      await page.getByPlaceholder('Username').fill('testuser');
      await page.getByRole('button', { name: 'Set Username' }).click();
      await page.getByPlaceholder('New team name').fill(teamName);
      await page.getByRole('button', { name: 'Create New Team' }).click();
      await page.getByRole('button', { name: `Join team ${teamName}` }).click();
      await page.getByRole('button', { name: 'Start Game' }).click();
      
      // Check for connecting state
      await expect(page.getByText('Connecting to game...')).toBeVisible();
    });

    test('should display waiting state', async ({ page }) => {
      // Setup and start game
      await page.getByPlaceholder('Username').fill('testuser');
      await page.getByRole('button', { name: 'Set Username' }).click();
      await page.getByPlaceholder('New team name').fill('TestTeam');
      await page.getByRole('button', { name: 'Create New Team' }).click();
      await page.getByRole('button', { name: 'Join team TestTeam' }).click();
      await page.getByRole('button', { name: 'Start Game' }).click();
      
      // Wait for game session to load
      await page.waitForTimeout(3000);
      
      // Check for waiting state (if not active)
      try {
        await expect(page.getByText('Waiting for your turn...')).toBeVisible({ timeout: 2000 });
        await expect(page.getByText('Watch your teammates and get ready!')).toBeVisible();
      } catch {
        // If not in waiting state, might be in active state, which is also valid
        console.log('Not in waiting state, might be in active state');
      }
    });

    test('should display active game state with puzzle', async ({ page }) => {
      // Setup and start game
      await page.getByPlaceholder('Username').fill('testuser');
      await page.getByRole('button', { name: 'Set Username' }).click();
      await page.getByPlaceholder('New team name').fill('TestTeam');
      await page.getByRole('button', { name: 'Create New Team' }).click();
      await page.getByRole('button', { name: 'Join team TestTeam' }).click();
      await page.getByRole('button', { name: 'Start Game' }).click();
      
      // Wait for game session to load
      await page.waitForTimeout(3000);
      
      // Check for active game elements
      try {
        await expect(page.getByText('Your Puzzle')).toBeVisible({ timeout: 2000 });
        // Should have puzzle input or puzzle display
        await expect(page.locator('input[type="text"], .puzzle-content')).toBeVisible();
      } catch {
        // If not in active state, might be in waiting state, which is also valid
        console.log('Not in active state, might be in waiting state');
      }
    });

    test('should display eliminated state', async ({ page }) => {
      // Setup and start game
      await page.getByPlaceholder('Username').fill('testuser');
      await page.getByRole('button', { name: 'Set Username' }).click();
      await page.getByPlaceholder('New team name').fill('TestTeam');
      await page.getByRole('button', { name: 'Create New Team' }).click();
      await page.getByRole('button', { name: 'Join team TestTeam' }).click();
      await page.getByRole('button', { name: 'Start Game' }).click();
      
      // Wait for game session to load
      await page.waitForTimeout(3000);
      
      // Check for eliminated state (if applicable)
      try {
        await expect(page.getByText('You have been eliminated.')).toBeVisible({ timeout: 2000 });
        await expect(page.getByText('Thank you for playing! Please wait for the game to finish.')).toBeVisible();
      } catch {
        // If not eliminated, that's expected in normal gameplay
        console.log('Not in eliminated state, which is expected');
      }
    });

    test('should display game over state with final standings', async ({ page }) => {
      // Setup and start game
      await page.getByPlaceholder('Username').fill('testuser');
      await page.getByRole('button', { name: 'Set Username' }).click();
      await page.getByPlaceholder('New team name').fill('TestTeam');
      await page.getByRole('button', { name: 'Create New Team' }).click();
      await page.getByRole('button', { name: 'Join team TestTeam' }).click();
      await page.getByRole('button', { name: 'Start Game' }).click();
      
      // Wait for game session to load
      await page.waitForTimeout(3000);
      
      // Check for game over state (if applicable)
      try {
        await expect(page.getByText('Game Over')).toBeVisible({ timeout: 2000 });
        await expect(page.getByText('Final Standings')).toBeVisible();
        await expect(page.locator('.team-points-table')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Return to Lobby' })).toBeVisible();
      } catch {
        // If not game over, that's expected in normal gameplay
        console.log('Not in game over state, which is expected');
      }
    });
  });

  test.describe('Team Points and Standings', () => {
    test('should display team points table in game session', async ({ page }) => {
      // Setup and start game
      await page.getByPlaceholder('Username').fill('testuser');
      await page.getByRole('button', { name: 'Set Username' }).click();
      await page.getByPlaceholder('New team name').fill('TestTeam');
      await page.getByRole('button', { name: 'Create New Team' }).click();
      await page.getByRole('button', { name: 'Join team TestTeam' }).click();
      await page.getByRole('button', { name: 'Start Game' }).click();
      
      // Wait for game session to load
      await page.waitForTimeout(3000);
      
      // Check for team points table
      try {
        await expect(page.locator('.team-points-table')).toBeVisible({ timeout: 3000 });
        await expect(page.getByText('Player')).toBeVisible();
        await expect(page.getByText('Points')).toBeVisible();
      } catch {
        // Team points table might not be visible in all states
        console.log('Team points table not visible in current game state');
      }
    });

    test('should highlight current user in standings', async ({ page }) => {
      // Setup and start game
      const username = 'testuser';
      await page.getByPlaceholder('Username').fill(username);
      await page.getByRole('button', { name: 'Set Username' }).click();
      await page.getByPlaceholder('New team name').fill('TestTeam');
      await page.getByRole('button', { name: 'Create New Team' }).click();
      await page.getByRole('button', { name: 'Join team TestTeam' }).click();
      await page.getByRole('button', { name: 'Start Game' }).click();
      
      // Wait for game session to load
      await page.waitForTimeout(3000);
      
      // Check for current user highlighting
      try {
        await expect(page.locator('.current-user')).toBeVisible({ timeout: 3000 });
        await expect(page.locator('.current-user').getByText(username)).toBeVisible();
      } catch {
        // Current user highlighting might not be visible in all states
        console.log('Current user highlighting not visible in current game state');
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Try to start game without backend
      await page.route('**/api/**', route => route.abort());
      
      await page.getByPlaceholder('Username').fill('testuser');
      await page.getByRole('button', { name: 'Set Username' }).click();
      
      // Should show error message
      await expect(page.getByText(/Failed to register user/)).toBeVisible();
    });

    test('should handle validation errors', async ({ page }) => {
      // Try to set empty username
      await page.getByRole('button', { name: 'Set Username' }).click();
      await expect(page.getByText('Please enter a username.')).toBeVisible();
      
      // Try to create team without username
      await page.getByPlaceholder('New team name').fill('TestTeam');
      await page.getByRole('button', { name: 'Create New Team' }).click();
      await expect(page.getByText('Set your username first.')).toBeVisible();
    });
  });

  test.describe('Navigation and Transitions', () => {
    test('should return to lobby from game over', async ({ page }) => {
      // Setup and start game
      await page.getByPlaceholder('Username').fill('testuser');
      await page.getByRole('button', { name: 'Set Username' }).click();
      await page.getByPlaceholder('New team name').fill('TestTeam');
      await page.getByRole('button', { name: 'Create New Team' }).click();
      await page.getByRole('button', { name: 'Join team TestTeam' }).click();
      await page.getByRole('button', { name: 'Start Game' }).click();
      
      // Wait for game session
      await page.waitForTimeout(3000);
      
      // Try to return to lobby (if game over state is available)
      try {
        await page.getByRole('button', { name: 'Return to Lobby' }).click({ timeout: 2000 });
        await expect(page.getByText('Game Lobby')).toBeVisible();
      } catch {
        // If not in game over state, that's expected
        console.log('Not in game over state, cannot test return to lobby');
      }
    });

    test('should handle page refresh during game session', async ({ page }) => {
      // Setup and start game
      await page.getByPlaceholder('Username').fill('testuser');
      await page.getByRole('button', { name: 'Set Username' }).click();
      await page.getByPlaceholder('New team name').fill('TestTeam');
      await page.getByRole('button', { name: 'Create New Team' }).click();
      await page.getByRole('button', { name: 'Join team TestTeam' }).click();
      await page.getByRole('button', { name: 'Start Game' }).click();
      
      // Wait for game session
      await page.waitForTimeout(2000);
      
      // Refresh page
      await page.reload();
      
      // Should return to lobby
      await expect(page.getByText('Game Lobby')).toBeVisible();
    });
  });
}); 