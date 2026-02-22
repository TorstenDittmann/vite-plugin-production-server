# Installation

## Requirements

- **Node.js**: 16.x or higher
- **Vite**: 4.x, 5.x, or 6.x
- **Package Manager**: npm, yarn, pnpm, or bun

## Package Installation

Install the package using your preferred package manager:

**npm:**
```bash
npm install vite-plugin-production-server
```

**yarn:**
```bash
yarn add vite-plugin-production-server
```

**pnpm:**
```bash
pnpm add vite-plugin-production-server
```

**bun:**
```bash
bun add vite-plugin-production-server
```

## Peer Dependencies

This package has Vite as a peer dependency. Make sure you have Vite installed in your project:

```bash
npm install vite
```

## TypeScript Support

If you're using TypeScript, add the type declarations to your project:

### Option 1: Add to vite-env.d.ts (Recommended)

Create or update `src/vite-env.d.ts`:

```typescript
/// <reference types="vite/client" />
/// <reference types="vite-plugin-production-server/env" />
```

### Option 2: Add to tsconfig.json

Add to your `compilerOptions.types` array:

```json
{
  "compilerOptions": {
    "types": ["vite-plugin-production-server/env"]
  }
}
```

### Option 3: Import types directly

Import types where needed:

```typescript
import type { ImportMetaEnvLike } from 'vite-plugin-production-server';
```

## Verification

After installation, verify the package is installed correctly:

```bash
# Check package version
npm list vite-plugin-production-server

# Verify CLI is available
npx vite-production-server --help

# Or use the shorter alias
npx vps --help
```

You should see the CLI help output with available options.

## Next Steps

Now that you've installed the package:

- [Quick Start](./quick-start.md) — Build your first app with runtime env vars
- [Plugin Options](../configuration/plugin-options.md) — Configure the Vite plugin
- [How It Works](../core-concepts/how-it-works.md) — Understand the architecture