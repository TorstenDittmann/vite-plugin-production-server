# Virtual Modules

Virtual modules are the bridge between the runtime environment variables and your application code. vite-plugin-production-server provides two virtual modules with different use cases.

## What Are Virtual Modules?

Virtual modules are modules that don't exist as physical files on disk. Instead, they're generated at build time by the Vite plugin.

```typescript
// These imports don't point to real files
import env from 'virtual:import-meta-env';
import { env, envOrThrow } from 'virtual:runtime-env';
```

The plugin intercepts these imports and provides generated code on the fly.

## virtual:import-meta-env

A drop-in replacement for Vite's `import.meta.env` that reads from runtime environment variables.

### API

```typescript
import env from 'virtual:import-meta-env';

// Access environment variables
const apiUrl = env.VITE_API_URL;
const mode = env.MODE;

// Check feature flags
if (env.VITE_FEATURE_X === 'true') {
  enableFeatureX();
}
```

### Return Value

The module exports an object with the same shape as `import.meta.env`:

```typescript
interface ImportMetaEnvLike {
  MODE: string;        // 'production' | 'development'
  BASE_URL: string;    // Base URL
  DEV: boolean;        // true in development
  PROD: boolean;       // true in production
  SSR: boolean;        // Server-side rendering
  [key: string]: any;  // Your VITE_* variables
}
```

### Use Cases

- **Drop-in replacement** for `import.meta.env`
- **Library compatibility** — Pass to libraries expecting Vite-style env
- **Simple access** — When you just need to read values

### Example: Library Integration

```typescript
import env from 'virtual:import-meta-env';

// Pass to libraries expecting import.meta.env
import { initSentry } from '@sentry/browser';
initSentry({
  dsn: env.VITE_SENTRY_DSN,
  environment: env.MODE,
});

// Analytics
import { initAnalytics } from './analytics';
initAnalytics({
  apiKey: env.VITE_ANALYTICS_KEY,
  debug: env.DEV,
});
```

## virtual:runtime-env

Helper functions for more controlled environment variable access.

### API

```typescript
import { 
  getEnv,      // Returns entire env object
  env,         // Safe getter
  envOrThrow,  // Strict getter (throws if missing)
  refreshEnv,  // Refresh from window global
} from 'virtual:runtime-env';
```

### getEnv()

Returns the entire environment object:

```typescript
import { getEnv } from 'virtual:runtime-env';

const allEnv = getEnv();
console.log(allEnv.VITE_API_URL);
console.log(allEnv.MODE);
```

### env(key)

Safe getter that returns `undefined` if the key doesn't exist:

```typescript
import { env } from 'virtual:runtime-env';

const apiUrl = env('VITE_API_URL');
// Type: string | undefined

// Safe usage
if (apiUrl) {
  fetch(`${apiUrl}/users`);
}

// With fallback
const timeout = env('VITE_TIMEOUT') || '5000';
```

### envOrThrow(key)

Strict getter that throws if the key is missing:

```typescript
import { envOrThrow } from 'virtual:runtime-env';

try {
  const apiUrl = envOrThrow('VITE_API_URL');
  // Type: string (guaranteed to exist)
  fetch(`${apiUrl}/users`);
} catch (error) {
  console.error('Missing required environment variable:', error.message);
  // Handle gracefully
}
```

### refreshEnv()

Refreshes the local cache from the global `window.__ENV__`:

```typescript
import { getEnv, refreshEnv } from 'virtual:runtime-env';

// Initial value
console.log(getEnv().VITE_FEATURE_FLAG);

// Some external process updates window.__ENV__
// (e.g., through hot reloading or external script)

// Refresh to get new values
refreshEnv();
console.log(getEnv().VITE_FEATURE_FLAG); // Updated value
```

### Use Cases

- **Strict validation** — Fail fast on missing required variables
- **Type safety** — Explicit control over undefined values
- **Dynamic updates** — Refresh values without page reload
- **Helper functions** — Build your own utilities on top

### Example: Configuration Builder

```typescript
// config.ts
import { envOrThrow, env } from 'virtual:runtime-env';

export const config = {
  api: {
    url: envOrThrow('VITE_API_URL'),
    timeout: parseInt(env('VITE_API_TIMEOUT') || '5000', 10),
  },
  features: {
    newDashboard: env('VITE_FEATURE_DASHBOARD') === 'true',
    betaAccess: env('VITE_BETA_ACCESS') === 'true',
  },
  app: {
    name: env('VITE_APP_NAME') || 'My App',
    version: env('VITE_APP_VERSION') || '1.0.0',
  },
} as const;

// main.ts
import { config } from './config';

console.log('API URL:', config.api.url);  // Guaranteed to exist
console.log('Timeout:', config.api.timeout);
```

## Comparison

| Feature | `virtual:import-meta-env` | `virtual:runtime-env` |
|---------|---------------------------|----------------------|
| API | Object properties | Function calls |
| Missing keys | Returns `undefined` | `env()` returns `undefined`, `envOrThrow()` throws |
| Use case | Simple replacement | Controlled access |
| Library compat | ✅ Perfect | ❌ Different shape |
| Validation | ❌ None | ✅ `envOrThrow()` |
| Refresh support | ❌ No | ✅ `refreshEnv()` |

## When to Use Which

### Use `virtual:import-meta-env` when:

- You're replacing existing `import.meta.env` usage
- Passing env to libraries expecting Vite-style objects
- You want the simplest API
- You handle undefined values gracefully

### Use `virtual:runtime-env` when:

- You need strict validation (`envOrThrow`)
- You want explicit control over undefined handling
- You might need to refresh values dynamically
- Building abstractions or utilities on top

## Behind the Scenes

Both modules read from the same `window.__ENV__` global:

```javascript
// Generated code for virtual:import-meta-env
const store = window.__ENV__ || {};
export default new Proxy(store, {
  get(target, prop) { return target[prop]; }
});

// Generated code for virtual:runtime-env
let store = window.__ENV__ || {};
export const getEnv = () => store;
export const env = (key) => store[key];
export const envOrThrow = (key) => {
  if (!(key in store)) throw new Error(`Missing: ${key}`);
  return store[key];
};
export const refreshEnv = () => { store = window.__ENV__ || {}; };
```

## TypeScript Support

Both modules include type declarations. Add to your `vite-env.d.ts`:

```typescript
/// <reference types="vite-plugin-production-server/env" />
```

Or extend the types for your specific environment variables:

```typescript
// types/env.d.ts
declare module 'virtual:import-meta-env' {
  interface ImportMetaEnvLike {
    VITE_API_URL: string;
    VITE_APP_NAME: string;
    VITE_FEATURE_X?: string;
  }
  const env: ImportMetaEnvLike;
  export default env;
}

declare module 'virtual:runtime-env' {
  export function env(key: 'VITE_API_URL'): string | undefined;
  export function env(key: 'VITE_APP_NAME'): string | undefined;
  export function envOrThrow(key: 'VITE_API_URL'): string;
}
```

## Next Steps

- [Basic Usage](../usage-guides/basic-usage.md) — Practical examples
- [API Reference](../api-reference/virtual-modules.md) — Complete API docs