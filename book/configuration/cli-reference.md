# CLI Reference

Complete reference for the `vite-production-server` and `vps` command-line interfaces.

## Commands

### vite-production-server

Main command for serving production builds with runtime environment variables.

```bash
vite-production-server [distDir] [options]
```

### vps (Alias)

Shorter alias for the same command.

```bash
vps [distDir] [options]
```

## Arguments

### dist

**Type:** `string` (positional)  
**Default:** `'dist'`

The directory containing your built Vite application.

```bash
# Use default dist directory
vite-production-server

# Specify custom directory
vite-production-server build
vite-production-server ./output
```

## Options

### --port

**Type:** `number`  
**Default:** `4173`

Port to listen on.

```bash
vite-production-server --port 3000
vite-production-server --port 8080
```

### --host

**Type:** `string`  
**Default:** `'0.0.0.0'`

Host to bind to. Use `127.0.0.1` to only accept local connections.

```bash
# Accept connections from any interface
vite-production-server --host 0.0.0.0

# Local only
vite-production-server --host 127.0.0.1

# Specific interface
vite-production-server --host 192.168.1.100
```

### --base

**Type:** `string`  
**Default:** `'/'`

Base URL path for the application.

```bash
vite-production-server --base /app/
vite-production-server --base /my-app/
```

### --env-prefix

**Type:** `string`  
**Default:** `'VITE_'`

Prefix for environment variables to expose. Use commas for multiple prefixes.

```bash
# Single prefix
vite-production-server --env-prefix APP_

# Multiple prefixes
vite-production-server --env-prefix "VITE_,PUBLIC_,APP_"
```

### --env-js-path

**Type:** `string`  
**Default:** `'/env.js'`

Path for the env.js endpoint.

```bash
vite-production-server --env-js-path /config/env.js
```

### --config-json-path

**Type:** `string`  
**Default:** `undefined`

Path for the optional config.json endpoint.

```bash
vite-production-server --config-json-path /api/config.json
```

### --no-spa-fallback

**Type:** `boolean`  
**Default:** `false`

Disable SPA fallback to index.html. Useful for API-only servers or when you have specific routing needs.

```bash
vite-production-server --no-spa-fallback
```

### --no-log

**Type:** `boolean`  
**Default:** `false`

Disable request logging.

```bash
vite-production-server --no-log
```

## Environment Variables

Pass environment variables when starting the server:

```bash
# Basic usage
VITE_API_URL=https://api.example.com vite-production-server

# Multiple variables
VITE_API_URL=https://api.example.com \
VITE_APP_NAME="My App" \
VITE_PUBLIC_KEY=pk_live_... \
vite-production-server

# With options
VITE_API_URL=https://api.example.com \
vite-production-server --port 3000 --env-prefix "APP_"
```

## Usage Examples

### Basic Development Server

```bash
# Build your app
vite build

# Serve with default settings
vite-production-server

# App available at http://localhost:4173
```

### Custom Port

```bash
vite build
vite-production-server --port 3000
# App available at http://localhost:3000
```

### Production Deployment

```bash
# Build for production
vite build

# Start server with production config
VITE_API_URL=https://api.example.com \
VITE_APP_NAME="Production App" \
VITE_ANALYTICS_KEY=UA-XXXXX \
vite-production-server --port 80 --host 0.0.0.0
```

### Docker Deployment

```bash
# Inside Docker container
vite-production-server --port 3000 --host 0.0.0.0
```

With environment variables from Docker:

```dockerfile
ENV VITE_API_URL=https://api.example.com
CMD ["vite-production-server", "--port", "3000", "--host", "0.0.0.0"]
```

### Different Prefixes

```bash
# Expose APP_ and PUBLIC_ variables
vite-production-server --env-prefix "APP_,PUBLIC_"

# Now APP_API_URL and PUBLIC_KEY are available
```

### Subdirectory Deployment

```bash
# App served from /app/ subdirectory
vite-production-server --base /app/ --port 3000

# Access at http://localhost:3000/app/
```

## Programmatic Usage

While the CLI is convenient, you can also start the server programmatically:

```typescript
import { startProductionServer } from 'vite-plugin-production-server';

await startProductionServer({
  distDir: 'dist',
  port: 3000,
  host: '0.0.0.0',
  envPrefix: 'VITE_'
});
```

See [Server API](../api-reference/server-api.md) for the complete programmatic API.

## Common Patterns

### Development vs Production

```json
// package.json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "serve": "vite-production-server dist"
  }
}
```

### Environment-Specific Scripts

```json
// package.json
{
  "scripts": {
    "serve:dev": "VITE_API_URL=http://localhost:3000 vite-production-server",
    "serve:staging": "VITE_API_URL=https://staging.api.com vite-production-server",
    "serve:prod": "VITE_API_URL=https://api.example.com vite-production-server --port 80"
  }
}
```

## Troubleshooting

### Port Already in Use

```bash
# Error: Port 4173 is already in use
vite-production-server --port 3000  # Use different port
```

### Environment Variables Not Working

```bash
# Make sure variables are exported
export VITE_API_URL=https://api.example.com
vite-production-server

# Or pass inline (single command)
VITE_API_URL=https://api.example.com vite-production-server
```

### Permission Denied (Port 80)

```bash
# Ports below 1024 require root/admin
sudo VITE_API_URL=https://api.example.com vite-production-server --port 80

# Or use a higher port with reverse proxy
VITE_API_URL=https://api.example.com vite-production-server --port 3000
# Then use nginx/caddy to proxy 80 -> 3000
```

## Help

View all available options:

```bash
vite-production-server --help
vps --help
```

## Next Steps

- [Plugin Options](./plugin-options.md) — Vite plugin configuration
- [Examples](../examples/basic-spa.md) — Complete working example