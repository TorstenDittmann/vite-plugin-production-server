# Security Model

Understanding the security model of vite-plugin-production-server is crucial for keeping your application safe. This document covers how the plugin handles environment variables, what gets exposed, and best practices.

## Core Security Principle

⚠️ **Critical**: All values exposed through vite-plugin-production-server are **public** and visible in the browser.

```javascript
// Anyone can open DevTools and see:
window.__ENV__
// → { VITE_API_URL: "...", VITE_PUBLIC_KEY: "..." }
```

## The Filtering Layer

The primary security mechanism is **prefix-based filtering** combined with optional custom logic.

### Default Behavior

By default, only variables starting with `VITE_` are exposed:

```javascript
// Server's environment
{
  VITE_API_URL: 'https://api.example.com',    // ✅ Exposed
  VITE_PUBLIC_KEY: 'pk_live_...',             // ✅ Exposed
  DATABASE_PASSWORD: 'super-secret',          // ❌ Hidden
  SECRET_KEY: 'dont-expose-this',             // ❌ Hidden
  AWS_SECRET_ACCESS_KEY: 'abc123',            // ❌ Hidden
}
```

### Custom Prefixes

You can use multiple prefixes for organization:

```typescript
// vite.config.ts
productionServer({
  envPrefix: ['VITE_', 'PUBLIC_']
})
```

Now both `VITE_*` and `PUBLIC_*` variables are exposed.

### Custom Filter Function

For complex scenarios, use the `expose` option:

```typescript
productionServer({
  envPrefix: ['VITE_', 'PUBLIC_'],
  expose: (key, value) => {
    // Block anything with "SECRET", "KEY", or "PASSWORD" 
    // (unless it's explicitly meant to be public)
    const blockedPatterns = ['SECRET', 'PRIVATE_KEY', 'PASSWORD'];
    if (blockedPatterns.some(p => key.includes(p))) {
      return false;
    }
    
    // Allow only if it matches a prefix
    return key.startsWith('VITE_') || key.startsWith('PUBLIC_');
  }
})
```

## What NOT to Expose

Never expose these types of values:

### ❌ API Secrets

```bash
# DON'T DO THIS
VITE_STRIPE_SECRET_KEY=sk_live_...  # ❌ Exposes secret key
VITE_API_SECRET=super-secret        # ❌ Exposes API secret
```

**Solution**: Use server-side API routes for secret operations.

### ❌ Database Credentials

```bash
# DON'T DO THIS
VITE_DATABASE_URL=postgres://user:password@host/db  # ❌
VITE_DB_PASSWORD=mypassword                       # ❌
```

**Solution**: Keep database connections server-side only.

### ❌ Private Keys

```bash
# DON'T DO THIS
VITE_JWT_PRIVATE_KEY=...    # ❌ Never expose private keys
VITE_SSH_KEY=...            # ❌ Never expose SSH keys
```

**Solution**: Use public keys only, keep private keys server-side.

### ❌ Internal Endpoints

```bash
# DON'T DO THIS (unless intentionally public)
VITE_INTERNAL_API=http://10.0.0.5:8080  # ❌ Exposes internal network
```

**Solution**: Use public-facing URLs or API gateway.

## What's Safe to Expose

### ✅ Public API URLs

```bash
VITE_API_URL=https://api.example.com        # ✅ Safe
VITE_GRAPHQL_ENDPOINT=https://gql.example.com  # ✅ Safe
```

### ✅ Public Keys

```bash
VITE_STRIPE_PUBLIC_KEY=pk_live_...          # ✅ Safe (public key)
VITE_FIREBASE_API_KEY=AIza...                # ✅ Safe (client API key)
VITE_MAPS_API_KEY=...                        # ✅ Safe (if restricted)
```

### ✅ Configuration Flags

```bash
VITE_FEATURE_DASHBOARD=true                  # ✅ Safe
VITE_ENABLE_ANALYTICS=true                   # ✅ Safe
VITE_APP_VERSION=1.2.3                       # ✅ Safe
```

### ✅ UI Configuration

```bash
VITE_THEME_PRIMARY_COLOR=#646cff             # ✅ Safe
VITE_MAX_UPLOAD_SIZE=10485760                # ✅ Safe
VITE_ITEMS_PER_PAGE=25                       # ✅ Safe
```

## Security Headers

The production server includes security headers by default:

```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
```

