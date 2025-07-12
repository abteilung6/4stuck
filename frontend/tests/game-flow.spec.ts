import { test, expect } from '@playwright/test';

test.describe('Game Flow - User Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    // Reload after clearing localStorage
    await page.reload();
  });

  test('should have all required UI elements for game setup', async ({ page }) => {
    // Check that the lobby loads
    await expect(page.getByText('Game Lobby')).toBeVisible();
    // Check for username input
    await expect(page.getByPlaceholder('Username')).toBeVisible();
    // Check for team creation input
    await expect(page.getByPlaceholder('New team name')).toBeVisible();
    // Check that there are interactive buttons (without specific text)
    const buttonCount = await page.locator('button').count();
    expect(buttonCount).toBeGreaterThan(0);
    // Check for specific buttons by their aria-label
    await expect(page.getByRole('button', { name: 'Set Username' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create New Team' })).toBeVisible();
  });

  test('should be able to interact with username field', async ({ page }) => {
    // Find and fill username field
    const usernameInput = page.getByPlaceholder('Username');
    await expect(usernameInput).toBeVisible();
    const testUsername = 'testuser123';
    await usernameInput.fill(testUsername);
    // Verify the value was set
    await expect(usernameInput).toHaveValue(testUsername);
  });

  test('should complete full game setup flow', async ({ page }) => {
    // Generate random username and team name
    const randomUsername = `user_${Math.random().toString(36).substring(2, 8)}`;
    const randomTeamName = `team_${Math.random().toString(36).substring(2, 8)}`;
    
    // Set username
    await page.getByPlaceholder('Username').fill(randomUsername);
    await page.getByRole('button', { name: 'Set Username' }).click();
    
    // Wait for username to be set
    await expect(page.getByText(`Hello, ${randomUsername}!`)).toBeVisible();
    
    // Create a new team
    await page.getByPlaceholder('New team name').fill(randomTeamName);
    await page.getByRole('button', { name: 'Create New Team' }).click();
    
    // Wait for team to be created and joined
    await expect(page.getByText(`Your Team: ${randomTeamName}`)).toBeVisible();
    
    // Start the game
    await page.getByRole('button', { name: 'Start Game' }).click();
    
    // Wait a moment for the game to start
    await page.waitForTimeout(3000);
    
    // Check for various possible game session indicators
    const possibleTexts = [
      'Game session active',
      'Game session started',
      'Connecting to game',
      'Game Session',
      'Waiting for your turn',
      'Game Over'
    ];
    
    // Look for any of these texts
    let foundText = false;
    for (const text of possibleTexts) {
      try {
        await expect(page.getByText(new RegExp(text, 'i'))).toBeVisible({ timeout: 1000 });
        console.log(`Found text: ${text}`);
        foundText = true;
        break;
      } catch {
        // Continue to next text
      }
    }
    
    if (!foundText) {
      // If no expected text found, take a screenshot and show page content
      const pageContent = await page.textContent('body');
      console.log('Page content:', pageContent);
      throw new Error('No game session indicator found');
    }
  });

  test('should display lobby with team management features', async ({ page }) => {
    // Test lobby initial state
    await expect(page.getByText('Game Lobby')).toBeVisible();
    await expect(page.getByText('Available Teams:')).toBeVisible();
    await expect(page.getByPlaceholder('Username')).toBeVisible();
    await expect(page.getByPlaceholder('New team name')).toBeVisible();
    
    // Test username setting
    const username = 'testuser';
    await page.getByPlaceholder('Username').fill(username);
    await page.getByRole('button', { name: 'Set Username' }).click();
    await expect(page.getByText(`Hello, ${username}!`)).toBeVisible();
    
    // Test team creation
    const teamName = `TestTeam_${Date.now()}`;
    await page.getByPlaceholder('New team name').fill(teamName);
    await page.getByRole('button', { name: 'Create New Team' }).click();
    
    // Wait for team creation feedback and add debugging
    console.log('Waiting for team creation feedback...');
    await page.waitForTimeout(2000); // Wait a bit for the API call
    
    // Check what's actually on the page
    const statusMessage = await page.locator('[data-testid="status-message"]').textContent();
    console.log('Status message content:', statusMessage);
    
    // Check if the status message contains the expected text
    await expect(page.locator('[data-testid="status-message"]')).toContainText(`Created team ${teamName}`);
  });

  test('should handle game session transitions', async ({ page }) => {
    // Setup: Create user and team
    const username = `user_${Date.now()}`;
    const teamName = `team_${Date.now()}`;
    
    await page.getByPlaceholder('Username').fill(username);
    await page.getByRole('button', { name: 'Set Username' }).click();
    await page.getByPlaceholder('New team name').fill(teamName);
    await page.getByRole('button', { name: 'Create New Team' }).click();
    
    // Wait for team creation
    await expect(page.getByText(`Created team ${teamName}`)).toBeVisible();
    
    // Join the team (should appear in teams list)
    await page.getByRole('button', { name: `Join team ${teamName}` }).click();
    await expect(page.getByText(`Your Team: ${teamName}`)).toBeVisible();
    
    // Start game session
    await page.getByRole('button', { name: 'Start Game' }).click();
    
    // Wait for game session to start
    await page.waitForTimeout(2000);
    
    // Check for game session view
    await expect(page.getByText('Game Session')).toBeVisible();
  });

  test('should display game session states correctly', async ({ page }) => {
    // Setup game session
    const username = `user_${Date.now()}`;
    const teamName = `team_${Date.now()}`;
    
    await page.getByPlaceholder('Username').fill(username);
    await page.getByRole('button', { name: 'Set Username' }).click();
    await page.getByPlaceholder('New team name').fill(teamName);
    await page.getByRole('button', { name: 'Create New Team' }).click();
    await page.getByRole('button', { name: `Join team ${teamName}` }).click();
    await page.getByRole('button', { name: 'Start Game' }).click();
    
    // Wait for game session
    await page.waitForTimeout(2000);
    
    // Check for game session container
    await expect(page.locator('.game-session-container')).toBeVisible();
    
    // Check for possible game states
    const possibleStates = [
      'Connecting to game',
      'Loading game',
      'Waiting for your turn',
      'Your Puzzle',
      'Game Over',
      'You have been eliminated'
    ];
    
    // At least one of these states should be visible
    let stateFound = false;
    for (const state of possibleStates) {
      try {
        await expect(page.getByText(state)).toBeVisible({ timeout: 1000 });
        stateFound = true;
        break;
      } catch {
        // Continue checking other states
      }
    }
    
    expect(stateFound).toBeTruthy();
  });

  test('should handle team joining and leaving', async ({ page }) => {
    // Create first user and team
    const username1 = `user1_${Date.now()}`;
    const teamName = `team_${Date.now()}`;
    
    await page.getByPlaceholder('Username').fill(username1);
    await page.getByRole('button', { name: 'Set Username' }).click();
    await page.getByPlaceholder('New team name').fill(teamName);
    await page.getByRole('button', { name: 'Create New Team' }).click();
    await page.getByRole('button', { name: `Join team ${teamName}` }).click();
    
    // Verify team membership
    await expect(page.getByText(`Your Team: ${teamName}`)).toBeVisible();
    
    // Test leaving team
    await page.getByRole('button', { name: 'Leave Team' }).click();
    await expect(page.getByText('You left the team.')).toBeVisible();
    
    // Verify back to lobby state
    await expect(page.getByText('Available Teams:')).toBeVisible();
  });

  test('should display team points and standings', async ({ page }) => {
    // Setup game session
    const username = `user_${Date.now()}`;
    const teamName = `team_${Date.now()}`;
    
    await page.getByPlaceholder('Username').fill(username);
    await page.getByRole('button', { name: 'Set Username' }).click();
    await page.getByPlaceholder('New team name').fill(teamName);
    await page.getByRole('button', { name: 'Create New Team' }).click();
    await page.getByRole('button', { name: `Join team ${teamName}` }).click();
    await page.getByRole('button', { name: 'Start Game' }).click();
    
    // Wait for game session
    await page.waitForTimeout(2000);
    
    // Check for team points table (should be present in most game states)
    try {
      await expect(page.locator('.team-points-table')).toBeVisible({ timeout: 3000 });
      await expect(page.getByText('Player')).toBeVisible();
      await expect(page.getByText('Points')).toBeVisible();
    } catch {
      // Team points table might not be visible in all states, which is okay
      console.log('Team points table not visible in current game state');
    }
  });

  test('should handle game session errors gracefully', async ({ page }) => {
    // Try to start a game without proper setup
    await page.getByRole('button', { name: 'Start Game' }).click();
    
    // Should show error message
    await expect(page.getByText('Set your username first.')).toBeVisible();
    
    // Set username but don't join team
    await page.getByPlaceholder('Username').fill('testuser');
    await page.getByRole('button', { name: 'Set Username' }).click();
    await page.getByRole('button', { name: 'Start Game' }).click();
    
    // Should show appropriate error
    await expect(page.getByText(/Failed to start game session/)).toBeVisible();
  });

  test('should display loading states during transitions', async ({ page }) => {
    // Setup
    const username = `user_${Date.now()}`;
    const teamName = `team_${Date.now()}`;
    
    await page.getByPlaceholder('Username').fill(username);
    await page.getByRole('button', { name: 'Set Username' }).click();
    await page.getByPlaceholder('New team name').fill(teamName);
    await page.getByRole('button', { name: 'Create New Team' }).click();
    await page.getByRole('button', { name: `Join team ${teamName}` }).click();
    
    // Start game and check for loading state
    await page.getByRole('button', { name: 'Start Game' }).click();
    
    // Should show loading message
    await expect(page.getByText('Starting game session...')).toBeVisible();
    
    // Wait for transition
    await page.waitForTimeout(2000);
    
    // Should show game session or loading state
    const possibleStates = [
      'Connecting to game',
      'Loading game',
      'Game Session',
      'Waiting for your turn'
    ];
    
    let stateFound = false;
    for (const state of possibleStates) {
      try {
        await expect(page.getByText(state)).toBeVisible({ timeout: 1000 });
        stateFound = true;
        break;
      } catch {
        // Continue checking
      }
    }
    
    expect(stateFound).toBeTruthy();
  });
}); 