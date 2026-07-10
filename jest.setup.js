// jest.setup.js
import '@testing-library/jest-dom';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({ data: null, status: 'unauthenticated' })),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

// Mock next/navigation - FIX: Add useSearchParams
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '',
  useSearchParams: () => new URLSearchParams(), // ADD THIS LINE
}));

// Mock axios
jest.mock('axios', () => ({
  post: jest.fn(),
  create: jest.fn(() => ({
    post: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  })),
  isAxiosError: jest.fn((error) => error && error.isAxiosError === true),
}));