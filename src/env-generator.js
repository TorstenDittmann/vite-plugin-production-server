/**
 * Normalize env prefix to array
 * @param {string | string[] | undefined} prefix
 * @returns {string[]}
 */
export function normalizeEnvPrefix(prefix) {
  if (!prefix) return ['VITE_'];
  return Array.isArray(prefix) ? prefix : [prefix];
}

/**
 * Filter environment variables by prefix and expose function
 * @param {Record<string, string | undefined>} env
 * @param {Pick<import('./types.ts').ResolvedProductionServerOptions, 'envPrefix' | 'expose'>} options
 * @returns {Record<string, string>}
 */
export function filterEnvVars(env, options) {
  /** @type {Record<string, string>} */
  const result = {};
  
  for (const [key, value] of Object.entries(env)) {
    // Skip undefined values
    if (value === undefined) continue;
    
    // Check if key matches any prefix
    const matchesPrefix = options.envPrefix.some(prefix => key.startsWith(prefix));
    
    // Check custom expose function if provided
    const customExpose = options.expose ? options.expose(key, value) : true;
    
    if (matchesPrefix && customExpose) {
      result[key] = value;
    }
  }
  
  return result;
}

/**
 * Generate the complete env object with meta flags
 * @param {Record<string, string | undefined>} processEnv
 * @param {Pick<import('./types.ts').ResolvedProductionServerOptions, 'envPrefix' | 'expose' | 'defaults' | 'includeMetaFlags' | 'base'>} options
 * @returns {import('./types.ts').ImportMetaEnvLike}
 */
export function generateEnvObject(processEnv, options) {
  /** @type {import('./types.ts').ImportMetaEnvLike} */
  const env = {
    MODE: options.defaults?.mode || 'production',
    BASE_URL: options.base || options.defaults?.baseUrl || '/',
    DEV: false,
    PROD: true,
    SSR: false,
  };
  
  // Add filtered env vars
  const filtered = filterEnvVars(processEnv, {
    envPrefix: options.envPrefix,
    expose: options.expose,
  });
  
  Object.assign(env, filtered);
  
  return env;
}

/**
 * Generate the JavaScript payload for window assignment
 * @param {import('./types.ts').ImportMetaEnvLike} env
 * @param {string} globalName
 * @returns {string}
 */
export function generateEnvJsPayload(env, globalName) {
  const envJson = JSON.stringify(env, null, 2);
  return `window["${globalName}"] = ${envJson};`;
}

/**
 * Generate the JSON payload
 * @param {Record<string, string | undefined>} processEnv
 * @param {Pick<import('./types.ts').ResolvedProductionServerOptions, 'envPrefix' | 'expose' | 'defaults' | 'includeMetaFlags' | 'base'>} options
 * @returns {string}
 */
export function generateConfigJson(processEnv, options) {
  const env = generateEnvObject(processEnv, options);
  return JSON.stringify(env, null, 2);
}

/**
 * Check if options are server options (has distDir)
 * @param {import('./types.ts').ProductionServerPluginOptions | import('./types.ts').ProductionServerOptions | undefined} options
 * @returns {options is import('./types.ts').ProductionServerOptions}
 */
function isServerOptions(options) {
  return options !== undefined && 'distDir' in options;
}

/**
 * Resolve and merge options with defaults
 * @param {import('./types.ts').ProductionServerPluginOptions | import('./types.ts').ProductionServerOptions} [options]
 * @returns {import('./types.ts').ResolvedProductionServerOptions}
 */
export function resolveOptions(options) {
  const baseDefaults = {
    mode: 'production',
    baseUrl: '/',
  };
  
  const cacheDefaults = {
    html: 'no-cache, no-store',
    assets: 'public, max-age=31536000, immutable',
    other: 'public, max-age=0',
  };
  
  const isServer = isServerOptions(options);
  
  /** @type {import('./types.ts').ResolvedProductionServerOptions} */
  const resolved = {
    distDir: isServer ? options.distDir ?? 'dist' : 'dist',
    port: isServer ? options.port ?? 4173 : 4173,
    host: isServer ? options.host ?? '0.0.0.0' : '0.0.0.0',
    base: isServer ? options.base ?? '/' : options?.defaults?.baseUrl ?? '/',
    spaFallback: isServer ? options.spaFallback ?? true : true,
    envPrefix: normalizeEnvPrefix(options?.envPrefix),
    envJsPath: options?.envJsPath ?? '/env.js',
    configJsonPath: options?.configJsonPath ?? null,
    globalName: options?.globalName ?? '__ENV__',
    cacheControl: {
      html: isServer && options.cacheControl?.html ? options.cacheControl.html : cacheDefaults.html,
      assets: isServer && options.cacheControl?.assets ? options.cacheControl.assets : cacheDefaults.assets,
      other: isServer && options.cacheControl?.other ? options.cacheControl.other : cacheDefaults.other,
    },
    log: isServer ? options.log ?? true : true,
    expose: options?.expose,
    headers: isServer ? options.headers : undefined,
    defaults: {
      mode: options?.defaults?.mode ?? baseDefaults.mode,
      baseUrl: options?.defaults?.baseUrl ?? baseDefaults.baseUrl,
    },
    includeMetaFlags: options?.includeMetaFlags ?? true,
  };
  
  return resolved;
}

/**
 * Check if a script tag for env.js already exists in HTML
 * @param {string} html
 * @param {string} envJsPath
 * @returns {boolean}
 */
export function hasEnvScript(html, envJsPath) {
  // Normalize path for comparison
  const normalizedPath = envJsPath.startsWith('/') ? envJsPath : `/${envJsPath}`;
  const patterns = [
    new RegExp(`src=["']${normalizedPath}["']`, 'i'),
    new RegExp(`src=["'].${normalizedPath}["']`, 'i'),
  ];
  
  return patterns.some(pattern => pattern.test(html));
}
