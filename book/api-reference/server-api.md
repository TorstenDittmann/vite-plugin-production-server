# Server API

Complete API reference for programmatically controlling the production server.

## startProductionServer()

Starts the production server with the specified options.

### Import

```typescript
import { startProductionServer } from 'vite-plugin-production-server';
```

### Signature

```typescript
async function startProductionServer(
  options?: ProductionServerOptions
): Promise<{
  close(): Promise<void>;
}>;
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `options` | `ProductionServerOptions` | Server configuration options |

### Returns

Returns a Promise that resolves to a server instance with a `close()` method.

### Basic Usage

```typescript
import { startProductionServer } from 'vite-plugin-production-server';

const server = await startProductionServer({
  distDir: 'dist',
  port: 3000,
  host: '0.0.0.0'
});

console.log('Server running');

// Later, graceful shutdown
await server.close();
```

## ProductionServerOptions

Configuration options for the production server.

### distDir

**Type:** `string`  
**Default:** `'dist'`

Directory containing the built application files.

```typescript
await startProductionServer({
  distDir: './build'
});
```

### port

**Type:** `number`  
**Default:** `4173`

Port number to listen on.

```typescript
await startProductionServer({
  port: 3000
});
```

### host

**Type:** `string`  
**Default:** `'0.0.0.0'`

Host to bind to. Use `'127.0.0.1'` for local-only access.

```typescript
await startProductionServer({
  host: '127.0.0.1'
});
```

### base

**Type:** `string`  
**Default:** `'/'`

Base URL path for the application.

```typescript
await startProductionServer({
  base: '/app/'
});
```

### spaFallback

**Type:** `boolean`  
**Default:** `true`

Enable SPA fallback to `index.html` for client-side routing.

```typescript
await startProductionServer({
  spaFallback: false  // Disable for API-only servers
});
```

### envPrefix

**Type:** `string | string[]`  
**Default:** `['VITE_']`

Prefix(es) for filtering environment variables.

```typescript
// Single prefix
await startProductionServer({
  envPrefix: 'APP_'
});

// Multiple prefixes
await startProductionServer({
  envPrefix: ['VITE_', 'PUBLIC_']
});
```

### envJsPath

**Type:** `string`  
**Default:** `'/env.js'`

Path for the environment JavaScript endpoint.

```typescript
await startProductionServer({
  envJsPath: '/config/env.js'
});
```

### configJsonPath

**Type:** `string | null`  
**Default:** `null`

Optional path for the JSON configuration endpoint.

```typescript
await startProductionServer({
  configJsonPath: '/api/config.json'
});
```

### globalName

**Type:** `string`  
**Default:** `'__ENV__'`

Name of the global window property.

```typescript
await startProductionServer({
  globalName: '__MY_APP_CONFIG__'
});
```

### headers

**Type:** `Record<string, string> | ((path: string) => Record<string, string>)`  
**Default:** `undefined`

Custom headers to add to all responses.

```typescript
// Static headers
await startProductionServer({
  headers: {
    'X-Custom-Header': 'value'
  }
});

// Dynamic headers
await startProductionServer({
  headers: (path) => ({
    'X-Path': path
  })
});
```

### cacheControl

**Type:** `object`  
**Default:** See below

Cache-Control header values.

```typescript
await startProductionServer({
  cacheControl: {
    html: 'no-cache, no-store',
    assets: 'public, max-age=31536000',
    other: 'public, max-age=0'
  }
});
```

**Defaults:**
- `html`: `'no-cache, no-store'`
- `assets`: `'public, max-age=31536000, immutable'`
- `other`: `'public, max-age=0'`

### log

**Type:** `boolean`  
**Default:** `true`

Enable request logging.

```typescript
await startProductionServer({
  log: false  // Disable for tests
});
```

### expose

**Type:** `(key: string, value: string | undefined) => boolean`  
**Default:** `undefined`

Custom filter function for environment variables.

```typescript
await startProductionServer({
  expose: (key, value) => {
    // Block secrets
    if (key.includes('SECRET')) return false;
    
    // Allow only whitelisted
    return ['VITE_API_URL', 'VITE_PUBLIC_KEY'].includes(key);
  }
});
```

### defaults

**Type:** `{ mode?: string; baseUrl?: string }`  
**Default:** `{ mode: 'production', baseUrl: '/' }`

Default values for MODE and BASE_URL.

```typescript
await startProductionServer({
  defaults: {
    mode: 'staging',
    baseUrl: '/app/'
  }
});
```

### includeMetaFlags

**Type:** `boolean`  
**Default:** `true`

Include Vite-like meta flags.

```typescript
await startProductionServer({
  includeMetaFlags: false
});
```

## Server Instance

The object returned by `startProductionServer()`.

### close()

Gracefully shuts down the server.

**Signature:**

```typescript
close(): Promise<void>;
```

**Example:**

```typescript
const server = await startProductionServer({ port: 3000 });

// Graceful shutdown
process.on('SIGTERM', async () => {
  await server.close();
  process.exit(0);
});
```

## Complete Example

```typescript
import { startProductionServer } from 'vite-plugin-production-server';

async function main() {
  // Parse port from environment or use default
  const port = parseInt(process.env.PORT || '3000', 10);
  
  const server = await startProductionServer({
    distDir: 'dist',
    port,
    host: '0.0.0.0',
    
    // Environment configuration
    envPrefix: ['VITE_', 'PUBLIC_'],
    envJsPath: '/env.js',
    
    // Security headers
    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    },
    
    // Environment filtering
    expose: (key) => {
      const blocked = ['SECRET', 'PASSWORD', 'PRIVATE'];
      return !blocked.some(p => key.toUpperCase().includes(p));
    },
    
    // Caching
    cacheControl: {
      html: 'no-cache, no-store, must-revalidate',
      assets: 'public, max-age=31536000, immutable',
      other: 'public, max-age=3600'
    },
    
    // Logging
    log: process.env.NODE_ENV !== 'test'
  });

  console.log(`Server listening on port ${port}`);

  // Graceful shutdown
  const shutdown = async () => {
    console.log('Shutting down...');
    await server.close();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch(console.error);
```

## Error Handling

### Port in Use

```typescript
try {
  const server = await startProductionServer({ port: 3000 });
} catch (error) {
  if (error.code === 'EADDRINUSE') {
    console.error('Port 3000 is already in use');
    process.exit(1);
  }
  throw error;
}
```

### Invalid Options

```typescript
// The function validates options and throws descriptive errors
try {
  const server = await startProductionServer({
    port: -1  // Invalid port
  });
} catch (error) {
  console.error('Invalid configuration:', error.message);
}
```

## Integration Examples

### With Express

```typescript
import express from 'express';
import { startProductionServer } from 'vite-plugin-production-server';

const app = express();

// API routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start both servers
app.listen(3000, () => {
  console.log('API server on port 3000');
});

const staticServer = await startProductionServer({
  distDir: 'dist',
  port: 3001
});

console.log('Static server on port 3001');
```

### In Tests

```typescript
import { startProductionServer } from 'vite-plugin-production-server';
import { describe, beforeAll, afterAll, test } from 'vitest';

let server: { close(): Promise<void> };

beforeAll(async () => {
  server = await startProductionServer({
    distDir: 'dist',
    port: 3333,
    log: false  // Disable logging in tests
  });
});

afterAll(async () => {
  await server.close();
});

test('app loads', async () => {
  const response = await fetch('http://localhost:3333');
  expect(response.status).toBe(200);
});
```

## Next Steps

- [Examples](../examples/basic-spa.md) — Working example