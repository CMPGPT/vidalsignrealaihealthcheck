// Suppress React warnings in development
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  const message = args[0];
  if (typeof message === 'string' && message.includes('useLayoutEffect')) {
    return; // Suppress useLayoutEffect warnings
  }
  originalConsoleWarn.apply(console, args);
};

const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args[0];
  if (typeof message === 'string' && message.includes('useLayoutEffect')) {
    return; // Suppress useLayoutEffect errors
  }
  originalConsoleError.apply(console, args);
}; 