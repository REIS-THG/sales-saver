
import '@testing-library/jest-dom';

// Mock window.matchMedia for components that might use it
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {},
    addEventListener: function() {},
    removeEventListener: function() {},
    dispatchEvent: function() {
      return true;
    },
  };
};

// Mock ResizeObserver which might be used by some components
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Suppress console errors during tests
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' && 
    (args[0].includes('Error:') || 
     args[0].includes('Warning:') ||
     args[0].includes('act(...)'))
  ) {
    return;
  }
  originalConsoleError(...args);
};
