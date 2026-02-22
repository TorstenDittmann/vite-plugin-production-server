import { defineCommand } from 'citty';
import { startProductionServer } from './server/index.js';

/**
 * Define the CLI command
 */
export const main = defineCommand({
  meta: {
    name: 'vite-production-server',
    description: 'Serve production build with runtime-configurable environment variables',
    version: '0.1.0',
  },
  args: {
    dist: {
      type: 'positional',
      description: 'Distribution directory',
      default: 'dist',
    },
    port: {
      type: 'string',
      description: 'Port to listen on',
      default: '4173',
    },
    host: {
      type: 'string',
      description: 'Host to bind to',
      default: '0.0.0.0',
    },
    base: {
      type: 'string',
      description: 'Base URL path',
      default: '/',
    },
    'env-prefix': {
      type: 'string',
      description: 'Environment variable prefix',
      default: 'VITE_',
    },
    'env-js-path': {
      type: 'string',
      description: 'Path for env.js endpoint',
      default: '/env.js',
    },
    'config-json-path': {
      type: 'string',
      description: 'Path for config.json endpoint (optional)',
    },
    'no-spa-fallback': {
      type: 'boolean',
      description: 'Disable SPA fallback',
      default: false,
    },
    'no-log': {
      type: 'boolean',
      description: 'Disable request logging',
      default: false,
    },
  },
  run: async ({ args }) => {
    /** @type {import('./types.ts').ProductionServerOptions} */
    const options = {
      distDir: args.dist,
      port: parseInt(args.port, 10),
      host: args.host,
      base: args.base,
      envPrefix: args['env-prefix'],
      envJsPath: args['env-js-path'],
      configJsonPath: args['config-json-path'] || null,
      spaFallback: !args['no-spa-fallback'],
      log: !args['no-log'],
    };

    await startProductionServer(options);
  },
});