You can add custom headers:

```typescript
// vite.config.ts
productionServer({
  headers: {
    'Content-Security-Policy': "default-src 'self'",
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
  }
})

// Or as a function for dynamic headers
productionServer({
  headers: (path) => ({
    'Cache-Control': path.startsWith('/assets/') ? 'max-age=31536000' : 'no-cache'
  })
})
```

## Best Practices

### 1. Use Descriptive Prefixes

```bash
# Good - clearly indicates public nature
VITE_PUBLIC_STRIPE_KEY=pk_live_...
PUBLIC_MAPS_KEY=...

# Bad - ambiguous
STRIPE_KEY=...  # Is this public or secret?
```

### 2. Validate Required Variables

```typescript
// utils/env.ts
import { envOrThrow } from 'virtual:runtime-env';

// Fail fast on startup if critical vars are missing
export const API_URL = envOrThrow('VITE_API_URL');
export const APP_NAME = envOrThrow('VITE_APP_NAME');

// Optional with defaults
export const TIMEOUT = env('VITE_TIMEOUT') || '5000';
```

### 3. Audit Your Environment Variables

Run this in production to see what's exposed:

```javascript
// Add temporarily to your app
console.log('Exposed env vars:', Object.keys(window.__ENV__));
```

Or use the CLI:

```bash
# Start server and check env.js
curl http://localhost:4173/env.js
```

### 4. Use Environment-Specific Configs

```bash
# .env.production.example (commit this)
VITE_API_URL=https://api.example.com
VITE_ANALYTICS_KEY=
VITE_SENTRY_DSN=

# .env.local (never commit)
VITE_ANALYTICS_KEY=real-key
VITE_SENTRY_DSN=real-dsn
```

### 5. Implement the Principle of Least Privilege

Only expose what's necessary:

```typescript
// ❌ Too permissive
productionServer({
  envPrefix: ['VITE_', 'APP_', 'CONFIG_']  // Too broad
})

// ✅ Minimal and explicit
productionServer({
  envPrefix: ['VITE_'],
  expose: (key) => {
    const allowed = [
      'VITE_API_URL',
      'VITE_PUBLIC_KEY',
      'VITE_FEATURE_FLAGS'
    ];
    return allowed.includes(key);
  }
})
```

## Security Checklist

Before deploying to production:

- [ ] Review all `VITE_*` environment variables
- [ ] Ensure no secrets are exposed
- [ ] Verify no database credentials are present
- [ ] Check for private keys or tokens
- [ ] Confirm only public API keys are exposed
- [ ] Test with `curl http://localhost:4173/env.js`
- [ ] Audit `window.__ENV__` in browser DevTools
- [ ] Review custom `expose` function logic
- [ ] Enable security headers
- [ ] Document which variables are expected

## Common Security Mistakes

### Mistake 1: Exposing Backend-Only Config

```bash
# ❌ Wrong
VITE_DATABASE_HOST=localhost
VITE_DATABASE_PORT=5432

# ✅ Right
# Keep database config server-side only
# Use API routes to access database
```

### Mistake 2: Copying .env Without Review

```bash
# ❌ Wrong - copied from backend .env
VITE_API_URL=https://api.example.com
VITE_JWT_SECRET=super-secret-token  # ❌ NEVER!

# ✅ Right - separate frontend env
VITE_API_URL=https://api.example.com
VITE_AUTH_DOMAIN=auth.example.com
```

### Mistake 3: Using Generic Prefix

```typescript
// ❌ Wrong - too broad
productionServer({
  envPrefix: ''  // Exposes ALL environment variables!
})

// ✅ Right - specific prefix
productionServer({
  envPrefix: 'VITE_'
})
```

## Incident Response

If you accidentally exposed a secret:

1. **Revoke the exposed credential immediately**
   - Rotate API keys
   - Change passwords
   - Revoke tokens

2. **Remove from environment**
   - Delete from server env
   - Update from CI/CD
   - Remove from Docker/Kubernetes configs

3. **Audit access logs**
   - Check if the exposed value was accessed
   - Look for unusual API activity

4. **Update security practices**
   - Review the checklist above
   - Implement stricter filtering
   - Add environment variable auditing

## Next Steps

- [Configuration](../configuration/plugin-options.md) — Configure filtering options
- [Troubleshooting](../troubleshooting/common-issues.md) — Fix security-related issues