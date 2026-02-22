# Basic SPA Example

Complete working example of a Single Page Application using vite-plugin-production-server.

## Project Structure

```
my-app/
├── src/
│   ├── main.ts
│   ├── vite-env.d.ts
│   └── style.css
├── dist/               # Build output
├── vite.config.ts
├── package.json
└── tsconfig.json
```

## Setup

### 1. Create Project

```bash
mkdir my-app
cd my-app
npm init -y
```

### 2. Install Dependencies

```bash
npm install vite vite-plugin-production-server typescript
```

### 3. Create Files

**vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import productionServer from 'vite-plugin-production-server';

export default defineConfig({
  plugins: [productionServer()],
});
```

**src/vite-env.d.ts**

```typescript
/// <reference types="vite/client" />
/// <reference types="vite-plugin-production-server/env" />

interface ImportMetaEnvLike {
  readonly VITE_APP_NAME: string;
  readonly VITE_API_URL: string;
  readonly VITE_FEATURE_DARK_MODE?: string;
}
```

**src/main.ts**

```typescript
import env from 'virtual:import-meta-env';
import './style.css';

// Set page title
document.title = env.VITE_APP_NAME || 'My App';

// Create app UI
const app = document.createElement('div');
app.id = 'app';

app.innerHTML = `
  <div class="container">
    <h1>${env.VITE_APP_NAME || 'My App'}</h1>
    
    <div class="card">
      <h2>Environment</h2>
      <ul>
        <li><strong>Mode:</strong> ${env.MODE}</li>
        <li><strong>API URL:</strong> ${env.VITE_API_URL || 'Not set'}</li>
        <li><strong>Dev Mode:</strong> ${env.DEV}</li>
        <li><strong>Prod Mode:</strong> ${env.PROD}</li>
      </ul>
    </div>
    
    <div class="card">
      <h2>Feature Flags</h2>
      <p>Dark Mode: ${env.VITE_FEATURE_DARK_MODE === 'true' ? '✅ Enabled' : '❌ Disabled'}</p>
    </div>
    
    <div class="card">
      <h2>Test Configuration</h2>
      <button id="testBtn">Test API Connection</button>
      <div id="result"></div>
    </div>
  </div>
`;

document.body.appendChild(app);

// Test button handler
document.getElementById('testBtn')?.addEventListener('click', async () => {
  const resultDiv = document.getElementById('result');
  if (!resultDiv) return;
  
  resultDiv.innerHTML = 'Loading...';
  
  try {
    if (!env.VITE_API_URL) {
      resultDiv.innerHTML = '<span class="error">VITE_API_URL not set</span>';
      return;
    }
    
    const response = await fetch(`${env.VITE_API_URL}/health`);
    const data = await response.json();
    
    resultDiv.innerHTML = `
      <span class="success">✅ Connected!</span>
      <pre>${JSON.stringify(data, null, 2)}</pre>
    `;
  } catch (error) {
    resultDiv.innerHTML = `
      <span class="error">❌ Error: ${error.message}</span>
    `;
  }
});
```

**src/style.css**

```css
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding: 2rem;
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  color: white;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2.5rem;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card h2 {
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.25rem;
}

.card ul {
  list-style: none;
}

.card li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.card li:last-child {
  border-bottom: none;
}

button {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;
}

button:hover {
  background: #5568d3;
}

.success {
  color: #22c55e;
}

.error {
  color: #ef4444;
}

pre {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 6px;
  margin-top: 1rem;
  overflow-x: auto;
}
```

**index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My App</title>
  </head>
  <body>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

**package.json**

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "serve": "vite-production-server dist"
  },
  "dependencies": {
    "vite": "^5.0.0",
    "vite-plugin-production-server": "^0.1.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

**tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

## Running the Example

### Development

```bash
npm run dev
```

### Build and Serve

```bash
# Build
npm run build

# Serve with environment variables
VITE_APP_NAME="My Production App" \
VITE_API_URL="https://api.example.com" \
VITE_FEATURE_DARK_MODE=true \
npm run serve
```

### Testing Different Configurations

```bash
# Terminal 1: Production config
VITE_APP_NAME="Production App" \
VITE_API_URL="https://api.prod.com" \
npm run serve

# Terminal 2: Staging config (same build!)
VITE_APP_NAME="Staging App" \
VITE_API_URL="https://api.staging.com" \
npm run serve -- --port 3001
```

## What This Demonstrates

1. **Runtime Configuration**: Change env vars without rebuild
2. **TypeScript Support**: Full type definitions
3. **Feature Flags**: Toggle features with env vars
4. **API Integration**: Dynamic API URLs
5. **Dev/Prod Parity**: Same code works in both environments

## Next Steps

- [Basic Usage](../usage-guides/basic-usage.md) — Usage patterns and best practices
- [Migration Guide](../usage-guides/migration.md) — Migrate existing Vite apps