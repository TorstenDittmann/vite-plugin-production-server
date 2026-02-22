# Quick Start

Get up and running with vite-plugin-production-server in under 5 minutes.

## Step 1: Install the Package

```bash
npm install vite-plugin-production-server
```

## Step 2: Add the Plugin to Vite Config

Update your `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import productionServer from 'vite-plugin-production-server';

export default defineConfig({
  plugins: [productionServer()],
});
```

## Step 3: Use Environment Variables in Your App

Replace `import.meta.env` with the virtual module:

```typescript
// Before
const apiUrl = import.meta.env.VITE_API_URL;

// After
import env from 'virtual:import-meta-env';
const apiUrl = env.VITE_API_URL;
```

Or use the helper functions:

```typescript
import { env, envOrThrow } from 'virtual:runtime-env';

// Safe access
const apiUrl = env('VITE_API_URL');

// Strict access (throws if missing)
const requiredKey = envOrThrow('VITE_REQUIRED_KEY');
```

## Step 4: Build and Run

Build your application as usual:

```bash
vite build
```

Start the production server with your environment variables:

```bash
VITE_API_URL=https://api.example.com vite-production-server dist
```

Your app is now running at `http://localhost:4173` with runtime-configurable environment variables!

## Try It Out

Test the runtime configuration:

```bash
# Terminal 1: Start with one config
VITE_APP_NAME="First Config" vite-production-server dist

# Terminal 2: Start with different config (no rebuild needed!)
VITE_APP_NAME="Second Config" vite-production-server dist --port 3000
```

Both servers run the same built files but with different environment values.

## Complete Example

Here's a minimal working example:

### Project Structure

```
my-app/
├── src/
│   ├── main.ts
│   └── vite-env.d.ts
├── dist/               # Build output
├── vite.config.ts
└── package.json
```

### vite.config.ts

```typescript
import { defineConfig } from 'vite';
import productionServer from 'vite-plugin-production-server';

export default defineConfig({
  plugins: [productionServer()],
});
```

### src/main.ts

```typescript
import env from 'virtual:import-meta-env';

// Display environment info
console.log('Mode:', env.MODE);
console.log('API URL:', env.VITE_API_URL);
console.log('App Name:', env.VITE_APP_NAME);

// Update the UI
document.body.innerHTML = `
  <h1>${env.VITE_APP_NAME || 'My App'}</h1>
  <p>API: ${env.VITE_API_URL || 'Not configured'}</p>
  <p>Mode: ${env.MODE}</p>
`;
```

### src/vite-env.d.ts

```typescript
/// <reference types="vite/client" />
/// <reference types="vite-plugin-production-server/env" />
```

### Running

```bash
# Install dependencies
npm install

# Build
vite build

# Run with environment variables
VITE_API_URL=https://api.example.com \
VITE_APP_NAME="Hello World" \
vite-production-server dist
```

Visit `http://localhost:4173` to see your app with runtime environment variables.

## What's Next?

Now that you have a working setup:

- [Learn the Core Concepts](../core-concepts/how-it-works.md) — Understand how it works
- [Explore Plugin Options](../configuration/plugin-options.md) — Customize behavior
- [Examples](../examples/basic-spa.md) — See a complete working example