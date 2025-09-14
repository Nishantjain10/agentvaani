import type { NextConfig } from 'next';
import { createRequire } from 'node:module';
import createNextIntlPlugin from 'next-intl/plugin';

const require = createRequire(import.meta.url);

const withNextIntl = createNextIntlPlugin('./i18n.ts');

// Bundle analyzer is used to see bundle size information if needed
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/**
 * Configuration for Next.js Application
 */
const nextConfig: NextConfig = {
  // Ensure ESLint is properly configured
  eslint: {
    dirs: ['.'],
  },
  // Experimental features (removed deprecated options)
  // Disable source maps in development to reduce memory usage
  productionBrowserSourceMaps: false,
  // Handle webpack configuration
  webpack: (config, { dev, isServer }) => {
    // Reduce console noise in development
    if (dev && !isServer) {
      config.infrastructureLogging = {
        level: 'error',
      };
    }
    return config;
  },
};

export default withNextIntl(withBundleAnalyzer(nextConfig));