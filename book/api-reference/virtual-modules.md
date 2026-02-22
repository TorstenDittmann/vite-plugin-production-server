# Virtual Modules

Complete API reference for the virtual modules provided by vite-plugin-production-server.

## virtual:import-meta-env

A virtual module that exports an object compatible with Vite's `import.meta.env`.

### Import

```typescript
import env from 'virtual:import-meta-env';
```

### Type

```typescript
interface ImportMetaEnvLike {
  MODE: string;
  BASE_URL: string;
  DEV: boolean;
  PROD: boolean;
  SSR: boolean;
  [key: string]: any;
}

type EnvModule = ImportMetaEnvLike;
```

### Properties

#### MODE

**Type:** `string`

The current mode. Either `'production'` or `'development'`.

```typescript
const mode = env.MODE;
// 'production' or 'development'
```

#### BASE_URL

**Type:** `string`

The base URL the app is being served from.

```typescript
const base = env.BASE_URL;
// '/' or '/app/' etc.
```

#### DEV

**Type:** `boolean`

`true` if in development mode.

```typescript
if (env.DEV) {
  console.log('Running in development');
}
```

#### PROD

**Type:** `boolean`

`true` if in production mode.

```typescript
if (env.PROD) {
  initializeAnalytics();
}
```

#### SSR

**Type:** `boolean`

`true` if running on the server (Server-Side Rendering).

```typescript
if (!env.SSR) {
  // Client-side only code
  window.addEventListener('resize', handler);
}
```

#### Dynamic Properties

Any environment variables matching your configured prefix are also available:

```typescript
// With envPrefix: 'VITE_'
const apiUrl = env.VITE_API_URL;
const appName = env.VITE_APP_NAME;
```

### Usage Examples

#### Basic Access

```typescript
import env from 'virtual:import-meta-env';

// Read environment variables
const apiUrl = env.VITE_API_URL;
const appName = env.VITE_APP_NAME;

// Use meta flags
if (env.DEV) {
  enableDevTools();
}
```

#### With TypeScript

```typescript
import env from 'virtual:import-meta-env';

// TypeScript knows about these properties
const apiUrl: string = env.VITE_API_URL;
const mode: string = env.MODE;
const isDev: boolean = env.DEV;

// Custom properties need type assertion
const customValue = env.VITE_CUSTOM as string;
```

#### Conditional Logic

```typescript
import env from 'virtual:import-meta-env';

switch (env.MODE) {
  case 'development':
    return devConfig;
  case 'staging':
    return stagingConfig;
  case 'production':
    return prodConfig;
}
```

## virtual:runtime-env

A virtual module providing helper functions for environment variable access.

### Import

```typescript
import { 
  getEnv, 
  env, 
  envOrThrow, 
  refreshEnv 
} from 'virtual:runtime-env';
```

### Functions

#### getEnv()

Returns the entire environment object.

**Signature:**

```typescript
function getEnv(): ImportMetaEnvLike;
```

**Returns:** `ImportMetaEnvLike` — The complete environment object

**Example:**

```typescript
import { getEnv } from 'virtual:runtime-env';

const allEnv = getEnv();
console.log(allEnv);
// {
//   MODE: 'production',
//   BASE_URL: '/',
//   DEV: false,
//   PROD: true,
//   SSR: false,
//   VITE_API_URL: 'https://api.example.com'
// }
```

#### env(key)

Safely retrieves an environment variable. Returns `undefined` if not found.

**Signature:**

```typescript
function env(key: string): string | undefined;
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `key` | `string` | The environment variable name |

**Returns:** `string | undefined`

**Example:**

```typescript
import { env } from 'virtual:runtime-env';

// Safe access
const apiUrl = env('VITE_API_URL');
// Type: string | undefined

// With fallback
const timeout = env('VITE_TIMEOUT') || '5000';

// Conditional usage
if (apiUrl) {
  fetch(`${apiUrl}/users`);
}
```

#### envOrThrow(key)

Strictly retrieves an environment variable. Throws if not found.

**Signature:**

```typescript
function envOrThrow(key: string): string;
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `key` | `string` | The environment variable name |

