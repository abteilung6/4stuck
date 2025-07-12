import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock WebSocket for tests
class MockWebSocket {
  readyState = 1; // OPEN
  onopen: (() => void) | null = null;
  onmessage: ((event: any) => void) | null = null;
  onerror: (() => void) | null = null;
  onclose: (() => void) | null = null;

  constructor(url: string) {
    setTimeout(() => this.onopen?.(), 0);
  }

  send(data: string) {}
  close() {
    this.readyState = 3; // CLOSED
    this.onclose?.();
  }
}
globalThis.WebSocket = MockWebSocket as any;

// localStorage is no longer used, so no mock needed 