# Common Issues

Solutions to common problems when using vite-plugin-production-server.

## Environment Variables Not Working

### Problem
Environment variables are undefined or not appearing in the app.

### Solutions

#### 1. Check the /env.js endpoint

```bash
# In browser DevTools Console, check:
console.log(window.__ENV__);

# Or use curl:
curl http://localhost:4173/env.js
```

If `window.__ENV__` is undefined, the script isn't loading.

#### 2. Verify Script Injection

Check your `index.html` in the `dist/` folder:

```html
<head>
  <script src="/env.js"></script>  <!-- Should be present -->
  <!-- ... -->
</head>
```

If missing, check plugin configuration:

```typescript
productionServer({
  injectEnvScript: true,  // Should be true (default)
  envJsPath: '/env.js'    // Should match
})
```

#### 3. Check Variable Prefix

```typescript
// vite.config.ts
productionServer({
  envPrefix: 'VITE_'  // Only VITE_* vars are exposed
})
```

Verify your variables match the prefix:

```bash
# Correct
VITE_API_URL=https://api.example.com

# Wrong (won't be exposed)
API_URL=https://api.example.com
```

#### 4. Verify Server Environment

```bash
# Check if variables are set in server environment
docker exec my-app env | grep VITE_

# Or on host
env | grep VITE_
```

## TypeScript Errors

### Problem
TypeScript cannot find module 'virtual:import-meta-env'.

### Solution

Add type reference to your `vite-env.d.ts`:

```typescript
/// <reference types="vite-plugin-production-server/env" />
```

Or add to `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["vite-plugin-production-server/env"]
  }
}
```

### Problem
Property 'VITE_X' does not exist on type 'ImportMetaEnvLike'.

### Solution

Extend the interface in your type declarations:

```typescript
// src/vite-env.d.ts
interface ImportMetaEnvLike {
  VITE_X: string;
  VITE_Y?: string;  // Optional
}
```

## Build Errors

### Problem
Build fails with "Cannot find module 'virtual:import-meta-env'".

### Solution

This is expected during build - virtual modules are resolved by the plugin. Ensure:

1. Plugin is configured in `vite.config.ts`
2. Using `vite build` (not raw TypeScript compiler)

```typescript
// vite.config.ts
import productionServer from 'vite-plugin-production-server';

export default {
  plugins: [productionServer()]
};
```

### Problem
"dist" folder doesn't contain env.js.

### Solution

`env.js` is generated dynamically at runtime, not build time. It's served by the production server.

```bash
# Don't look for env.js in dist/
ls dist/env.js  # Won't exist

# It will be served at runtime
curl http://localhost:4173/env.js  # Works!
```

## Server Issues

### Problem
"Port already in use" error.

### Solution

```bash
# Use a different port
vite-production-server dist --port 3000

# Or kill existing process
lsof -ti:4173 | xargs kill -9
```

### Problem
Server starts but app doesn't load.

### Solution

1. Check dist folder exists and has files:
   ```bash
   ls dist/
   ```

2. Verify SPA fallback is enabled:
   ```typescript
   productionServer({
     spaFallback: true  // Default
   })
   ```

3. Check browser console for 404 errors

### Problem
Permission denied (port 80).

### Solution

Ports below 1024 require root/admin privileges:

```bash
# Option 1: Use higher port
vite-production-server dist --port 8080

# Option 2: Use sudo (not recommended)
sudo vite-production-server dist --port 80

# Option 3: Use reverse proxy (recommended)
# nginx/caddy on port 80 -> proxy to 4173
```

## Development Issues

### Problem
Works in dev, not in production.

### Solution

1. Ensure you're using the production server:
   ```bash
   # Dev - uses Vite dev server
   vite dev
   
   # Production - must use vite-production-server
   vite build
   vite-production-server dist
   ```

2. Check environment variables are set when starting production server:
   ```bash
   VITE_API_URL=https://api.com vite-production-server dist
   ```

### Problem
Hot reload not working in dev.

### Solution

The plugin doesn't affect Vite's HMR. Check:

1. Vite config is correct
2. No errors in terminal
3. Browser WebSocket connection (required for HMR)

## Docker Issues

### Problem
Environment variables not working in Docker.

### Solution

1. Verify variables are passed at runtime, not build time:
   ```dockerfile
   # ❌ Wrong - at build time
   ARG VITE_API_URL
   RUN npm run build
   
   # ✅ Correct - at runtime
   CMD ["vite-production-server", "dist"]
   ```

2. Check docker-compose.yml:
   ```yaml
   services:
     app:
       environment:
         - VITE_API_URL=https://api.com  # ✅
   ```

3. Verify in container:
   ```bash
   docker exec my-app env | grep VITE
   ```

### Problem
Docker build fails.

### Solution

Check .dockerignore isn't excluding needed files:

```
# .dockerignore
node_modules
dist  # ❌ Don't exclude if copying pre-built dist
```

If building in Docker:
```dockerfile
# Don't copy dist, build it
COPY . .
RUN npm run build
```

## Security Concerns

### Problem
Worried about exposing sensitive data.

### Solution

1. **Use prefix filtering** (default: VITE_)
2. **Add custom filter**:
   ```typescript
   productionServer({
     expose: (key) => {
       // Block sensitive patterns
       if (key.includes('SECRET') || key.includes('PASSWORD')) {
         return false;
       }
       return key.startsWith('VITE_');
     }
   })
   ```

3. **Audit exposed variables**:
   ```bash
   curl http://localhost:4173/env.js
   ```

### Problem
Need to revoke exposed credentials.

### Solution

1. Immediately revoke the exposed credential
2. Rotate keys/passwords
3. Update environment variables
4. Restart the server

## Performance Issues

### Problem
Slow response times.

### Solution

1. Check cache headers:
   ```typescript
   productionServer({
     cacheControl: {
       html: 'no-cache',
       assets: 'public, max-age=31536000'
     }
   })
   ```

2. Enable gzip/brotli in reverse proxy (nginx/caddy)

3. Use CDN for static assets

## Still Having Issues?

1. **Check the debug guide** — Enable verbose logging
2. **Review examples** — Compare with working examples
3. **Search issues** — Check GitHub issues for similar problems
4. **Create minimal reproduction** — Strip down to simplest case

## Debug Checklist

- [ ] Plugin added to vite.config.ts
- [ ] Environment variables use correct prefix
- [ ] Variables exported in server environment
- [ ] `/env.js` endpoint accessible
- [ ] `window.__ENV__` populated
- [ ] TypeScript types configured
- [ ] Production server used (not just `vite preview`)
- [ ] Correct port and host settings

## Next Steps

- [FAQ](./faq.md) — Frequently asked questions
- [Examples](../examples/basic-spa.md) — Working examples