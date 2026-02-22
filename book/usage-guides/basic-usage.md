# Basic Usage

Practical guide for using vite-plugin-production-server in your applications.

## Reading Environment Variables

### Using virtual:import-meta-env

The simplest way to access environment variables:

```typescript
import env from 'virtual:import-meta-env';

// Access any variable
const apiUrl = env.VITE_API_URL;
const appName = env.VITE_APP_NAME;

// Use in your code
fetch(`${apiUrl}/users`);
document.title = appName;
```

### Using virtual:runtime-env

More control with helper functions:

```typescript
import { env, envOrThrow, getEnv } from 'virtual:runtime-env';

// Safe access (returns undefined if not set)
const apiUrl = env('VITE_API_URL');

if (apiUrl) {
  fetch(`${apiUrl}/users`);
} else {
  console.warn('VITE_API_URL not set');
}

// Strict access (throws if not set)
try {
  const requiredKey = envOrThrow('VITE_REQUIRED_KEY');
} catch (error) {
  console.error('Missing required environment variable');
  // Handle error gracefully
}

// Get all environment variables
const allEnv = getEnv();
console.log(allEnv);
```

## Configuration Patterns

### Centralized Config Module

Create a single source of truth for environment configuration:

```typescript
// config/index.ts
import { envOrThrow, env } from 'virtual:runtime-env';

export const config = {
  api: {
    url: envOrThrow('VITE_API_URL'),
    timeout: parseInt(env('VITE_API_TIMEOUT') || '5000', 10),
  },
  app: {
    name: env('VITE_APP_NAME') || 'My App',
    version: env('VITE_APP_VERSION') || '1.0.0',
  },
  features: {
    newDashboard: env('VITE_FEATURE_DASHBOARD') === 'true',
    betaAccess: env('VITE_BETA_ACCESS') === 'true',
  },
} as const;

// Usage
import { config } from './config';

fetch(`${config.api.url}/users`, {
  signal: AbortSignal.timeout(config.api.timeout)
});
```

### Validation on Startup

Fail fast if required variables are missing:

```typescript
// utils/validateEnv.ts
import { envOrThrow } from 'virtual:runtime-env';

const requiredVars = [
  'VITE_API_URL',
  'VITE_APP_NAME',
] as const;

export function validateEnv(): void {
  const missing: string[] = [];
  
  for (const key of requiredVars) {
    try {
      envOrThrow(key);
    } catch {
      missing.push(key);
    }
  }
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}

// main.ts
import { validateEnv } from './utils/validateEnv';

validateEnv(); // Throws if anything is missing
```

## Common Use Cases

### API Base URL

```typescript
import env from 'virtual:import-meta-env';

const API_BASE = env.VITE_API_URL;

async function fetchUsers() {
  const response = await fetch(`${API_BASE}/users`);
  return response.json();
}
```

### Feature Flags

```typescript
import { env } from 'virtual:runtime-env';

const features = {
  newDashboard: env('VITE_FEATURE_DASHBOARD') === 'true',
  darkMode: env('VITE_DARK_MODE') === 'true',
  analytics: env('VITE_ANALYTICS') !== 'false', // Default true
};

// Usage
if (features.newDashboard) {
  renderNewDashboard();
} else {
  renderOldDashboard();
}
```

### Multi-Flag Configuration

```typescript
import { env } from 'virtual:runtime-env';

// Parse comma-separated flags
const enabledFeatures = (env('VITE_FEATURES') || '')
  .split(',')
  .map(f => f.trim())
  .filter(Boolean);

const isFeatureEnabled = (feature: string) => 
  enabledFeatures.includes(feature);

// Usage
if (isFeatureEnabled('beta-ui')) {
  showBetaUI();
}
```

### Public Keys

```typescript
import env from 'virtual:import-meta-env';

// Stripe
const stripe = await loadStripe(env.VITE_STRIPE_PUBLIC_KEY);

// Firebase
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
};

// Google Maps
const mapsLoader = new Loader({
  apiKey: env.VITE_MAPS_API_KEY,
});
```

### Environment-Specific Behavior

```typescript
import env from 'virtual:import-meta-env';

if (env.DEV) {
  // Development-only code
  console.log('Debug mode enabled');
  enableReactDevTools();
}

if (env.PROD) {
  // Production-only code
  initializeAnalytics();
  enableErrorTracking();
}

// Mode-specific logic
switch (env.MODE) {
  case 'development':
    return devConfig;
  case 'staging':
    return stagingConfig;
  case 'production':
    return prodConfig;
  default:
    return defaultConfig;
}
```

### Dynamic Refresh (Advanced)

```typescript
import { getEnv, refreshEnv } from 'virtual:runtime-env';

// Refresh environment on window focus (if env.js was updated)
window.addEventListener('focus', () => {
  refreshEnv();
  const newEnv = getEnv();
  console.log('Environment refreshed:', newEnv);
});

// Or poll periodically (not recommended for production)
setInterval(() => {
  refreshEnv();
}, 60000); // Every minute
```

## Type Safety

### With TypeScript

```typescript
// src/vite-env.d.ts
/// <reference types="vite-plugin-production-server/env" />

interface ImportMetaEnvLike {
  readonly VITE_API_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_FEATURE_FLAGS?: string;
}
```

```typescript
// Now TypeScript knows about your variables
import env from 'virtual:import-meta-env';

const apiUrl: string = env.VITE_API_URL; // ✅ Typed
const flags: string | undefined = env.VITE_FEATURE_FLAGS; // ✅ Optional
```

### Runtime Validation

```typescript
import { envOrThrow } from 'virtual:runtime-env';

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

const apiUrl = envOrThrow('VITE_API_URL');
if (!isValidUrl(apiUrl)) {
  throw new Error(`Invalid VITE_API_URL: ${apiUrl}`);
}
```

## Best Practices

### 1. Use a Config Module

```typescript
// Don't access env vars directly in components
// ❌ Bad
const api = import('../virtual:import-meta-env');

// ✅ Good
import { config } from './config';
const api = config.api.url;
```

### 2. Provide Defaults

```typescript
import { env } from 'virtual:runtime-env';

const TIMEOUT = parseInt(env('VITE_TIMEOUT') || '5000', 10);
const RETRIES = parseInt(env('VITE_RETRIES') || '3', 10);
```

### 3. Validate Required Variables

```typescript
import { envOrThrow } from 'virtual:runtime-env';

// App fails fast if config is wrong
export const API_URL = envOrThrow('VITE_API_URL');
```

### 4. Document Expected Variables

```markdown
## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| VITE_API_URL | Yes | API base URL |
| VITE_APP_NAME | No | App name (default: "My App") |
| VITE_FEATURES | No | Comma-separated feature flags |
```

## Troubleshooting

### Variable is undefined

1. Check the prefix matches your configuration (default: `VITE_`)
2. Verify the variable is set in the server environment
3. Check browser DevTools → Network → env.js response
4. Try `console.log(window.__ENV__)` in DevTools

### TypeScript errors

1. Add reference directive: `/// <reference types="vite-plugin-production-server/env" />`
2. Extend `ImportMetaEnvLike` interface for custom variables
3. Restart TypeScript server in your editor

### Not working in production

1. Ensure you're using the production server (`vite-production-server`)
2. Check that environment variables are exported/set when starting the server
3. Verify the `/env.js` endpoint is being served

## Next Steps

- [Migration from import.meta.env](./migration.md) — Upgrade existing Vite apps
- [Examples](../examples/basic-spa.md) — Complete working example