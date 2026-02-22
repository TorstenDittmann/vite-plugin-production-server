# vite-plugin-production-server

Vite plugin + production server for **runtime-configurable environment variables** without rebuilds.

## What Problem Does It Solve?

Traditional Vite builds bake environment variables into your JavaScript bundle at build time:

```javascript
// During build, Vite replaces this:
const apiUrl = import.meta.env.VITE_API_URL;
// Becomes: const apiUrl = "https://api.example.com";
```

This means:
- Same build **can't** be used across environments
- Changing env vars requires a **full rebuild**
- Docker images **aren't** portable

## The Solution

Serve environment variables at runtime instead of build time:

```typescript
// Your code
import env from 'virtual:import-meta-env';
const apiUrl = env.VITE_API_URL;

// Server reads from process.env at startup
// Change it → restart server → instant update, no rebuild!
```

## Quick Start

```bash
# Install
npm install vite-plugin-production-server
```

```typescript
// vite.config.ts
import productionServer from 'vite-plugin-production-server';

export default {
  plugins: [productionServer()],
};
```

```typescript
// Use in your app
import env from 'virtual:import-meta-env';
console.log(env.VITE_API_URL); // Runtime value!
```

```bash
# Build and serve
vite build
VITE_API_URL=https://api.example.com vite-production-server dist
```

## Documentation

- [Installation](./getting-started/installation.md) — Setup guide
- [Quick Start](./getting-started/quick-start.md) — Your first app
- [How It Works](./core-concepts/how-it-works.md) — Architecture
- [Configuration](./configuration/plugin-options.md) — Plugin options
- [Examples](./examples/basic-spa.md) — Working example

## License

MIT