**Returns:** `string`

**Throws:** `Error` if the variable is not found

**Example:**

```typescript
import { envOrThrow } from 'virtual:runtime-env';

try {
  const apiUrl = envOrThrow('VITE_API_URL');
  // Type: string (guaranteed to exist)
  fetch(`${apiUrl}/users`);
} catch (error) {
  console.error('Required environment variable missing:', error.message);
  // Handle gracefully
}
```

#### refreshEnv()

Refreshes the local environment cache from `window.__ENV__`.

**Signature:**

```typescript
function refreshEnv(): void;
```

**Example:**

```typescript
import { getEnv, refreshEnv } from 'virtual:runtime-env';

// Initial value
console.log(getEnv().VITE_FEATURE_FLAG);

// Some external process updates window.__ENV__

// Refresh to get new values
refreshEnv();
console.log(getEnv().VITE_FEATURE_FLAG); // Updated value
```

## Comparison

### Access Patterns

```typescript
import env from 'virtual:import-meta-env';
import { env as getEnv, envOrThrow } from 'virtual:runtime-env';

// Property access (may be undefined)
const value1 = env.VITE_VAR;

// Safe function call (returns undefined)
const value2 = getEnv('VITE_VAR');

// Strict function call (throws if missing)
const value3 = envOrThrow('VITE_VAR');
```

### When to Use Each

| Use Case | `virtual:import-meta-env` | `virtual:runtime-env` |
|----------|---------------------------|----------------------|
| Simple replacement for `import.meta.env` | ✅ | ❌ |
| Strict validation required | ❌ | ✅ |
| Dynamic key access | ❌ | ✅ |
| Type safety | ✅* | ✅* |
| Library compatibility | ✅ | ❌ |
| Refresh support | ❌ | ✅ |

\* TypeScript support available for both

## Type Definitions

### Complete TypeScript Types

```typescript
// virtual:import-meta-env
interface ImportMetaEnvLike {
  MODE: string;
  BASE_URL: string;
  DEV: boolean;
  PROD: boolean;
  SSR: boolean;
  [key: string]: any;
}

declare module 'virtual:import-meta-env' {
  const env: ImportMetaEnvLike;
  export default env;
}

// virtual:runtime-env
declare module 'virtual:runtime-env' {
  export function getEnv(): ImportMetaEnvLike;
  export function env(key: string): string | undefined;
  export function envOrThrow(key: string): string;
  export function refreshEnv(): void;
}
```

## Error Handling

### envOrThrow Errors

```typescript
import { envOrThrow } from 'virtual:runtime-env';

try {
  const value = envOrThrow('VITE_API_URL');
} catch (error) {
  if (error instanceof Error) {
    console.error(error.message);
    // "Missing env var: VITE_API_URL"
  }
}
```

### Safe Access with env()

```typescript
import { env } from 'virtual:runtime-env';

// No error, returns undefined if not set
const value = env('VITE_MAYBE_EXISTS');

// Always safe
const safeValue = value || 'default';
```

## Best Practices

### 1. Use TypeScript

```typescript
/// <reference types="vite-plugin-production-server/env" />

// Now you get type checking and autocompletion
const apiUrl = env.VITE_API_URL;
```

### 2. Centralize Environment Access

```typescript
// config/env.ts
import { envOrThrow, env } from 'virtual:runtime-env';

export const API_URL = envOrThrow('VITE_API_URL');
export const TIMEOUT = parseInt(env('VITE_TIMEOUT') || '5000', 10);
```

### 3. Validate on Startup

```typescript
// utils/validateEnv.ts
import { envOrThrow } from 'virtual:runtime-env';

export function validateEnv() {
  const required = ['VITE_API_URL', 'VITE_APP_NAME'];
  
  for (const key of required) {
    envOrThrow(key); // Throws if missing
  }
}

// main.ts
validateEnv();
```

## Next Steps

- [Server API](./server-api.md) — Server-side API reference
- [Basic Usage](../usage-guides/basic-usage.md) — Practical examples