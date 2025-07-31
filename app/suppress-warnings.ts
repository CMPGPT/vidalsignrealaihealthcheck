'use client';

// Suppress React useLayoutEffect warnings
if (typeof window !== 'undefined') {
  const originalConsoleWarn = console.warn;
  console.warn = (...args: any[]) => {
    const message = args[0];
    if (typeof message === 'string' && message.includes('useLayoutEffect')) {
      return; // Suppress useLayoutEffect warnings
    }
    originalConsoleWarn.apply(console, args);
  };
} 