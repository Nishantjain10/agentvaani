// Filter out noisy console errors in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalError = console.error;
  const originalWarn = console.warn;

  console.error = (...args: any[]) => {
    const message = args.join(' ');
    
    // Filter out sidecar connection errors
    if (message.includes('Sidecar connection error') || 
        message.includes('8969/stream') ||
        message.includes('ERR_CONNECTION_REFUSED')) {
      return; // Suppress these specific errors
    }
    
    originalError.apply(console, args);
  };

  console.warn = (...args: any[]) => {
    const message = args.join(' ');
    
    // Filter out sidecar warnings
    if (message.includes('Sidecar') || 
        message.includes('8969')) {
      return; // Suppress these specific warnings
    }
    
    originalWarn.apply(console, args);
  };
}

