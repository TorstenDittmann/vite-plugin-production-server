# Migration from import.meta.env

Guide for migrating existing Vite applications from `import.meta.env` to vite-plugin-production-server.

## Why Migrate?

### Before: Build-Time Variables

```typescript
// These are baked into the bundle at build time
const apiUrl = import.meta.env.VITE_API_URL;
// Becomes: const apiUrl = "https://api.example.com";
```

**Problems:**
- Same build can't be used across environments
- Changing env vars requires rebuild
- Docker images aren't portable

### After: Runtime Variables

```typescript
import env from 'virtual:import-meta-env';
const apiUrl = env.VITE_API_URL;
// Reads from window.__ENV__ at runtime
```

**Benefits:**
- One build, any environment
- Change env vars → restart server → done
- True dev/prod parity

## Migration Steps

### Step 1: Install the Package

```bash
npm install vite-plugin-production-server
```

### Step 2: Add the Vite Plugin

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import productionServer from 'vite-plugin-production-server';

export default defineConfig({
  plugins: [
    productionServer()
    // ... other plugins
  ],
});
```

### Step 3: Add TypeScript Types

Update `src/vite-env.d.ts`:

```typescript
/// <reference types="vite/client" />
/// <reference types="vite-plugin-production-server/env" />

// Your existing env types
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_APP_NAME: string;
  // ... other vars
}
```

### Step 4: Replace import.meta.env Usage

Find and replace `import.meta.env` with the virtual module:

#### Before:

```typescript
// src/api/client.ts
const API_BASE = import.meta.env.VITE_API_URL;
const TIMEOUT = parseInt(import.meta.env.VITE_TIMEOUT || '5000');

// src/config.ts
export const config = {
  apiUrl: import.meta.env.VITE_API_URL,
  mode: import.meta.env.MODE,
  isDev: import.meta.env.DEV,
};
```

#### After:

```typescript
// src/api/client.ts
import env from 'virtual:import-meta-env';

const API_BASE = env.VITE_API_URL;
const TIMEOUT = parseInt(env.VITE_TIMEOUT || '5000');

// src/config.ts
import env from 'virtual:import-meta-env';

export const config = {
  apiUrl: env.VITE_API_URL,
  mode: env.MODE,
  isDev: env.DEV,
};
```

### Step 5: Update Build Scripts

Update your `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "serve": "vite-production-server dist"
  }
}
```

### Step 6: Test Locally

```bash
# Build the app
npm run build

# Start with runtime environment
VITE_API_URL=https://api.example.com npm run serve
```

## Migration Patterns

### Pattern 1: Direct Replacement (Simple)

For small apps, do a global find/replace:

```typescript
// Find: import\.meta\.env
// Replace: env

// Then add import at top of files
import env from 'virtual:import-meta-env';
```

### Pattern 2: Config Module (Recommended)

Centralize all environment access:

```typescript
// config/env.ts
import env from 'virtual:import-meta-env';

export const API_URL = env.VITE_API_URL;
export const APP_NAME = env.VITE_APP_NAME || 'My App';
export const IS_DEV = env.DEV;

// Usage
import { API_URL } from './config/env';
```

### Pattern 3: Gradual Migration

Migrate file by file:

```typescript
// utils/env.ts
import env from 'virtual:import-meta-env';

// Re-export with the same API as import.meta.env
export const getEnv = () => env;

// src/components/OldComponent.tsx
// Keep using old pattern temporarily
const apiUrl = import.meta.env.VITE_API_URL;

// src/components/NewComponent.tsx
import { getEnv } from '../utils/env';
const env = getEnv();
const apiUrl = env.VITE_API_URL;
```

## Common Migration Issues

### Issue 1: Meta Properties (MODE, DEV, PROD, SSR)

These work the same way:

```typescript
// Before
const isDev = import.meta.env.DEV;
const mode = import.meta.env.MODE;

// After
import env from 'virtual:import-meta-env';
const isDev = env.DEV;
const mode = env.MODE;
```

### Issue 2: TypeScript Errors

If you see type errors, ensure:

1. Reference directive is in vite-env.d.ts:
   ```typescript
   /// <reference types="vite-plugin-production-server/env" />
   ```

2. Extend `ImportMetaEnvLike`:
   ```typescript
   interface ImportMetaEnvLike {
     VITE_YOUR_VAR: string;
   }
   ```

3. Restart TypeScript server in your editor

### Issue 3: Testing

Update your test setup:

```typescript
// vitest.setup.ts or jest.setup.ts
// Mock the virtual module
vi.mock('virtual:import-meta-env', () => ({
  default: {
    VITE_API_URL: 'http://localhost:3000',
    VITE_APP_NAME: 'Test App',
    MODE: 'test',
    DEV: true,
    PROD: false,
    SSR: false,
  }
}));
```

### Issue 4: ESLint/Prettier

Add to your `.eslintrc`:

```json
{
  "settings": {
    "import/ignore": ["virtual:"]
  }
}
```

## Testing Your Migration

### 1. Build the Application

```bash
vite build
```

### 2. Test with Different Configs

```bash
# Test config 1
VITE_API_URL=https://api1.example.com \
VITE_APP_NAME="App 1" \
vite-production-server dist

# Test config 2 (same build!)
VITE_API_URL=https://api2.example.com \
VITE_APP_NAME="App 2" \
vite-production-server dist --port 3001
```

### 3. Verify in Browser

1. Open DevTools
2. Check Network tab for `/env.js`
3. Verify `window.__ENV__` has correct values
4. Test your application functionality

## Deployment Updates

### Docker

Update your Dockerfile:

```dockerfile
# Before
ENV VITE_API_URL=https://api.example.com
RUN npm run build
CMD ["npx", "serve", "dist"]

# After
RUN npm run build
CMD ["npx", "vite-production-server", "dist"]
# VITE_API_URL passed at runtime, not build time
```

### Environment Files

Keep `.env` for development but remember:

```bash
# .env (used by Vite dev server)
VITE_API_URL=http://localhost:3000

# Production variables (passed at runtime)
# NOT in .env file, set when starting server
VITE_API_URL=https://api.example.com vite-production-server dist
```

### CI/CD

Update your deployment pipeline:

```yaml
# Before
- name: Build
  run: |
    export VITE_API_URL=${{ secrets.API_URL }}
    npm run build
- name: Deploy
  run: deploy dist/

# After
- name: Build
  run: npm run build
- name: Deploy
  run: |
    export VITE_API_URL=${{ secrets.API_URL }}
    deploy-with-server dist/
```

## Rollback Plan

If you need to rollback:

1. Revert vite.config.ts changes
2. Remove plugin import
3. Revert all `virtual:import-meta-env` imports back to `import.meta.env`
4. Update package.json scripts

## Verification Checklist

- [ ] All `import.meta.env` replaced with virtual module
- [ ] TypeScript types working correctly
- [ ] Build succeeds without errors
- [ ] Server starts with runtime environment
- [ ] Environment variables change without rebuild
- [ ] Tests pass with mocked virtual module
- [ ] Production deployment updated
- [ ] Documentation updated

## Next Steps

- [Examples](../examples/basic-spa.md) — Complete working example
- [Basic Usage](./basic-usage.md) — Usage patterns and best practices