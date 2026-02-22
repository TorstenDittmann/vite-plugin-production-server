# vite-plugin-production-server

Vite plugin + production server that provides **runtime-configurable environment variables** for built SPAs **without rebuilds**, while preserving a **compatible `import.meta.env`-like object**.

## Features

- 🚀 Runtime-configurable env vars after `vite build`
- 🔌 Drop-in replacement for `import.meta.env` 
- 🛠️ Compatible with libraries expecting Vite-style env objects
- 📦 Minimal setup - just add the plugin and deploy
- 🎯 Dev/prod parity
- 🔒 Security headers by default

## Installation

```bash
npm install vite-plugin-production-server
# or
yarn add vite-plugin-production-server
# or
bun add vite-plugin-production-server
```

## Quick Start

### 1. Add the plugin to your Vite config

```typescript
import { defineConfig } from 'vite';
import productionServer from 'vite-plugin-production-server';

export default defineConfig({
  plugins: [productionServer()],
});
```

### 2. Use virtual modules in your app

```typescript
// Option 1: Drop-in import.meta.env replacement
import env from 'virtual:import-meta-env';

console.log(env.VITE_API_URL); // Runtime configurable!
someLibrary.init({ env });

// Option 2: Helper functions
import { env, envOrThrow, refreshEnv } from 'virtual:runtime-env';

const apiUrl = env('VITE_API_URL');
const requiredKey = envOrThrow('VITE_REQUIRED_KEY');
```

### 3. Build your app

```bash
vite build
```

### 4. Run the production server

```bash
VITE_API_URL=https://api.example.com vite-production-server dist
```

## Usage Examples

### Vite Config

```typescript
import { defineConfig } from 'vite';
import productionServer from 'vite-plugin-production-server';

export default defineConfig({
  plugins: [
    productionServer({
      envPrefix: ['VITE_', 'PUBLIC_'], // Multiple prefixes
      envJsPath: '/env.js',            // Custom path
      configJsonPath: '/config.json',  // Enable JSON endpoint for refresh
      injectPosition: 'head-prepend',  // Where to inject script
    })
  ],
});
```

### App Code

```typescript
import env from 'virtual:import-meta-env';

// Pass to libraries expecting import.meta.env
fetch(env.VITE_API_URL + '/health');
```

```typescript
import { envOrThrow } from 'virtual:runtime-env';

// Strict env access
const api = envOrThrow('VITE_API_URL');
```

### Production

```bash
# Basic usage
vite build
vite-production-server dist

# With custom options
VITE_API_URL=https://api.example.com \
VITE_APP_NAME="My App" \
vite-production-server dist --port 3000 --env-prefix VITE_

# Using vps alias
vps dist --port 8080
```

## CLI Options

```bash
vite-production-server [distDir] [options]

Options:
  --port              Port to listen on (default: 4173)
  --host              Host to bind to (default: 0.0.0.0)
  --base              Base URL path (default: /)
  --env-prefix        Environment variable prefix (default: VITE_)
  --env-js-path       Path for env.js endpoint (default: /env.js)
  --config-json-path  Path for config.json endpoint
  --no-spa-fallback   Disable SPA fallback
  --no-log            Disable request logging
```

## Plugin Options

```typescript
export interface ProductionServerPluginOptions {
  /** Prefix to include env vars (default: 'VITE_') */
  envPrefix?: string | string[];

  /** Route that returns JS assigning window.__ENV__ (default: '/env.js') */
  envJsPath?: string;

  /** Route that returns JSON runtime config (optional) */
  configJsonPath?: string | null;

  /** Inject script tag into index.html (default: true) */
  injectEnvScript?: boolean;

  /** Where to inject: 'head-prepend' | 'head-append' (default: 'head-prepend') */
  injectPosition?: 'head-prepend' | 'head-append';

  /** Customize which keys from process.env are exposed */
  expose?: (key: string, value: string | undefined) => boolean;

  /** Defaults for MODE/BASE_URL */
  defaults?: {
    mode?: string;
    baseUrl?: string;
  };

  /** Whether to include Vite-like meta flags (default: true) */
  includeMetaFlags?: boolean;

  /** Enable dev middleware serving env.js (default: true) */
  devMiddleware?: boolean;

  /** Name of global for injected env payload (default: '__ENV__') */
  globalName?: string;
}
```

## Virtual Modules

### `virtual:import-meta-env`

Default export is an object shaped like Vite's `import.meta.env`:

```typescript
import env from 'virtual:import-meta-env';

// env has shape: { MODE, BASE_URL, DEV, PROD, SSR, VITE_* }
```

### `virtual:runtime-env`

Helper functions for accessing environment:

```typescript
import { getEnv, env, envOrThrow, refreshEnv } from 'virtual:runtime-env';

getEnv()           // Returns full env object
env('VITE_X')      // Returns value or undefined
envOrThrow('VITE_X') // Returns value or throws
refreshEnv()       // Refresh from window global
```

## TypeScript Support

Add to your `env.d.ts` or `vite-env.d.ts`:

```typescript
/// <reference types="vite-plugin-production-server/env" />
```

Or import directly:

```typescript
import type { ImportMetaEnvLike } from 'vite-plugin-production-server';
```

## How It Works

1. **Build time**: Plugin injects a `<script src="/env.js">` tag into `index.html`
2. **Runtime**: Server generates `/env.js` from current `process.env`
3. **Client**: Virtual modules read from `window.__ENV__` populated by `/env.js`

Change env vars → Restart server → New values served immediately. No rebuild needed!

## Security

- Filters env vars by prefix (default: `VITE_*`)
- Optional custom `expose()` function for fine-grained control
- Security headers included by default:
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`

**Note**: All runtime env values are public. Do not expose secrets!

## License

MIT
