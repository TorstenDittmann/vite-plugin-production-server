import { 
  resolveOptions, 
  generateEnvJsPayload,
  hasEnvScript,
  normalizeEnvPrefix
} from './env-generator.js';

const VIRTUAL_IMPORT_META_ENV = 'virtual:import-meta-env';
const VIRTUAL_RUNTIME_ENV = 'virtual:runtime-env';
const RESOLVED_VIRTUAL_IMPORT_META_ENV = '\0' + VIRTUAL_IMPORT_META_ENV;
const RESOLVED_VIRTUAL_RUNTIME_ENV = '\0' + VIRTUAL_RUNTIME_ENV;

/**
 * Generate code for virtual:import-meta-env
 * Returns a proxy that reads from window.__ENV__
 * @param {string} globalName
 * @returns {string}
 */
function generateImportMetaEnvCode(globalName) {
  return `
const globalName = "${globalName}";
const store = (typeof globalThis !== 'undefined' && globalThis[globalName]) || 
              (typeof window !== 'undefined' && window[globalName]) || 
              {};

export default new Proxy(store, {
  get(target, prop) {
    return target[prop];
  }
});
`;
}

/**
 * Generate code for virtual:runtime-env
 * Returns helper functions for accessing env
 * @param {string} globalName
 * @returns {string}
 */
function generateRuntimeEnvCode(globalName) {
  return `
const globalName = "${globalName}";
let store = (typeof globalThis !== 'undefined' && globalThis[globalName]) || 
            (typeof window !== 'undefined' && window[globalName]) || 
            {};

export function getEnv() {
  return store;
}

export function env(key) {
  return store[key];
}

export function envOrThrow(key) {
  const val = store[key];
  if (val === undefined) {
    throw new Error(\`Missing env var: \${key}\`);
  }
  return val;
}

export function refreshEnv() {
  // Re-read from global in case it was updated
  const updated = (typeof globalThis !== 'undefined' && globalThis[globalName]) || 
                  (typeof window !== 'undefined' && window[globalName]) || 
                  {};
  Object.assign(store, updated);
}
`;
}

/**
 * Create the Vite plugin
* @param {import('./types.ts').ProductionServerPluginOptions} [options={}]
* @returns {import('vite').Plugin}
 */
export default function productionServerPlugin(options = {}) {
  /** @type {import('./types.ts').ResolvedProductionServerOptions} */
  let resolvedOptions;
  /** @type {import('vite').ResolvedConfig} */
  let viteConfig;
  let isDev = false;

  return {
    name: 'vite-plugin-production-server',
    
    /**
     * @param {import('vite').ResolvedConfig} config
     */
    configResolved(config) {
      viteConfig = config;
      isDev = config.command === 'serve';
      
      // Merge plugin options with Vite config
      const mergedOptions = {
        ...options,
        defaults: {
          mode: options.defaults?.mode ?? config.mode,
          baseUrl: options.defaults?.baseUrl ?? config.base,
        },
      };
      
      resolvedOptions = resolveOptions(mergedOptions);
    },

    /**
     * @param {string} id
     * @returns {string | null}
     */
    resolveId(id) {
      if (id === VIRTUAL_IMPORT_META_ENV) {
        return RESOLVED_VIRTUAL_IMPORT_META_ENV;
      }
      if (id === VIRTUAL_RUNTIME_ENV) {
        return RESOLVED_VIRTUAL_RUNTIME_ENV;
      }
      return null;
    },

    /**
     * @param {string} id
     * @returns {string | null}
     */
    load(id) {
      if (id === RESOLVED_VIRTUAL_IMPORT_META_ENV) {
        return generateImportMetaEnvCode(resolvedOptions.globalName);
      }
      if (id === RESOLVED_VIRTUAL_RUNTIME_ENV) {
        return generateRuntimeEnvCode(resolvedOptions.globalName);
      }
      return null;
    },

    transformIndexHtml: {
      order: 'pre',
      /**
       * @param {string} html
       * @returns {string}
       */
      handler(html) {
        if (options.injectEnvScript === false) {
          return html;
        }

        // Check if already injected
        if (hasEnvScript(html, resolvedOptions.envJsPath)) {
          return html;
        }

        // Build script tag with proper base path
        const base = viteConfig.base || '/';
        const envPath = resolvedOptions.envJsPath.startsWith('/') 
          ? resolvedOptions.envJsPath 
          : '/' + resolvedOptions.envJsPath;
        const fullPath = base === '/' ? envPath : base.replace(/\/$/, '') + envPath;
        
        const scriptTag = `<script src="${fullPath}"></script>`;

        // Inject into HTML
        const injectPosition = options.injectPosition ?? 'head-prepend';
        
        if (injectPosition === 'head-append') {
          // Before closing </head>
          if (html.includes('</head>')) {
            return html.replace('</head>', `${scriptTag}</head>`);
          }
        } else {
          // head-prepend: after opening <head>
          if (html.includes('<head>')) {
            return html.replace('<head>', `<head>${scriptTag}`);
          }
          // Fallback: add head with script
          return html.replace('<html>', `<html><head>${scriptTag}</head>`);
        }

        return html;
      },
    },

    /**
     * @param {import('vite').ViteDevServer} server
     */
    configureServer(server) {
      if (!isDev || options.devMiddleware === false) {
        return;
      }

      // Add dev middleware for env.js
      server.middlewares.use((req, res, next) => {
        const url = req.url || '/';
        
        if (url === resolvedOptions.envJsPath) {
          // Generate env from Vite's import.meta.env
          /** @type {Record<string, string | undefined>} */
          const viteEnv = {};
          
          // Copy Vite's env vars
          const envPrefixes = normalizeEnvPrefix(resolvedOptions.envPrefix);
          
          // In dev, we use Vite's env system
          // We need to access the env from the config
          const rawEnv = import.meta.env || {};
          
          for (const [key, value] of Object.entries(rawEnv)) {
            if (envPrefixes.some(prefix => key.startsWith(prefix))) {
              viteEnv[key] = String(value);
            }
          }
          
          // Add meta flags
          /** @type {import('./types.ts').ImportMetaEnvLike} */
          const envObj = {
            MODE: viteConfig.mode,
            BASE_URL: viteConfig.base,
            DEV: viteConfig.mode !== 'production',
            PROD: viteConfig.mode === 'production',
            SSR: false,
            ...viteEnv,
          };

          const payload = generateEnvJsPayload(envObj, resolvedOptions.globalName);
          
          res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
          res.setHeader('Cache-Control', 'no-store');
          res.end(payload);
          return;
        }

        // Optional config.json endpoint
        if (resolvedOptions.configJsonPath && url === resolvedOptions.configJsonPath) {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.setHeader('Cache-Control', 'no-store');
          res.end(JSON.stringify({}));
          return;
        }

        next();
      });
    },
  };
}
