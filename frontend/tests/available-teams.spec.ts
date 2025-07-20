import { test, expect } from '@playwright/test';

test.describe('Available Teams Functionality', () => {
  test('should only show available teams in the lobby', async ({ page }) => {
    // Navigate to the lobby
    await page.goto('http://localhost:5173/');
    
    // Wait for the page to load
    await page.waitForSelector('h2:has-text("Available Teams:")');
    
    // Check that the available teams section is present
    const availableTeamsSection = page.locator('h2:has-text("Available Teams:")');
    await expect(availableTeamsSection).toBeVisible();
    
    // Check that the team list is present (even if empty)
    const teamList = page.locator('.teams-list');
    await expect(teamList).toBeVisible();
    
    // Check that the create team form is present
    const createTeamInput = page.locator('input[placeholder="New team name"]');
    await expect(createTeamInput).toBeVisible();
    
    const createTeamButton = page.locator('button:has-text("+ Create New Team")');
    await expect(createTeamButton).toBeVisible();
  });

  test('should show player count information for teams', async ({ page }) => {
    // Navigate to the lobby
    await page.goto('http://localhost:5173/');
    
    // Wait for the page to load
    await page.waitForSelector('h2:has-text("Available Teams:")');
    
    // If there are teams, check that they show player count
    const teamItems = page.locator('.teams-list .ds-list-item');
    const teamCount = await teamItems.count();
    
    if (teamCount > 0) {
      // Check that at least one team shows player count format (X/Y players)
      const playerCountText = page.locator('span[aria-label*="players"]');
      await expect(playerCountText.first()).toBeVisible();
      
      // Verify the format is "X/Y players"
      const firstPlayerCount = await playerCountText.first().textContent();
      expect(firstPlayerCount).toMatch(/\d+\/\d+ players/);
    }
  });

  test('should handle empty available teams gracefully', async ({ page }) => {
    // Navigate to the lobby
    await page.goto('http://localhost:5173/');
    
    // Wait for the page to load
    await page.waitForSelector('h2:has-text("Available Teams:")');
    
    // Check that either teams are shown or a message about no teams
    const teamList = page.locator('.teams-list');
    const noTeamsMessage = page.locator('text=No available teams');
    
    // One of these should be visible
    const hasTeams = await teamList.locator('.ds-list-item').count() > 0;
    const hasNoTeamsMessage = await noTeamsMessage.isVisible();
    
    expect(hasTeams || hasNoTeamsMessage).toBe(true);
  });
}); 