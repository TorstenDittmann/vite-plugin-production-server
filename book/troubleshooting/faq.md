# FAQ

Frequently asked questions about vite-plugin-production-server.

## General Questions

### What is vite-plugin-production-server?

A Vite plugin and production server that enables runtime-configurable environment variables for Single Page Applications (SPAs) without requiring rebuilds.

### Why not just use import.meta.env?

`import.meta.env` embeds variables at build time. vite-plugin-production-server serves them at runtime, allowing you to:
- Use the same build across different environments
- Change configuration without rebuilding
- Deploy Docker images anywhere

### Is it compatible with Vite 4/5/6?

Yes! It supports Vite 4.x, 5.x, and 6.x.

### Does it work with SSR?

Currently focused on SPAs. SSR support is planned for future releases.

## Installation & Setup

### Do I need to install anything globally?

No, but the CLI is available globally if installed with `-g`:

```bash
npm install -g vite-plugin-production-server
vite-production-server dist
```

Or use npx:

```bash
npx vite-production-server dist
```

### Can I use it with existing Vite projects?

Yes! It's designed as a drop-in replacement. See [Migration Guide](../usage-guides/migration.md).

### Does it work with TypeScript?

Yes, full TypeScript support with type definitions included.

## Environment Variables

### How are variables exposed?

By prefix (default: `VITE_*`). Configure with:

```typescript
productionServer({
  envPrefix: ['VITE_', 'PUBLIC_']
})
```

### Can I expose variables without prefix?

Yes, but not recommended for security:

```typescript
productionServer({
  envPrefix: '',
  expose: (key) => key !== 'SECRET_KEY'
})
```

### What about .env files?

`.env` files work in development (Vite loads them). In production, pass variables when starting the server:

```bash
VITE_API_URL=https://api.com vite-production-server dist
```

### Can I change variables without restarting?

Not currently. You need to restart the server to pick up new environment variable values.

## Security

### Are environment variables secure?

**No** — all exposed variables are public and visible in the browser. Never expose:
- API secrets
- Database passwords
- Private keys

Only expose public configuration like API URLs and public keys.

### How do I prevent exposing secrets?

1. Use prefix filtering (default blocks non-VITE vars)
2. Add custom filter:
   ```typescript
   productionServer({
     expose: (key) => !key.includes('SECRET')
   })
   ```

3. Regularly audit `/env.js` endpoint

### Can I encrypt environment variables?

Not built-in. The plugin focuses on runtime configuration, not encryption. Consider:
- Server-side API calls for sensitive operations
- Environment-specific builds for sensitive apps

## Production

### Do I need a reverse proxy?

Recommended for production. The built-in server is great for:
- Development
- Docker containers
- Simple deployments

For production with HTTPS, use nginx, Caddy, or similar.

### Can I use it with PM2?

Yes:

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'my-app',
    script: './node_modules/.bin/vite-production-server',
    args: 'dist --port 3000',
    env: {
      VITE_API_URL: 'https://api.example.com'
    }
  }]
};
```

### How do I handle HTTPS?

Use a reverse proxy (nginx, Caddy, Traefik) for HTTPS termination:

```nginx
# nginx
server {
  listen 443 ssl;
  ssl_certificate /path/to/cert.pem;
  ssl_certificate_key /path/to/key.pem;
  
  location / {
    proxy_pass http://localhost:4173;
  }
}
```

## Docker & Deployment

### Why use this with Docker?

Build the image once, configure at runtime:

```dockerfile
# Build
RUN npm run build

# Configure at runtime
CMD ["vite-production-server", "dist"]
```

```bash
# Same image, different configs
docker run -e VITE_API_URL=api1.com myapp
docker run -e VITE_API_URL=api2.com myapp
```

### Can I use it with Kubernetes?

Yes! Use ConfigMaps for configuration:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  VITE_API_URL: "https://api.example.com"
---
apiVersion: apps/v1
kind: Deployment
spec:
  template:
    spec:
      containers:
      - name: app
        envFrom:
        - configMapRef:
            name: app-config
```

### Does it work with serverless (Vercel, Netlify)?

Not directly — it's a Node.js server. For serverless:
- Use Vercel/Netlify's built-in env var handling
- Or deploy the Docker container to platforms supporting it

## Troubleshooting

### Why is my variable undefined?

Check:
1. Correct prefix (default: `VITE_*`)
2. Variable exported in server environment
3. `/env.js` endpoint is accessible
4. `window.__ENV__` is populated

### Why doesn't it work in production?

Ensure:
1. Using `vite-production-server` (not `vite preview`)
2. Environment variables set when starting server
3. Built with `vite build` first

### How do I debug?

```javascript
// In browser console
console.log(window.__ENV__);

# Or via curl
curl http://localhost:4173/env.js
```

## Performance

### Is it fast?

Yes! Environment variables are served as a tiny JavaScript file:
- Build time: No overhead (just HTML transformation)
- Runtime: Simple object property access
- Server: < 1ms to generate env.js

### Does it cache env.js?

No — it's served with `no-cache` headers to ensure fresh values on each request.

### Can I use a CDN?

Static assets (JS, CSS) can be on a CDN. The `env.js` and `index.html` should be served by the production server.

## Comparison

### vs. Vite's built-in preview?

| Feature | Vite Preview | vite-plugin-production-server |
|---------|--------------|-------------------------------|
| Runtime env vars | ❌ | ✅ |
| Production-grade | ❌ | ✅ |
| Security headers | ❌ | ✅ |
| SPA fallback | ✅ | ✅ |

### vs. nginx?

| Feature | nginx | vite-plugin-production-server |
|---------|-------|-------------------------------|
| Static files | ✅ | ✅ |
| Runtime env vars | ❌ | ✅ |
| Easy setup | ❌ | ✅ |
| Production-ready | ✅ | ⚠️ (use with reverse proxy) |

## Contributing

### How can I contribute?

- Report bugs on GitHub
- Submit feature requests
- Improve documentation
- Share your use cases

### Is it open source?

Yes! MIT licensed.

## Next Steps

- [Quick Start](../getting-started/quick-start.md) — Get started
- [Common Issues](./common-issues.md) — Troubleshooting
- [Examples](../examples/basic-spa.md) — Working examples