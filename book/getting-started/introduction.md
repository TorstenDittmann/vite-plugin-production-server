# Introduction

**vite-plugin-production-server** is a Vite plugin and production server that solves a critical problem for Single Page Applications (SPAs): **runtime-configurable environment variables without rebuilds**.

## The Problem

Traditional Vite builds bake environment variables into your JavaScript bundle at build time:

```javascript
// During build, Vite replaces import.meta.env.VITE_API_URL
const apiUrl = import.meta.env.VITE_API_URL;
// Becomes: const apiUrl = "https://api.example.com";
```

This works fine until you need to:

- Deploy the same Docker image to multiple environments (staging, production)
- Change API endpoints without triggering a full rebuild
- Allow operations teams to configure apps without touching code
- Maintain dev/prod parity in environment handling

## The Solution

vite-plugin-production-server provides **runtime environment variables** that are injected when the server starts, not when the code is built:

```javascript
// Your code stays the same
const apiUrl = env.VITE_API_URL;

// But VITE_API_URL is read from process.env at server startup
// Change it → restart server → instant update, no rebuild needed
```

## Key Features

- **Runtime Configuration** — Change env vars without rebuilding
- **Drop-in Replacement** — Compatible with `import.meta.env` API
- **Zero Config** — Works out of the box with sensible defaults
- **Production Ready** — Built-in server with security headers
- **TypeScript Support** — Full type definitions included
- **Framework Agnostic** — Works with React, Vue, Svelte, or vanilla JS

## Use Cases

### Multi-Environment Deployments

Build once, deploy everywhere with environment-specific configuration:

```bash
# Same image, different configs
docker run -e VITE_API_URL=https://staging.api.com myapp
docker run -e VITE_API_URL=https://api.example.com myapp
```

### Dynamic Configuration

Allow operations teams to modify behavior without code changes:

```bash
# Enable feature flags
VITE_FEATURE_X=true vite-production-server dist

# Change analytics key
VITE_ANALYTICS_KEY=new-key vite-production-server dist
```

### Library Compatibility

Pass environment objects to libraries expecting Vite-style env:

```javascript
import env from 'virtual:import-meta-env';

// Works with libraries that expect import.meta.env
analytics.init({ env });
sentry.init({ environment: env.VITE_ENV });
```

## How It Works

1. **Build Time**: Plugin injects a `<script src="/env.js">` tag into your HTML
2. **Runtime**: Server generates `/env.js` from current `process.env` 
3. **Client**: Virtual modules read from `window.__ENV__` populated by the script

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Build      │────▶│    Server    │────▶│    Client    │
│   (Vite)     │     │  (Node.js)   │     │  (Browser)   │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                    │
       │ Injects script     │ Serves env.js      │ Reads window.__ENV__
       │ tag into HTML      │ from process.env   │ via virtual modules
```

## Quick Example

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import productionServer from 'vite-plugin-production-server';

export default defineConfig({
  plugins: [productionServer()],
});
```

```typescript
// src/main.ts
import env from 'virtual:import-meta-env';

console.log(env.VITE_API_URL); // Runtime value!
```

```bash
# Build and serve
vite build
VITE_API_URL=https://api.example.com vite-production-server dist
```

## Next Steps

Ready to get started? Check out:

- [Installation](./installation.md) — Install the package
- [Quick Start](./quick-start.md) — Build your first app with runtime env vars
- [How It Works](../core-concepts/how-it-works.md) — Deep dive into the architecture