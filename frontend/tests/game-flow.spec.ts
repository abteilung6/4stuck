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
}); 