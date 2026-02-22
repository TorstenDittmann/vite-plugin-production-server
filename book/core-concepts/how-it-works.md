# How It Works

Understanding the architecture of vite-plugin-production-server will help you use it effectively and troubleshoot any issues.

## The Problem: Build-Time Environment Variables

Traditional Vite builds embed environment variables into your JavaScript at compile time:

```javascript
// Source code
const apiUrl = import.meta.env.VITE_API_URL;

// After build
const apiUrl = "https://api.example.com";
```

This creates a problem: **you need to rebuild your app to change configuration**.

## The Solution: Runtime Environment Variables

vite-plugin-production-server solves this by separating environment variables from the build:

```
Build (Static)     Runtime (Dynamic)     Client (Browser)
     │                   │                    │
     │  1. Inject        │                    │
     │     script tag    │                    │
     ▼                   │                    │
┌─────────┐              │                    │
│index.html│─────────────│───────────────────▶│
│ (has    │              │                    │
│  env.js)│              │  2. Server         │
└─────────┘              │     serves         │
     │                   │     env.js         │
     │                   │                    │
     │                   ▼                    │
     │              ┌──────────┐              │
     │              │ /env.js  │─────────────▶│
     │              │ (dynamic)│              │
     │              └──────────┘              │
     │                   │                    │
     │                   │  3. Browser        │
     │                   │     loads          │
     │                   │     env.js         │
     ▼                   ▼                    ▼
┌─────────┐         ┌──────────┐        ┌──────────┐
│  App    │────────▶│window.   │───────▶│Virtual   │
│ Bundle  │         │__ENV__   │        │Modules   │
│(static) │         │(runtime) │        │(env.VAR) │
└─────────┘         └──────────┘        └──────────┘
```

## The Three-Step Process

### Step 1: Build-Time Injection

During `vite build`, the plugin transforms your `index.html`:

**Before:**
```html
<!DOCTYPE html>
<html>
  <head>
    <title>My App</title>
  </head>
  <body>
    <div id="app"></div>
    <script src="/src/main.ts"></script>
  </body>
</html>
```

**After (in dist/index.html):**
```html
<!DOCTYPE html>
<html>
  <head>
    <script src="/env.js"></script>  <!-- Injected by plugin -->
    <title>My App</title>
  </head>
  <body>
    <div id="app"></div>
    <script src="/assets/index-[hash].js"></script>
  </body>
</html>
```

This injection happens **before** the main app bundle loads, ensuring `window.__ENV__` is available immediately.

### Step 2: Runtime Serving

The production server generates `/env.js` dynamically from `process.env`:

```javascript
// Server generates this on each request
window["__ENV__"] = {
  "MODE": "production",
  "BASE_URL": "/",
  "DEV": false,
  "PROD": true,
  "SSR": false,
  "VITE_API_URL": "https://api.example.com",
  "VITE_APP_NAME": "My Production App"
};
```

Key characteristics:
- Generated fresh on every request (no caching)
- Reads from current `process.env`
- Filters by prefix (default: `VITE_*`)
- Can use custom filtering logic

### Step 3: Client-Side Access

Your app code uses virtual modules to access `window.__ENV__`:

```typescript
import env from 'virtual:import-meta-env';

// Reads from window.__ENV__
console.log(env.VITE_API_URL);
```

The virtual module creates a Proxy that reads from the global:

```javascript
// Generated virtual module code
const globalName = "__ENV__";
const store = (typeof globalThis !== 'undefined' && globalThis[globalName]) || 
              (typeof window !== 'undefined' && window[globalName]) || 
              {};

export default new Proxy(store, {
  get(target, prop) {
    return target[prop];
  }
});
```

## Development vs Production

### Development Mode

When running `vite dev`:

1. Plugin adds middleware to Vite's dev server
2. `/env.js` endpoint returns values from Vite's import.meta.env
3. Virtual modules work seamlessly
4. Hot Module Replacement (HMR) continues to work

### Production Mode

When running `vite build` + `vite-production-server`:

1. Static files are built and placed in `dist/`
2. Production server serves files and generates dynamic `/env.js`
3. Same virtual modules work identically
4. Environment variables are truly runtime-configurable

## Data Flow

```
┌─────────────────┐
│  process.env    │
├─────────────────┤
│ VITE_API_URL    │
│ VITE_APP_NAME   │
│ OTHER_SECRET    │  ← Filtered out (no prefix)
└────────┬────────┘
         │
         │ Filter by prefix
         │ (default: VITE_*)
         ▼
┌─────────────────┐
│  Filtered Env   │
├─────────────────┤
│ VITE_API_URL    │
│ VITE_APP_NAME   │
└────────┬────────┘
         │
         │ Add meta flags
         │ (MODE, DEV, PROD, SSR)
         ▼
┌─────────────────┐
│   env object    │
├─────────────────┤
│ MODE            │
│ BASE_URL        │
│ DEV             │
│ PROD            │
│ SSR             │
│ VITE_API_URL    │
│ VITE_APP_NAME   │
└────────┬────────┘
         │
         │ Serialize to JS
         ▼
┌─────────────────────────────────────┐
│           /env.js                   │
├─────────────────────────────────────┤
│ window["__ENV__"] = {               │
│   MODE: "production",               │
│   VITE_API_URL: "https://..."       │
│ };                                  │
└─────────────────────────────────────┘
```

## Security Considerations

⚠️ **Important**: All values in `/env.js` are public. Anyone can view the page source and see the values.

**Do NOT expose:**
- API secrets
- Database passwords
- Private keys
- Any sensitive credentials

**Safe to expose:**
- Public API URLs
- Feature flags
- Public keys (Stripe, Firebase, etc.)
- App configuration

## Benefits of This Architecture

1. **Environment Agnostic Build**: Build once, deploy to staging, production, or any environment
2. **Fast Iteration**: Change config without waiting for rebuilds
3. **Dev/Prod Parity**: Same code path in development and production
4. **Type Safety**: Full TypeScript support with virtual modules
5. **Framework Agnostic**: Works with any frontend framework
6. **Zero Runtime Overhead**: Simple object lookup at runtime

## Performance

- **Build time**: Minimal overhead (just HTML transformation)
- **Runtime**: Object property access (extremely fast)
- **Server**: Dynamic generation takes < 1ms per request
- **Network**: env.js is typically < 1KB gzipped

## Next Steps

- [Virtual Modules](./virtual-modules.md) — Learn about the two virtual modules
- [Configuration](../configuration/plugin-options.md) — Customize the behavior