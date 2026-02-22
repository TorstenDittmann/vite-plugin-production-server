# Plugin Options

Complete reference for configuring the vite-plugin-production-server Vite plugin.

## Basic Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import productionServer from 'vite-plugin-production-server';

export default defineConfig({
  plugins: [
    productionServer({
      // Your options here
    })
  ],
});
```

## Option Reference

### envPrefix

**Type:** `string | string[]`  
**Default:** `'VITE_'`

The prefix(es) used to filter environment variables. Only variables starting with these prefixes will be exposed.

```typescript
// Single prefix
productionServer({
  envPrefix: 'APP_'
})

// Multiple prefixes
productionServer({
  envPrefix: ['VITE_', 'PUBLIC_', 'APP_']
})
```

### envJsPath

**Type:** `string`  
**Default:** `'/env.js'`

The path where the environment JavaScript file will be served.

```typescript
productionServer({
  envJsPath: '/config/env.js'  // Served at /config/env.js
})
```

### configJsonPath

**Type:** `string | null`  
**Default:** `null`

Optional path for a JSON configuration endpoint. When set, the server will serve the environment as JSON at this path.

```typescript
productionServer({
  configJsonPath: '/api/config.json'
})

// Now available at: http://localhost:4173/api/config.json
```

### injectEnvScript

**Type:** `boolean`  
**Default:** `true`

Whether to automatically inject the `env.js` script tag into `index.html`.

```typescript
// Disable auto-injection (you must add the script manually)
productionServer({
  injectEnvScript: false
})
```

### injectPosition

**Type:** `'head-prepend' | 'head-append'`  
**Default:** `'head-prepend'`

Where to inject the script tag in the HTML.

```typescript
productionServer({
  injectPosition: 'head-prepend'  // First element in <head>
  // or
  injectPosition: 'head-append'   // Last element in <head>
})
```

### expose

**Type:** `(key: string, value: string | undefined) => boolean`  
**Default:** `undefined`

Custom function to filter which environment variables are exposed. This runs in addition to the prefix filter.

```typescript
productionServer({
  envPrefix: ['VITE_', 'PUBLIC_'],
  expose: (key, value) => {
    // Block anything with SECRET
    if (key.includes('SECRET')) return false;
    
    // Only allow specific variables
    const allowed = [
      'VITE_API_URL',
      'VITE_PUBLIC_KEY',
      'PUBLIC_ANALYTICS_KEY'
    ];
    
    return allowed.includes(key);
  }
})
```

### defaults

**Type:** `{ mode?: string; baseUrl?: string }`  
**Default:** `{ mode: 'production', baseUrl: '/' }`

Default values for `MODE` and `BASE_URL` meta flags when running the production server.

```typescript
productionServer({
  defaults: {
    mode: 'staging',
    baseUrl: '/app/'
  }
})
```

### includeMetaFlags

**Type:** `boolean`  
**Default:** `true`

Whether to include Vite-like meta flags (`MODE`, `BASE_URL`, `DEV`, `PROD`, `SSR`) in the environment object.

```typescript
// Disable meta flags (only your env vars)
productionServer({
  includeMetaFlags: false
})
```

### devMiddleware

**Type:** `boolean`  
**Default:** `true`

Whether to enable the development middleware that serves `env.js` during `vite dev`.

```typescript
// Disable dev middleware
productionServer({
  devMiddleware: false
})
```

### globalName

**Type:** `string`  
**Default:** `'__ENV__'`

The name of the global window property where environment variables are stored.

```typescript
productionServer({
  globalName: '__MY_APP_CONFIG__'
})

// Now accessed via window.__MY_APP_CONFIG__
```

## Complete Example

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import productionServer from 'vite-plugin-production-server';

export default defineConfig({
  plugins: [
    productionServer({
      // Filter configuration
      envPrefix: ['VITE_', 'PUBLIC_'],
      
      // Security - only allow specific variables
      expose: (key, value) => {
        // Block secrets
        if (key.includes('SECRET') || key.includes('PASSWORD')) {
          return false;
        }
        
        // Allow listed variables
        const allowed = [
          'VITE_API_URL',
          'VITE_PUBLIC_KEY',
          'VITE_FEATURE_FLAGS',
          'PUBLIC_MAPS_KEY'
        ];
        
        return allowed.includes(key);
      },
      
      // Paths
      envJsPath: '/config/env.js',
      configJsonPath: '/api/config.json',
      
      // Script injection
      injectEnvScript: true,
      injectPosition: 'head-prepend',
      
      // Meta flags
      defaults: {
        mode: 'production',
        baseUrl: '/'
      },
      includeMetaFlags: true,
      
      // Global name
      globalName: '__APP_ENV__',
      
      // Dev settings
      devMiddleware: true
    })
  ],
  
  // Ensure your base URL matches
  base: '/'
});
```

## Integration with Vite Config

The plugin automatically integrates with your Vite configuration:

```typescript
export default defineConfig({
  base: '/app/',  // Plugin uses this for BASE_URL
  mode: 'staging', // Plugin uses this for MODE
  
  plugins: [
    productionServer({
      // These are merged with Vite's config
      defaults: {
        mode: 'staging',  // Overrides Vite's mode
        baseUrl: '/app/'  // Uses Vite's base
      }
    })
  ]
});
```

## Environment Variable Files

The plugin doesn't automatically load `.env` files. Use Vite's built-in support:

```bash
# .env (loaded by Vite)
VITE_API_URL=https://api.example.com

# .env.local (local overrides, not committed)
VITE_API_URL=http://localhost:3000

# .env.production (production defaults)
VITE_API_URL=https://api.prod.com
```

## TypeScript Configuration

Add types for your custom environment variables:

```typescript
// src/vite-env.d.ts
/// <reference types="vite-plugin-production-server/env" />

interface ImportMetaEnvLike {
  readonly VITE_API_URL: string;
  readonly VITE_APP_NAME: string;
  readonly VITE_FEATURE_FLAGS?: string;
}
```

## Next Steps

- [CLI Reference](./cli-reference.md) — Command-line interface
- [Examples](../examples/basic-spa.md) — Complete working example