
// Jest setup file for common test configurations

// Mock console methods to reduce noise in test output
const originalConsole = global.console;

beforeAll(() => {
  global.console = {
    ...originalConsole,
    // Keep error and warn for debugging
    error: originalConsole.error,
    warn: originalConsole.warn,
    // Mock info and log to reduce noise
    info: jest.fn(),
    log: jest.fn(),
    debug: jest.fn(),
  };
});

afterAll(() => {
  global.console = originalConsole;
});

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';

// Mock setTimeout and clearTimeout for testing
global.setTimeout = jest.fn().mockImplementation((fn) => fn()) as any;
global.clearTimeout = jest.fn();

// Mock fetch globally if needed
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

// Increase timeout for async tests
jest.setTimeout(10000);

// Global test utilities
export const createMockUser = (overrides = {}) => ({
  id: 1,
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: 'user',
  isActive: true,
  emailVerified: false,
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
  ...overrides,
});

export const createMockRequest = (overrides = {}): Partial<Request> => ({
  body: {},
  headers: {},
  params: {},
  query: {},
  ...overrides,
});

export const createMockResponse = (): Partial<Response> => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
  send: jest.fn().mockReturnThis(),
  cookie: jest.fn().mockReturnThis(),
  clearCookie: jest.fn().mockReturnThis(),
});

export const createMockNext = (): jest.MockedFunction<any> => jest.fn();
