# Playwright E2E Tests for Team Human

This directory contains end-to-end (E2E) tests for the Team Human real-time multiplayer puzzle game using Playwright.

## Test Structure

```
tests/
├── README.md                    # This file
├── example.spec.ts             # Basic functionality tests
├── multiplayer.spec.ts         # Multiplayer game tests
├── advanced-multiplayer.spec.ts # Complex multiplayer scenarios
└── utils/
    └── test-helpers.ts         # Reusable test utilities
```

## Prerequisites

1. **Install system dependencies** (if not already done):
   ```bash
   sudo npx playwright install-deps
   ```

2. **Ensure backend is running**:
   ```bash
   cd ../backend
   uvicorn main:app --reload
   ```

3. **Ensure frontend is running** (or let Playwright start it automatically):
   ```bash
   npm run dev
   ```

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests with UI mode (interactive)
npm run test:ui

# Run tests in headed mode (see browser)
npm run test:headed

# Run tests in debug mode
npm run test:debug

# Show test report
npm run test:report
```

### Running Specific Tests

```bash
# Run specific test file
npx playwright test example.spec.ts

# Run tests matching a pattern
npx playwright test --grep "multiplayer"

# Run tests in specific browser
npx playwright test --project=firefox

# Run tests in mobile viewport
npx playwright test --project="Mobile Chrome"
```

### Running Tests in Parallel

```bash
# Run tests in parallel (default)
npx playwright test

# Run tests sequentially
npx playwright test --workers=1
```

## Test Categories

### 1. Basic Functionality (`example.spec.ts`)
- Page loading and navigation
- User registration
- Team creation and joining
- Basic form interactions

### 2. Multiplayer Functionality (`multiplayer.spec.ts`)
- Multiple users joining teams
- Real-time game session management
- WebSocket connection handling
- Puzzle solving interactions

### 3. Advanced Scenarios (`advanced-multiplayer.spec.ts`)
- Full game flow with multiple players
- Player elimination mechanics
- Team competition scenarios
- Complex real-time interactions

## Test Utilities

The `utils/test-helpers.ts` file provides reusable functions for common test operations:

- `TestHelper.registerUser()` - Register a new user
- `TestHelper.createTeam()` - Create a team
- `TestHelper.joinTeam()` - Join an existing team
- `TestHelper.startGameSession()` - Start a game session
- `TestHelper.submitAnswer()` - Submit a puzzle answer
- `TestHelper.setupMultiplayerGame()` - Setup complete multiplayer scenario

## Configuration

The Playwright configuration (`playwright.config.ts`) includes:

- **Base URL**: `http://localhost:5173` (Vite dev server)
- **Web Server**: Automatically starts the dev server before tests
- **Browsers**: Chrome, Firefox, Safari, and mobile viewports
- **Reporting**: HTML reports with screenshots and videos on failure
- **Parallel Execution**: Tests run in parallel by default

## Best Practices

### 1. Test Data Management
- Use unique usernames/emails for each test
- Clean up test data when possible
- Use descriptive test names

### 2. Waiting Strategies
- Use `waitForSelector()` for dynamic content
- Avoid fixed timeouts when possible
- Use `data-testid` attributes for reliable element selection

### 3. Multiplayer Testing
- Use separate browser contexts for different users
- Test real-time updates across multiple pages
- Verify WebSocket connections

### 4. Debugging
- Use `--headed` mode to see browser actions
- Use `--debug` mode for step-by-step debugging
- Check screenshots and videos in test reports

## Troubleshooting

### Common Issues

1. **Tests fail with "element not found"**
   - Check if the backend is running
   - Verify the frontend is accessible at `http://localhost:5173`
   - Check for timing issues (add appropriate waits)

2. **WebSocket connection failures**
   - Ensure backend WebSocket endpoint is working
   - Check CORS configuration
   - Verify WebSocket URL in frontend

3. **Browser launch issues**
   - Run `npx playwright install-deps` to install system dependencies
   - Check if browsers are properly installed

### Debug Commands

```bash
# Install missing dependencies
sudo npx playwright install-deps

# Reinstall browsers
npx playwright install

# Clear cache
npx playwright clear-cache

# Show trace viewer
npx playwright show-trace trace.zip
```

## Continuous Integration

For CI/CD, the configuration automatically:
- Runs tests in headless mode
- Retries failed tests (2 retries in CI)
- Generates HTML reports
- Takes screenshots and videos on failure

Example GitHub Actions workflow:
```yaml
- name: Run Playwright tests
  run: |
    cd frontend
    npm run test
  env:
    CI: true
```

## Contributing

When adding new tests:
1. Follow the existing naming conventions
2. Use the test utilities when possible
3. Add appropriate `data-testid` attributes to new components
4. Test both success and failure scenarios
5. Include multiplayer scenarios for real-time features 